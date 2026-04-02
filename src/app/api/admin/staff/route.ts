import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// ADMIN 권한 확인 헬퍼
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  return null;
}

// POST /api/admin/staff — 직원 계정 생성
export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { name, email, password, role } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 이메일입니다." }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || "",
        role: role === "ADMIN" ? "ADMIN" : "STAFF",
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/staff?id=... — 직원 계정 삭제
export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  try {
    // 담당 이용자 담당자 초기화
    await prisma.patient.updateMany({ where: { assignedStaffId: id }, data: { assignedStaffId: null } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/staff — 직원 정보 수정
export async function PUT(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id, name, role } = await req.json();
    if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
    const user = await prisma.user.update({
      where: { id },
      data: { name, role },
    });
    return NextResponse.json({ id: user.id, name: user.name, role: user.role });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
