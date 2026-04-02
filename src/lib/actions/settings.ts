"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. 사용자 개인 설정 조회
export async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notificationsEnabled: true,
      darkMode: true,
    },
  });
  
  return {
    notificationsEnabled: user?.notificationsEnabled ?? true,
    darkMode: user?.darkMode ?? false,
  };
}

// 2. 사용자 개인 설정 업데이트
export async function updateUserSettings(userId: string, data: { notificationsEnabled?: boolean; darkMode?: boolean }) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationsEnabled: data.notificationsEnabled,
      darkMode: data.darkMode,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// 3. 시스템 전역 설정 조회 및 초기화
export async function getSystemSettings() {
  // Upsert를 사용하여 데이터가 없을 경우 기본값으로 생성 (updatedAt 자동 관리)
  const settings = await prisma.systemSetting.upsert({
    where: { id: "GLOBAL_CONFIG" },
    update: {},
    create: {
      id: "GLOBAL_CONFIG",
      aiEnabled: true,
      alertThreshold: "Medium",
      reportFrequency: "weekly",
    },
  });

  return {
    aiEnabled: settings.aiEnabled,
    alertThreshold: settings.alertThreshold,
    reportFrequency: settings.reportFrequency
  };
}

// 4. 시스템 전역 설정 업데이트
export async function updateSystemSettings(data: { aiEnabled?: boolean; alertThreshold?: string; reportFrequency?: string }) {
  await prisma.systemSetting.update({
    where: { id: "GLOBAL_CONFIG" },
    data: {
      aiEnabled: data.aiEnabled,
      alertThreshold: data.alertThreshold,
      reportFrequency: data.reportFrequency,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

