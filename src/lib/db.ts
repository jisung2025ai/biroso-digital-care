import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getPrisma = () => {
  // 빌드 단계에서는 실제 DB 연결을 방지 (Next.js 빌드 시 정적 분석 에러 대응)
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("[Prisma] Build phase detected. Skipping real instantiation.");
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        return () => {
          console.warn(`[Prisma] Database called during build phase on property: ${String(prop)}. Returning empty result.`);
          return Promise.resolve(null);
        };
      },
    });
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  return globalForPrisma.prisma;
};

export const prisma = getPrisma();
