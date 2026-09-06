import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { QpayClient } from "./qpay";

const PREMIUM_MONTHLY_PRICE_MNT = 12990;
const PREMIUM_PLAN_CODE = "premium_monthly";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly qpay: QpayClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.qpay = new QpayClient(config);
  }

  private price() {
    return Number(this.config.get("PREMIUM_MONTHLY_PRICE_MNT") ?? PREMIUM_MONTHLY_PRICE_MNT);
  }

  private brand() {
    return this.config.get<string>("BRAND_NAME") ?? "negun";
  }

  async createSubscription(userId: string) {
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
    });
    if (existing) return { alreadyActive: true, subscription: existing };

    const amount = this.price();
    const payment = await this.prisma.payment.create({
      data: { userId, kind: "SUBSCRIPTION", amountMnt: amount, status: "PENDING" },
    });

    return this.issueInvoice(payment.id, amount, `${this.brand()} Premium`);
  }

  async createPpv(userId: string, titleId: string) {
    const title = await this.prisma.title.findUnique({ where: { id: titleId } });
    if (!title) throw new NotFoundException("Контент олдсонгүй");
    if (title.accessType !== "PPV") {
      throw new BadRequestException("Энэ контент PPV биш");
    }

    const owned = await this.prisma.purchase.findFirst({
      where: { userId, titleId, status: "PAID" },
    });
    if (owned) return { alreadyOwned: true };

    await this.prisma.purchase.upsert({
      where: { userId_titleId: { userId, titleId } },
      update: { status: "PENDING", priceMnt: title.ppvPriceMnt },
      create: { userId, titleId, status: "PENDING", priceMnt: title.ppvPriceMnt },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        kind: "PPV",
        amountMnt: title.ppvPriceMnt,
        status: "PENDING",
        titleId,
      },
    });

    return this.issueInvoice(payment.id, title.ppvPriceMnt, `${this.brand()} · ${title.title}`);
  }

  async getStatus(userId: string, role: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();
    if (role !== "ADMIN" && payment.userId !== userId) {
      throw new BadRequestException("Энэ төлбөрийг харах эрхгүй");
    }

    if (payment.status === "PENDING" && payment.qpayInvoiceId) {
      await this.confirmIfPaid(payment.id, payment.qpayInvoiceId, payment.amountMnt);
    }

    const latest = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    return {
      paymentId: latest.id,
      status: latest.status,
      amountMnt: latest.amountMnt,
      kind: latest.kind,
    };
  }

  async simulate(userId: string, role: string, paymentId: string) {
    if (this.qpay.configured()) {
      throw new BadRequestException("QPay идэвхтэй үед simulate ашиглах боломжгүй");
    }
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();
    if (role !== "ADMIN" && payment.userId !== userId) {
      throw new BadRequestException("Энэ төлбөрийг баталгаажуулах эрхгүй");
    }
    return this.fulfill(paymentId, { simulated: true });
  }

  async fulfill(paymentId: string, raw?: unknown) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();
    if (payment.status === "PAID") return { ok: true, already: true };

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", rawPayload: raw as object },
    });

    if (payment.kind === "SUBSCRIPTION") {
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      await this.prisma.subscription.create({
        data: {
          userId: payment.userId,
          status: "ACTIVE",
          planCode: PREMIUM_PLAN_CODE,
          currentPeriodEnd: end,
          qpayInvoiceId: payment.qpayInvoiceId,
        },
      });
    }

    if (payment.kind === "PPV" && payment.titleId) {
      await this.prisma.purchase.upsert({
        where: { userId_titleId: { userId: payment.userId, titleId: payment.titleId } },
        update: { status: "PAID", priceMnt: payment.amountMnt },
        create: {
          userId: payment.userId,
          titleId: payment.titleId,
          status: "PAID",
          priceMnt: payment.amountMnt,
        },
      });
    }

    return { ok: true };
  }

  async handleCallback(body: Record<string, unknown>) {
    const invoiceId = String(
      body.invoice_id ?? body.sender_invoice_no ?? body.payment_id ?? body.qpay_payment_id ?? "",
    );
    if (!invoiceId) {
      this.logger.warn("QPay callback missing invoice id");
      return { ok: true, ignored: true };
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ qpayInvoiceId: invoiceId }, { id: invoiceId }],
      },
    });
    if (!payment) {
      this.logger.warn(`QPay callback unknown invoice ${invoiceId}`);
      return { ok: true, ignored: true };
    }
    if (payment.status === "PAID") return { ok: true, already: true };

    const qpayInvoiceId = payment.qpayInvoiceId ?? invoiceId;
    const confirmed = await this.confirmIfPaid(payment.id, qpayInvoiceId, payment.amountMnt, body);
    return confirmed ?? { ok: true, pending: true };
  }

  private async issueInvoice(paymentId: string, amount: number, description: string) {
    if (!this.qpay.configured()) {
      return {
        mock: true,
        paymentId,
        amountMnt: amount,
        qrText: `MOCK-${paymentId}`,
        simulateUrl: `/v1/payments/simulate/${paymentId}`,
      };
    }

    try {
      const invoice = await this.qpay.createInvoice({
        amount,
        senderInvoiceNo: paymentId,
        description,
      });
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { qpayInvoiceId: invoice.invoice_id },
      });
      return {
        mock: false,
        paymentId,
        amountMnt: amount,
        invoiceId: invoice.invoice_id,
        qrText: invoice.qr_text,
        qrImage: invoice.qr_image,
        shortUrl: invoice.qPay_shortUrl ?? invoice.qpay_short_url,
        urls: invoice.urls,
      };
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException("QPay нэхэмжлэх үүсгэж чадсангүй");
    }
  }

  private async confirmIfPaid(
    paymentId: string,
    invoiceId: string,
    amountMnt: number,
    raw?: unknown,
  ) {
    try {
      const check = await this.qpay.checkPayment(invoiceId);
      const paid =
        Number(check.count ?? 0) > 0 &&
        (check.paid_amount == null || Number(check.paid_amount) >= amountMnt);
      if (!paid) return null;
      return this.fulfill(paymentId, raw ?? check);
    } catch (err) {
      this.logger.error(`QPay payment check failed for ${invoiceId}: ${String(err)}`);
      return null;
    }
  }
}
