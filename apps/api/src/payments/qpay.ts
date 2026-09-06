import { ConfigService } from "@nestjs/config";

export type QpayInvoice = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  qPay_shortUrl?: string;
  qpay_short_url?: string;
  urls?: { name: string; description?: string; logo?: string; link: string }[];
};

export type QpayPaymentCheck = {
  count: number;
  paid_amount: number;
  rows?: unknown[];
};

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
      this.config.get<string>("QPAY_CLIENT_ID") ||
      this.config.get<string>("QPAY_USERNAME") ||
      ""
    );
  }

  password() {
    return (
      this.config.get<string>("QPAY_CLIENT_SECRET") ||
      this.config.get<string>("QPAY_PASSWORD") ||
      ""
    );
  }

  invoiceCode() {
    return this.config.get<string>("QPAY_INVOICE_CODE") ?? "";
  }

  callbackUrl() {
    return this.config.get<string>("QPAY_CALLBACK_URL") ?? "";
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
    const separator = callback.includes("?") ? "&" : "?";
    const callbackUrl = callback
      ? `${callback}${separator}invoice_id=${encodeURIComponent(input.senderInvoiceNo)}`
      : "";

    return this.request<QpayInvoice>("/invoice", {
      method: "POST",
      body: JSON.stringify({
        invoice_code: this.invoiceCode(),
        sender_invoice_no: input.senderInvoiceNo,
        invoice_receiver_code: "terminal",
        invoice_description: input.description,
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
