import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { normalizeMnPhone } from "../common/phone";
import { PrismaService } from "../prisma/prisma.service";
import { SmsService } from "../sms/sms.service";
import { generateOtp, hashSecret, hashSha256, verifySecret } from "../common/crypto";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const phone = this.config.get<string>("ADMIN_BOOTSTRAP_PHONE");
    if (!phone) return;
    try {
      const normalized = normalizeMnPhone(phone);
      await this.prisma.user.upsert({
        where: { phone: normalized },
        update: { role: "ADMIN" },
        create: {
          phone: normalized,
          role: "ADMIN",
          profiles: { create: { name: "Админ", isDefault: true } },
        },
      });
    } catch (err) {
      this.logger.warn(`Admin bootstrap skipped: ${String(err)}`);
    }
  }

  async requestOtp(rawPhone: string) {
    const phone = normalizeMnPhone(rawPhone);
    const recent = await this.prisma.otpChallenge.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      throw new BadRequestException("60 секундын дараа дахин илгээнэ үү");
    }

    const length = Number(this.config.get("OTP_LENGTH") ?? 6);
    const ttl = Number(this.config.get("OTP_TTL_SECONDS") ?? 300);
    const code = generateOtp(length);
    const codeHash = await hashSecret(code);

    await this.prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    await this.sms.sendOtp(phone, code);
    const mock = (this.config.get<string>("SMS_PROVIDER") ?? "mock") === "mock";
    return {
      ok: true,
      phone,
      expiresIn: ttl,
      ...(mock ? { devCode: code } : {}),
    };
  }

  async verifyOtp(rawPhone: string, code: string, res: Response) {
    const phone = normalizeMnPhone(rawPhone);
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, consumed: false },
      orderBy: { createdAt: "desc" },
    });
    if (!challenge || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException("Код хүчингүй эсвэл хугацаа дууссан");
    }
    if (challenge.attempts >= 5) {
      throw new UnauthorizedException("Хэт олон буруу оролдлого");
    }

    const ok = await verifySecret(code, challenge.codeHash);
    if (!ok) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException("Код буруу байна");
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumed: true },
    });

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        role: "CUSTOMER",
        profiles: { create: { name: "Профайл", isDefault: true } },
      },
      include: { profiles: { where: { isDefault: true }, take: 1 } },
    });

    if (user.profiles.length === 0) {
      await this.prisma.profile.create({
        data: { userId: user.id, name: "Профайл", isDefault: true },
      });
    }

    const tokens = await this.issueTokens(user.id, user.role);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      user: { id: user.id, phone: user.phone, role: user.role },
    };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) throw new UnauthorizedException();
    const tokenHash = hashSha256(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored) throw new UnauthorizedException();

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = await this.issueTokens(stored.user.id, stored.user.role);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { ok: true };
  }

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashSha256(refreshToken) },
        data: { revoked: true },
      });
    }
    this.clearCookies(res);
    return { ok: true };
  }

  private async issueTokens(userId: string, role: string) {
    const accessTtl = (this.config.get<string>("JWT_ACCESS_TTL") ?? "15m") as `${number}${"m" | "d" | "h" | "s"}`;
    const refreshTtl = (this.config.get<string>("JWT_REFRESH_TTL") ?? "30d") as `${number}${"m" | "d" | "h" | "s"}`;
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: this.config.getOrThrow("JWT_ACCESS_SECRET"),
        expiresIn: accessTtl,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, typ: "refresh" },
      {
        secret: this.config.getOrThrow("JWT_REFRESH_SECRET"),
        expiresIn: refreshTtl,
      },
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashSha256(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  private cookieOptions() {
    const secure = this.config.get("NODE_ENV") === "production";
    return {
      httpOnly: true,
      sameSite: (secure ? "none" : "lax") as "none" | "lax",
      secure,
      path: "/",
    };
  }

  private setCookies(res: Response, access: string, refresh: string) {
    res.cookie(ACCESS_COOKIE, access, { ...this.cookieOptions(), maxAge: 15 * 60 * 1000 });
    res.cookie(REFRESH_COOKIE, refresh, {
      ...this.cookieOptions(),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE, this.cookieOptions());
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }
}
