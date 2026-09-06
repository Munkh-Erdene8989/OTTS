import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger("MockSmsProvider");

  async send(phone: string, message: string): Promise<void> {
    this.logger.log(`[MOCK SMS] ${phone}: ${message}`);
  }
}

class HttpSmsProvider implements SmsProvider {
  private readonly logger = new Logger("HttpSmsProvider");

  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
    private readonly sender: string,
  ) {}

  async send(phone: string, message: string): Promise<void> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        to: phone,
        from: this.sender,
        text: message,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`SMS gateway failed ${res.status}: ${body}`);
      throw new Error("SMS илгээж чадсангүй");
    }
  }
}

/** CallPro Text API: POST {base}/send with x-api-key. */
class CallProSmsProvider implements SmsProvider {
  private readonly logger = new Logger("CallProSmsProvider");

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly baseUrl: string,
  ) {}

  async send(phone: string, message: string): Promise<void> {
    const to = toCallProRecipient(phone);
    const res = await fetch(sendUrl(this.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        from: this.from,
        to,
        text: message,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      this.logger.error(`CallPro SMS failed ${res.status}: ${body}`);
      throw new Error("SMS илгээж чадсангүй");
    }
    this.logger.log(`CallPro SMS queued to ${to}`);
  }
}

export function toCallProRecipient(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("976") && digits.length === 11) return digits.slice(3);
  if (digits.length >= 8) return digits.slice(-8);
  return digits;
}

export function sendUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/send") ? trimmed : `${trimmed}/send`;
}

@Injectable()
export class SmsService {
  private readonly provider: SmsProvider;
  private readonly live: boolean;
  private readonly logger = new Logger(SmsService.name);

  constructor(config: ConfigService) {
    const otpEnabled = (config.get<string>("CALLPRO_OTP_ENABLED") ?? "true").toLowerCase() !== "false";
    const callproKey = config.get<string>("CALLPRO_API_KEY") ?? "";
    const callproFrom = config.get<string>("CALLPRO_FROM") ?? "";
    const kind = (config.get<string>("SMS_PROVIDER") ?? "mock").toLowerCase();
    const useCallpro = otpEnabled && Boolean(callproKey && callproFrom) && kind !== "http";

    if (useCallpro) {
      this.provider = new CallProSmsProvider(
        callproKey,
        callproFrom,
        config.get<string>("CALLPRO_BASE_URL") ?? "https://api-text.callpro.mn/v1/sms",
      );
      this.live = true;
      this.logger.log("SMS provider: CallPro");
    } else if (kind === "http" || kind === "messagepro" || kind === "easysms") {
      this.provider = new HttpSmsProvider(
        config.getOrThrow("SMS_API_URL"),
        config.getOrThrow("SMS_API_KEY"),
        config.get<string>("SMS_SENDER") ?? "negun",
      );
      this.live = true;
    } else {
      this.provider = new MockSmsProvider();
      this.live = false;
      this.logger.warn("SMS_PROVIDER=mock — OTP will be logged, not sent");
    }
  }

  isLive() {
    return this.live;
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    await this.provider.send(phone, `negun баталгаажуулах код: ${code}`);
  }
}
