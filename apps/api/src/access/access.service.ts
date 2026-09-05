import { Injectable } from "@nestjs/common";
import { AccessType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type AccessResult = {
  allowed: boolean;
  reason: "admin" | "free" | "subscription" | "ppv" | "paywall";
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async check(userId: string, titleId: string, accessType: AccessType): Promise<AccessResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === "ADMIN") return { allowed: true, reason: "admin" };
    if (accessType === "FREE") return { allowed: true, reason: "free" };

    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        currentPeriodEnd: { gt: new Date() },
      },
    });
    if (sub) return { allowed: true, reason: "subscription" };

    if (accessType === "PPV") {
      const purchase = await this.prisma.purchase.findFirst({
        where: { userId, titleId, status: "PAID" },
      });
      if (purchase) return { allowed: true, reason: "ppv" };
    }

    return { allowed: false, reason: "paywall" };
  }

  async entitlements(userId: string) {
    const [subscription, purchases] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: { userId, status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
      }),
      this.prisma.purchase.findMany({
        where: { userId, status: "PAID" },
        select: { titleId: true, priceMnt: true, createdAt: true },
      }),
    ]);
    return {
      premium: Boolean(subscription),
      subscription,
      purchases,
    };
  }
}
