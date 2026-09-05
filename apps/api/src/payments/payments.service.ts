import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const PREMIUM_MONTHLY_PRICE_MNT = 12990;
const PREMIUM_PLAN_CODE = "premium_monthly";
import { PrismaService } from "../prisma/prisma.service";

type QpayInvoice = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  urls?: { name: string; description: string; link: string }[];
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private qpayToken: { access: string; exp: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private price() {
    return Number(this.config.get("PREMIUM_MONTHLY_PRICE_MNT") ?? PREMIUM_MONTHLY_PRICE_MNT);
  }

  private configured() {
    return Boolean(this.config.get("QPAY_USERNAME") && this.config.get("QPAY_PASSWORD"));
  }

  private async qpayAuth(): Promise<string> {
    if (this.qpayToken && this.qpayToken.exp > Date.now()) return this.qpayToken.access;
    const base = this.config.getOrThrow("QPAY_BASE_URL");
    const user = this.config.getOrThrow("QPAY_USERNAME");
    const pass = this.config.getOrThrow("QPAY_PASSWORD");
    const res = await fetch(`${base}/auth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
      },
    });
    if (!res.ok) throw new Error("QPay auth failed");
    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.qpayToken = {
      access: data.access_token,
      exp: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
  }

  private async createQpayInvoice(amount: number, senderInvoiceNo: string, callback: string) {
    const token = await this.qpayAuth();
    const base = this.config.getOrThrow("QPAY_BASE_URL");
    const res = await fetch(`${base}/invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: this.config.get("QPAY_INVOICE_CODE"),
        sender_invoice_no: senderInvoiceNo,
        invoice_receiver_code: "terminal",
        invoice_description: "negun",
        amount,
        callback_url: callback,
      }),
    });
    if (!res.ok) {
      this.logger.error(await res.text());
      throw new BadRequestException("QPay нэхэмжлэх үүсгэж чадсангүй");
    }
    return (await res.json()) as QpayInvoice;
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

    if (!this.configured()) {
      return {
        mock: true,
        paymentId: payment.id,
        amountMnt: amount,
        qrText: `MOCK-SUB-${payment.id}`,
        simulateUrl: `/v1/payments/simulate/${payment.id}`,
      };
    }

    const invoice = await this.createQpayInvoice(
      amount,
      payment.id,
      this.config.get("QPAY_CALLBACK_URL") ?? "",
    );
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { qpayInvoiceId: invoice.invoice_id },
    });
    return {
      mock: false,
      paymentId: payment.id,
      amountMnt: amount,
      invoiceId: invoice.invoice_id,
      qrText: invoice.qr_text,
      qrImage: invoice.qr_image,
      urls: invoice.urls,
    };
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

    const purchase = await this.prisma.purchase.upsert({
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

    if (!this.configured()) {
      return {
        mock: true,
        paymentId: payment.id,
        purchaseId: purchase.id,
        amountMnt: title.ppvPriceMnt,
        qrText: `MOCK-PPV-${payment.id}`,
        simulateUrl: `/v1/payments/simulate/${payment.id}`,
      };
    }

    const invoice = await this.createQpayInvoice(
      title.ppvPriceMnt,
      payment.id,
      this.config.get("QPAY_CALLBACK_URL") ?? "",
    );
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { qpayInvoiceId: invoice.invoice_id },
    });
    return {
      mock: false,
      paymentId: payment.id,
      amountMnt: title.ppvPriceMnt,
      invoiceId: invoice.invoice_id,
      qrText: invoice.qr_text,
      qrImage: invoice.qr_image,
      urls: invoice.urls,
    };
  }

  async simulate(userId: string, role: string, paymentId: string) {
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
    const invoiceId = String(body.invoice_id ?? body.sender_invoice_no ?? "");
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ qpayInvoiceId: invoiceId }, { id: invoiceId }],
      },
    });
    if (!payment) {
      this.logger.warn(`QPay callback unknown invoice ${invoiceId}`);
      return { ok: true, ignored: true };
    }
    return this.fulfill(payment.id, body);
  }
}
