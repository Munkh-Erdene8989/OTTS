import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../common/decorators";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException("Нэвтрэх шаардлагатай");

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role: string }>(token, {
        secret: this.config.getOrThrow("JWT_ACCESS_SECRET"),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profiles: { where: { isDefault: true }, take: 1 } },
      });
      if (!user || user.status !== "ACTIVE") {
        throw new UnauthorizedException();
      }
      const profile = user.profiles[0];
      (req as Request & { user: unknown }).user = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        profileId: profile?.id ?? "",
      };
      return true;
    } catch {
      throw new UnauthorizedException("Холболт хүчингүй болсон");
    }
  }

  private extractToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    const cookie = req.cookies?.access_token as string | undefined;
    return cookie;
  }
}
