import { ConfigService } from "@nestjs/config";

export type QpayInvoice = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  qPay_shortUrl?: string;
  qpay_short_url?: string;
  urls?: { name: string; description?: string; logo?: string; link: string }[];
};

export type QpayPaymentRow = {
  payment_id?: string;
  payment_status?: string;
  payment_amount?: string | number;
};

export type QpayPaymentCheck = {
  count?: number;
  paid_amount?: number;
  rows?: QpayPaymentRow[];
};

export function isQpayInvoicePaid(check: QpayPaymentCheck, amountMnt: number): boolean {
  const rows = check.rows ?? [];
  const count = Number(check.count ?? rows.length);
  if (count <= 0 && rows.length === 0) return false;

  const paidRows = rows.filter((row) => {
    const status = String(row.payment_status ?? "").toUpperCase();
    return !status || status === "PAID" || status === "SUCCESS";
  });
  if (rows.length > 0 && paidRows.length === 0) return false;

  const paidAmount =
    check.paid_amount != null && Number(check.paid_amount) > 0
      ? Number(check.paid_amount)
      : paidRows.reduce((sum, row) => sum + Number(row.payment_amount ?? 0), 0);

  if (Number.isFinite(paidAmount) && paidAmount > 0) return paidAmount + 0.001 >= amountMnt;
  return count > 0 || paidRows.length > 0;
}

function trimEnv(value: string | undefined) {
  return value?.trim() ?? "";
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return url.hostname !== "localhost" && url.hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

type TokenCache = {
  access: string;
  refresh: string;
  accessExp: number;
  refreshExp: number;
};

export class QpayClient {
  private token: TokenCache | null = null;

  constructor(private readonly config: ConfigService) {}

  configured() {
    return Boolean(this.username() && this.password() && this.invoiceCode());
  }

  username() {
    return (
      trimEnv(this.config.get<string>("QPAY_CLIENT_ID")) ||
      trimEnv(this.config.get<string>("QPAY_USERNAME"))
    );
  }

  password() {
    return (
      trimEnv(this.config.get<string>("QPAY_CLIENT_SECRET")) ||
      trimEnv(this.config.get<string>("QPAY_PASSWORD"))
    );
  }

  invoiceCode() {
    return trimEnv(this.config.get<string>("QPAY_INVOICE_CODE"));
  }

  callbackUrl() {
    const explicit = trimEnv(this.config.get<string>("QPAY_CALLBACK_URL"));
    const appUrl = trimEnv(this.config.get<string>("APP_URL")).replace(/\/+$/, "");
    const railway = trimEnv(this.config.get<string>("RAILWAY_PUBLIC_DOMAIN"));
    const fromApp = appUrl ? `${appUrl}/v1/webhooks/qpay` : "";
    const fromRailway = railway ? `https://${railway.replace(/^https?:\/\//, "")}/v1/webhooks/qpay` : "";
    if (isPublicHttpUrl(explicit)) return explicit;
    if (isPublicHttpUrl(fromApp)) return fromApp;
    if (isPublicHttpUrl(fromRailway)) return fromRailway;
    return explicit || fromApp;
  }

  baseUrl() {
    const raw = (this.config.get<string>("QPAY_BASE_URL") ?? "https://merchant.qpay.mn").replace(
      /\/+$/,
      "",
    );
    return raw.endsWith("/v2") ? raw : `${raw}/v2`;
  }

  async createInvoice(input: {
    amount: number;
    senderInvoiceNo: string;
    description: string;
    callbackUrl?: string;
  }): Promise<QpayInvoice> {
    const callback = input.callbackUrl || this.callbackUrl();
    const callbackUrl = callback
      ? `${callback}${callback.includes("?") ? "&" : "?"}payment_id=${encodeURIComponent(input.senderInvoiceNo)}`
      : "";

    return this.request<QpayInvoice>("/invoice", {
      method: "POST",
      body: JSON.stringify({
        invoice_code: this.invoiceCode(),
        sender_invoice_no: input.senderInvoiceNo,
        invoice_receiver_code: "terminal",
        invoice_description: input.description.slice(0, 255),
        amount: input.amount,
        callback_url: callbackUrl,
      }),
    });
  }

  async checkPayment(invoiceId: string): Promise<QpayPaymentCheck> {
    return this.request<QpayPaymentCheck>("/payment/check", {
      method: "POST",
      body: JSON.stringify({
        object_type: "INVOICE",
        object_id: invoiceId,
        offset: { page_number: 1, page_limit: 10 },
      }),
    });
  }

  private async request<T>(path: string, init: RequestInit, retried = false): Promise<T> {
    const token = await this.auth();
    const res = await fetch(`${this.baseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (res.status === 401 && !retried) {
      this.token = null;
      return this.request<T>(path, init, true);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`QPay ${path} failed ${res.status}: ${text}`);
    }

    return (await res.json()) as T;
  }

  private async auth(): Promise<string> {
    const now = Date.now();
    if (this.token && this.token.accessExp > now) return this.token.access;
    if (this.token && this.token.refreshExp > now) {
      try {
        return await this.refresh(this.token.refresh);
      } catch {
        this.token = null;
      }
    }
    return this.login();
  }

  private async login(): Promise<string> {
    const res = await fetch(`${this.baseUrl()}/auth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.username()}:${this.password()}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    if (!res.ok) {
      throw new Error(`QPay auth failed ${res.status}: ${await res.text()}`);
    }
    return this.storeToken(await res.json());
  }

  private async refresh(refreshToken: string): Promise<string> {
    const res = await fetch(`${this.baseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("QPay refresh failed");
    return this.storeToken(await res.json());
  }

  private storeToken(data: {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_expires_in?: number;
  }) {
    this.token = {
      access: data.access_token,
      refresh: data.refresh_token ?? "",
      accessExp: expiryAt(data.expires_in, 600),
      refreshExp: expiryAt(data.refresh_expires_in, 3600),
    };
    return data.access_token;
  }
}

function expiryAt(value: number | undefined, fallbackSec: number) {
  if (!value) return Date.now() + fallbackSec * 1000;
  if (value > 1_000_000_000_000) return value - 30_000;
  if (value > 1_000_000_000) return value * 1000 - 30_000;
  return Date.now() + Math.max(value - 30, 30) * 1000;
}
