"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPatient(id: string) {
  if (!id) return null;
  return await prisma.patient.findUnique({
    where: { id },
  });
}

export async function getPatients(staffId?: string) {
  // staffId가 없으면 전체 목록(또는 빈 목록), 있으면 담당 이용자만 필터링
  const patients = await prisma.patient.findMany({
    where: staffId ? { assignedStaffId: staffId } : {},
    orderBy: { name: "asc" },
  });

  // 데이터가 없을 경우 자동 시드 (테스트 편의성: 현재 종사자에게 할당)
  if (patients.length === 0 && staffId) {
    console.log(`No patients found for staff ${staffId}. Auto-seeding...`);
    await prisma.patient.createMany({
      data: [
        { name: "이용자A", disabilityType: "자폐성장애", healthInfo: "특이사항 없음", assignedStaffId: staffId },
        { name: "이용자B", disabilityType: "지적장애", healthInfo: "약물 복용 중", assignedStaffId: staffId },
        { name: "이용자C", disabilityType: "뇌병변장애", healthInfo: "휠체어 이용", assignedStaffId: staffId },
      ]
    });
    return await prisma.patient.findMany({ 
      where: { assignedStaffId: staffId },
      orderBy: { name: "asc" } 
    });
  }

  return patients;
}

export async function saveBehaviorRecord(data: {
  patientId: string;
  staffId: string;
  antecedent: string;
  behaviorType: string;
  behaviorDetail?: string;
  intensity: string;
  durationMin: number;
  consequence: string;
}) {
  try {
    const record = await prisma.behaviorRecord.create({
      data: {
        patientId: data.patientId,
        staffId: data.staffId,
        antecedent: data.antecedent,
        behaviorType: data.behaviorType,
        behaviorDetail: data.behaviorDetail || null,
        intensity: data.intensity,
        durationMin: data.durationMin,
        consequence: data.consequence,
        recordDate: new Date(),
      },
    });

    console.log("Record saved successfully:", record.id);
    
    // Revalidate admin dashboard and main page
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/admin/records");
    
    return { success: true, id: record.id };
  } catch (error) {
    console.error("Error saving behavior record:", error);
    return { success: false, error: "데이터 저장 중 오류가 발생했습니다." };
  }
}

/**
 * 대시보드 메인 현황판을 위한 데이터 조회
 * - 담당 구역 이용자 목록 & 오늘 발생한 도전행동 건수
 */
export async function getDashboardStats(staffId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. 담당 이용자 목록 조회
  const patients = await prisma.patient.findMany({
    where: { assignedStaffId: staffId },
    select: { id: true, name: true, disabilityType: true }
  });

  // 2. 각 이용자별 오늘 발생한 기록 건수 집계
  const stats = await Promise.all(patients.map(async (p) => {
    const count = await prisma.behaviorRecord.count({
      where: {
        patientId: p.id,
        recordDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    return {
      id: p.id,
      name: p.name,
      disabilityType: p.disabilityType,
      recordCount: count
    };
  }));

  return {
    totalPatients: patients.length,
    totalRecordsToday: stats.reduce((acc, curr) => acc + curr.recordCount, 0),
    patientStats: stats
  };
}

export async function saveDailyReport(data: {
  patientId: string;
  staffId: string;
  sleepQuality: string;
  mealStatus: string;
  mood: string;
  notes?: string;
}) {
  try {
    const report = await prisma.dailyReport.create({
      data: {
        patientId: data.patientId,
        staffId: data.staffId,
        sleepQuality: data.sleepQuality,
        mealStatus: data.mealStatus,
        mood: data.mood,
        notes: data.notes || "",
        date: new Date(),
      },
    });
    revalidatePath("/");
    return { success: true, id: report.id };
  } catch (error: any) {
    console.error("Failed to save daily report:", error);
    return { success: false, error: error.message || "식사/건강 기록 저장에 실패했습니다." };
  }
}
