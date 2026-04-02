import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdminOrStaff() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return { error: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }), role: null };
  }
  return { error: null, role, userId: (session?.user as any)?.id };
}

// POST /api/admin/patients — 이용자 추가
export async function POST(req: NextRequest) {
  const { error } = await requireAdminOrStaff();
  if (error) return error;

  try {
    const { name, birthDate, disabilityType, healthInfo, assignedStaffId, guardianId } = await req.json();
    if (!name) return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });

    const patient = await prisma.patient.create({
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        disabilityType: disabilityType || null,
        healthInfo: healthInfo || null,
        assignedStaffId: assignedStaffId || null,
        guardianId: guardianId || null,
      },
    });
    return NextResponse.json(patient);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/patients — 이용자 수정
export async function PUT(req: NextRequest) {
  const { error, role } = await requireAdminOrStaff();
  if (error) return error;
  if (role !== "ADMIN") return NextResponse.json({ error: "관리자만 수정 가능합니다." }, { status: 403 });

  try {
    const { id, name, birthDate, disabilityType, healthInfo, assignedStaffId, guardianId } = await req.json();
    if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        disabilityType,
        healthInfo,
        assignedStaffId: assignedStaffId || null,
        guardianId: guardianId || null,
      },
    });
    return NextResponse.json(patient);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/patients?id=... — 이용자 삭제
export async function DELETE(req: NextRequest) {
  const { error, role } = await requireAdminOrStaff();
  if (error) return error;
  if (role !== "ADMIN") return NextResponse.json({ error: "관리자만 삭제 가능합니다." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  try {
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
