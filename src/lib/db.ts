import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Lazy getter: 모듈 임포트 시 즉시 연결하지 않고, 실제 사용 시점에 생성
// 이 방식으로 빌드 단계(force-dynamic 페이지의 정적 분석 포함)에서 DB 연결 시도를 방지함
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// prisma를 직접 사용하는 기존 코드와의 호환성을 위해 Proxy로 export
// 실제 PrismaClient는 첫 번째 메서드 호출 시점에 생성됨
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
