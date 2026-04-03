"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/** 
 * 암호화 키는 정확히 32바이트여야 합니다. 
 */
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY || "broso_security_key_32bytes_v1_2026";
  // 32바이트로 맞춤 (패딩 또는 자르기)
  return Buffer.alloc(32, envKey).slice(0, 32);
}

const IV_LENGTH = 16; 

function encrypt(text: string) {
  if (!text) return "";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("API 키 암호화 중 오류가 발생했습니다.");
  }
}

function decrypt(text: string) {
  if (!text) return "";
  try {
    const textParts = text.split(":");
    const ivStr = textParts.shift();
    if (!ivStr) return "";
    const iv = Buffer.from(ivStr, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption error:", err);
    return "";
  }
}

/**
 * AI 설정을 조회합니다. API 키는 마스킹 처리되어 반환됩니다.
 */
export async function getAIAgentConfig() {
  const db = getDb();
  try {
    const setting = await (db as any).systemSetting.findUnique({
      where: { id: "GLOBAL_CONFIG" }
    });

    if (!setting) {
      return {
        aiEnabled: true,
        aiModel: "gpt-5-mini",
        aiProvider: "ResponsesAI",
        organizationName: "BIROSO 중앙센터",
        aiApiKey: ""
      };
    }

    // API 키 마스킹 (보안)
    const rawKey = setting.aiApiKey ? decrypt(setting.aiApiKey) : "";
    const maskedKey = rawKey ? `${rawKey.slice(0, 5)}••••••••${rawKey.slice(-4)}` : "";

    return {
      aiEnabled: setting.aiEnabled,
      aiModel: setting.aiModel,
      aiProvider: setting.aiProvider,
      organizationName: setting.organizationName || "",
      aiApiKey: maskedKey,
      hasKey: !!rawKey
    };
  } catch (err) {
    console.error("Failed to fetch AI config:", err);
    return null;
  }
}

/**
 * AI 설정을 업데이트합니다. 
 */
export async function updateAIAgentConfig(data: {
  aiEnabled?: boolean;
  aiModel: string;
  aiProvider: string;
  aiApiKey?: string;
  organizationName?: string;
}) {
  const db = getDb();
  try {
    const existing = await (db as any).systemSetting.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    
    let encryptedKey = existing?.aiApiKey;
    
    // 새 키가 입력되었고 마스킹된 값이 아니면 암호화
    if (data.aiApiKey && !data.aiApiKey.includes("••••••••")) {
      encryptedKey = encrypt(data.aiApiKey.trim());
    }

    await (db as any).systemSetting.upsert({
      where: { id: "GLOBAL_CONFIG" },
      update: {
        aiEnabled: data.aiEnabled,
        aiModel: data.aiModel,
        aiProvider: data.aiProvider,
        aiApiKey: encryptedKey,
        organizationName: data.organizationName
      },
      create: {
        id: "GLOBAL_CONFIG",
        aiEnabled: data.aiEnabled ?? true,
        aiModel: data.aiModel,
        aiProvider: data.aiProvider,
        aiApiKey: encryptedKey,
        organizationName: data.organizationName
      }
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Update AI Config Error 상세:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * 로직에서 실제 복호화된 키를 가져오기 위한 내부용 함수
 */
export async function getDecryptedApiKey() {
  const db = getDb();
  const setting = await (db as any).systemSetting.findUnique({ where: { id: "GLOBAL_CONFIG" } });
  if (!setting || !setting.aiApiKey) return null;
  return {
    key: decrypt(setting.aiApiKey),
    model: setting.aiModel,
    provider: setting.aiProvider
  };
}

/**
 * 개별 사용자의 설정을 조회합니다.
 */
export async function getUserSettings(userId: string) {
  const db = getDb();
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        notificationsEnabled: true,
        darkMode: true
      }
    });
    return user || { notificationsEnabled: true, darkMode: false };
  } catch (err) {
    console.error("Get user settings error:", err);
    return { notificationsEnabled: true, darkMode: false };
  }
}

/**
 * 개별 사용자의 설정을 업데이트합니다.
 */
export async function updateUserSettings(userId: string, data: { notificationsEnabled?: boolean; darkMode?: boolean }) {
  const db = getDb();
  try {
    await db.user.update({
      where: { id: userId },
      data
    });
    return { success: true };
  } catch (err) {
    console.error("Update user settings error:", err);
    return { success: false };
  }
}
