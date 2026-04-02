import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// 권한 확인 헬퍼: ADMIN은 모두 허용, STAFF는 GUARDIAN 계정만 허용
async function checkPermission(targetRole?: string) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  
  if (userRole === "ADMIN") return null;
  
  // 종사자(STAFF)는 보호자(GUARDIAN) 계정만 관리 가능
  if (userRole === "STAFF" && targetRole === "GUARDIAN") return null;
  
  return NextResponse.json({ error: "권한이 없습니다. (관리자 또는 보호자 관리 권한이 필요합니다.)" }, { status: 403 });
}

// POST /api/admin/staff — 신규 계정 생성 및 이용자 연결
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, patientId } = await req.json();
    
    // 권한 체크
    const authError = await checkPermission(role);
    if (authError) return authError;

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 이메일입니다." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // 트랜잭션으로 유저 생성 및 환자 연결 동시 처리
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashed,
          name: name || "",
          role: role || "GUARDIAN",
        },
      });

      // 보호자 역할이고 환자 ID가 있다면 연결
      if (role === "GUARDIAN" && patientId) {
        await tx.patient.update({
          where: { id: patientId },
          data: { guardianId: user.id }
        });
      }

      return user;
    });

    return NextResponse.json({ id: result.id, email: result.email, name: result.name, role: result.role });
  } catch (e: any) {
    console.error("[Staff API POST Error]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/staff?id=... — 계정 삭제
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

    const authError = await checkPermission(targetUser.role);
    if (authError) return authError;

    await prisma.$transaction(async (tx) => {
      // 담당자/보호자 관계 해제
      await tx.patient.updateMany({ where: { assignedStaffId: id }, data: { assignedStaffId: null } });
      await tx.patient.updateMany({ where: { guardianId: id }, data: { guardianId: null } });
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/staff — 정보 수정 및 이용자 연결 업데이트
export async function PUT(req: NextRequest) {
  try {
    const { id, name, role, patientId } = await req.json();
    if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

    const authError = await checkPermission(targetUser.role || role);
    if (authError) return authError;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { name, role },
      });

      // 보호자 연결 업데이트
      if (role === "GUARDIAN") {
        // 기존 연결 해제 (이 보호자에게 연결된 모든 환자 해제)
        await tx.patient.updateMany({ where: { guardianId: id }, data: { guardianId: null } });
        
        // 새로운 환자 연결
        if (patientId) {
          await tx.patient.update({
            where: { id: patientId },
            data: { guardianId: id }
          });
        }
      }

      return user;
    });

    return NextResponse.json({ id: result.id, name: result.name, role: result.role });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
