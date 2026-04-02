"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createPatient(data: {
  name: string;
  birthDate?: string;
  disabilityType?: string;
  healthInfo?: string;
  assignedStaffId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    // STAFF 권한인 경우 무조건 자신의 ID를 담당자로 강제 배정
    const finalStaffId = (userRole === "STAFF" && userId) ? userId : (data.assignedStaffId || null);

    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        disabilityType: data.disabilityType,
        healthInfo: data.healthInfo,
        assignedStaffId: finalStaffId,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: patient };
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    return { success: false, error: error.message || "이용자 등록에 실패했습니다." };
  }
}

export async function updatePatient(id: string, data: {
  name?: string;
  birthDate?: string;
  disabilityType?: string;
  healthInfo?: string;
  assignedStaffId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    // STAFF 권한인 경우 무조건 자신의 ID 유지
    let finalStaffId = data.assignedStaffId === "none" ? null : data.assignedStaffId;
    if (userRole === "STAFF" && userId) {
      finalStaffId = userId;
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        disabilityType: data.disabilityType,
        healthInfo: data.healthInfo,
        assignedStaffId: finalStaffId,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: patient };
  } catch (error: any) {
    console.error("Failed to update patient:", error);
    return { success: false, error: error.message || "이용자 정보 수정에 실패했습니다." };
  }
}

export async function deletePatient(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (userRole === "STAFF" && userId) {
      // 본인이 담당하는 환자인지 확인
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient || patient.assignedStaffId !== userId) {
        return { success: false, error: "본인이 담당하는 이용자만 삭제할 수 있습니다." };
      }
    }

    // Note: Due to foreign key constraints, related records (behaviorRecords, etc.) 
    // might need to be handled if they are not set to cascade delete in Prisma. 
    // In our schema, we should check if they can be deleted.
    await prisma.patient.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete patient:", error);
    return { success: false, error: error.message || "이용자 삭제에 실패했습니다." };
  }
}
