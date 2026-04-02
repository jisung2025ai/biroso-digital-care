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
    const databaseUrl = process.env.DATABASE_URL;
    
    // Prisma 옵션 객체 동적 생성 (빌드 시 하드코딩된 URL 대신 런타임 환경변수 주입)
    const prismaOptions: any = {
      log: ["query", "error", "warn"],
    };

    if (databaseUrl && process.env.NEXT_PHASE !== "phase-production-build") {
      prismaOptions.datasources = {
        db: {
          url: databaseUrl,
        },
      };
    }

    globalForPrisma.prisma = new PrismaClient(prismaOptions);
  }
  return globalForPrisma.prisma;
};

export const prisma = getPrisma();
