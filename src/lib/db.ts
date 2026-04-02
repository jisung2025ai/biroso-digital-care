import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/postgres";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter } as any);
}

// Proxy 기반 Lazy 초기화: 빌드 단계에서 모듈을 임포트해도 실제 PrismaClient는
// 첫 DB 메서드 호출 시점에만 생성됨 (빌드-타임 DB 연결 방지)
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    const client = globalForPrisma.prisma;
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
