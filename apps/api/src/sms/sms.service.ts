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

@Injectable()
export class SmsService {
  private readonly provider: SmsProvider;
  private readonly logger = new Logger(SmsService.name);

  constructor(config: ConfigService) {
    const kind = (config.get<string>("SMS_PROVIDER") ?? "mock").toLowerCase();
    if (kind === "http" || kind === "messagepro" || kind === "easysms") {
      this.provider = new HttpSmsProvider(
        config.getOrThrow("SMS_API_URL"),
        config.getOrThrow("SMS_API_KEY"),
        config.get<string>("SMS_SENDER") ?? "negun",
      );
    } else {
      this.provider = new MockSmsProvider();
      this.logger.warn("SMS_PROVIDER=mock — OTP will be logged, not sent");
    }
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    await this.provider.send(phone, `negun баталгаажуулах код: ${code}`);
  }
}
