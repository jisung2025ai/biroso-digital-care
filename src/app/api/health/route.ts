import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 30) + "..."
        : "NOT SET",
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    },
    db: { status: "unknown" },
    users: { count: -1 },
  };

  try {
    // DB 연결 테스트
    const userCount = await prisma.user.count();
    result.db.status = "connected";
    result.users.count = userCount;

    if (userCount === 0) {
      // 관리자 계정 자동 생성
      await prisma.user.create({
        data: {
          email: "admin@broso.com",
          password: "password123",
          name: "최고관리자",
          role: "ADMIN",
        },
      });
      result.users.adminCreated = true;
      result.users.count = 1;
    } else {
      // 기존 관리자 확인
      const admin = await prisma.user.findUnique({
        where: { email: "admin@broso.com" },
        select: { email: true, role: true, password: true },
      });
      result.users.adminExists = !!admin;
      result.users.adminRole = admin?.role;
      result.users.adminPasswordCorrect = admin?.password === "password123";
    }
  } catch (e: any) {
    result.db.status = "error";
    result.db.error = e.message;
    result.db.errorCode = e.code;
  }

  return NextResponse.json(result, { status: 200 });
}
