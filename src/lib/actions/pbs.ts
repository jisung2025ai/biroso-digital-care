"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDecryptedApiKey } from "@/lib/actions/settings";

// AI 분석을 위한 인터페이스 정의
interface PBSAnalysisResult {
  functionAnalyzed: string;
  antecedentStrategy: string;
  replacementSkill: string;
  consequenceStrategy: string;
  longTermSupport: string;
  interventions: string;
}

/**
 * gpt-5-mini 모델을 사용하여 이용자의 기록을 분석하고 PBS 계획을 생성합니다.
 * @param patientId 이용자 ID
 * @param specificBehavior 분석할 특정 도전행동 (선택사항)
 */
export async function generatePBSPlan(patientId: string, specificBehavior?: string) {
  const db = getDb();

  try {
    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new Error("Patient not found");

    const recentABC = await db.behaviorRecord.findMany({
      where: { patientId },
      include: { staff: true },
      orderBy: { recordDate: 'desc' },
      take: 10
    });

    const recentDaily = await db.dailyReport.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      take: 10
    });

    // 2. AI 분석을 위한 데이터 정제
    const dataContext = {
      patientInfo: {
        disabilityType: patient.disabilityType,
        healthInfo: patient.healthInfo
      },
      abcRecords: recentABC.map(r => ({
        date: r.recordDate,
        antecedent: r.antecedent || "기록 없음",
        type: r.behaviorType,
        consequence: r.consequence || "기록 없음"
      })),
      dailyStatus: recentDaily.map(d => ({
        date: d.date,
        meal: d.mealStatus,
        sleep: d.sleepQuality,
        mood: d.mood
      }))
    };

    // 2.1 주요 도전행동 유형 추출 (가장 빈도가 높은 유형) - 인자로 넘어왔을 경우 그것을 사용
    const behaviorCounts: Record<string, number> = {};
    recentABC.forEach(r => {
      behaviorCounts[r.behaviorType] = (behaviorCounts[r.behaviorType] || 0) + 1;
    });
    const behaviorTitle = specificBehavior || (Object.entries(behaviorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "전반적 도전행동");

    // 3. gpt-5-mini 호출 (Responses API 패턴 가이드 준수)
    console.log(`[AI] PBS 심층 분석 시작: ${patient.name} (${behaviorTitle})`);
    
    const SYSTEM_PROMPT = `
귀하는 대한민국 최고의 최중증 발달장애인 행동지원 전문가이자 응용행동분석(ABA) 과학자입니다.
제공된 이용자의 최근 10일간의 '도전행동 기록(ABC)'과 '일상 건강 기록(식사, 수면, 기분)'을 융합 분석하여, 
도전행동의 기능을 과학적으로 가설화하고 이에 기반한 '긍정적 행동지원계획(PBS)'을 수립하십시오.

[작성 가이드라인]
1. 기능 분석(functionAnalyzed): ABC 데이터를 바탕으로 행동의 기능(관심, 회피, 획득, 자극 등)을 명확히 정의하십시오.
2. 선행사건 중재(antecedentStrategy): 행동 발생 전 환경적, 생리적 트리거를 통제하거나 예방하는 구체적인 절차를 제언하십시오. 
3. 대체기술 교수(replacementSkill): 도전행동을 대체할 수 있는 기능적 의사소통 기술(FCT)이나 적응적 기술을 명시하십시오.
4. 후속결과 중재(consequenceStrategy): 행동 발생 시 반응(Reaction)을 최소화하고, 대체 행동 성공 시의 강력한 강화(Reinforcement) 방안을 제시하십시오.
5. 장기적인 지원(longTermSupport): 이용자의 삶의 질(QoL) 향상을 위한 라이프스타일 조정 및 생리적/심리적 지원 방안을 포함하십시오.
6. 위기관리(interventions): 위해(자해/타해) 발생 시의 안전 확보 및 즉각적 중재 매뉴얼을 작성하십시오.

[출력 형식]
반드시 다음 구조의 JSON 형식으로만 응답하십시오:
{
  "functionAnalyzed": "분석된 기능 (예: 자극추구)",
  "antecedentStrategy": "선행사건 중재 상세 내용 (글머리 기호 사용)",
  "replacementSkill": "대체기술 교수 상세 내용 (글머리 기호 사용)",
  "consequenceStrategy": "후속결과 중재 상세 내용 (글머리 기호 사용)",
  "longTermSupport": "장기적 지원 상세 내용 (글머리 기호 사용)",
  "interventions": "[위기 관리 프로세스] 1. .. 2. .."
}
`;

    const userPrompt = `
[이용자 정보]
- 성명: ${patient.name}
- 장애유형: ${patient.disabilityType || "정보 없음"}
- 건강정보: ${patient.healthInfo || "특이사항 없음"}

[분석 대상 행동]
- 대상 유형: ${behaviorTitle}

[최근 도전행동 기록(ABC)]
${JSON.stringify(dataContext.abcRecords, null, 2)}

[최근 일상 건강 현황]
${JSON.stringify(dataContext.dailyStatus, null, 2)}

위 데이터를 정밀 분석하여 PBS 계획 JSON을 생성하십시오.
`;

    // 기관별 맞춤형 AI 설정 가져오기 (DB 우선)
    const customConfig = await getDecryptedApiKey();
    const provider = customConfig?.provider || "ResponsesAI";
    const selectedModel = customConfig?.model || "gpt-5-mini";
    
    // 프로바이더별 적합한 API 키 결정
    let apiKey = customConfig?.key;
    
    if (!apiKey) {
      if (provider === "ResponsesAI") {
        apiKey = process.env.RESPONSES_API_KEY || "broso_integrated_key";
      } else if (provider === "OpenAI") {
        apiKey = process.env.OPENAI_API_KEY; // 서버측 환경변수 fallback
      } else if (provider === "Anthropic") {
        apiKey = process.env.ANTHROPIC_API_KEY; // 서버측 환경변수 fallback
      }
    }

    if (!apiKey) {
      throw new Error(`${provider} API 키가 설정되지 않았습니다. 관리자 설정에서 키를 입력해주세요.`);
    }

    console.log(`[AI] 실행 모델: ${selectedModel}, 제공자: ${provider}, 키 검증: ${apiKey.slice(0, 5)}...`);

    let apiUrl = "https://api.responses.ai/v1/chat/completions";
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let body: any = {};

    if (provider === "Anthropic") {
      apiUrl = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      body = {
        model: selectedModel,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      };
    } else {
      // OpenAI or ResponsesAI (OpenAI-compatible)
      apiUrl = provider === "OpenAI" 
        ? "https://api.openai.com/v1/chat/completions" 
        : "https://api.responses.ai/v1/chat/completions";
      
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: selectedModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      };
    }

    console.log(`[AI] 요청 시작: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API Error Response (${provider}):`, errorText);
      throw new Error(`AI API 호출 실패 (${provider}): ${response.status} ${response.statusText}`);
    }

    const aiResult = await response.json();
    let content = "";

    if (provider === "Anthropic") {
      content = aiResult.content[0].text;
    } else {
      content = aiResult.choices[0].message.content;
    }

    const aiResponse: PBSAnalysisResult = JSON.parse(content);

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 4. 분석 결과 DB 저장
    await db.positiveBehaviorPlan.create({
      data: {
        id: newId,
        patientId,
        behaviorTitle,
        functionAnalyzed: aiResponse.functionAnalyzed,
        antecedentStrategy: aiResponse.antecedentStrategy,
        replacementSkill: aiResponse.replacementSkill,
        consequenceStrategy: aiResponse.consequenceStrategy,
        longTermSupport: aiResponse.longTermSupport,
        interventions: aiResponse.interventions,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      }
    });

    revalidatePath(`/admin/patients/${patientId}/pbs`);
    return { 
      success: true, 
      data: { 
        ...aiResponse, 
        id: newId, 
        patientId, 
        behaviorTitle, 
        createdAt: now, 
        updatedAt: now 
      } 
    };

  } catch (error: any) {
    console.error("PBS Generation Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 특정 이용자의 PBS 계획 목록을 조회합니다.
 */
export async function getPBSPlans(patientId: string) {
  const db = getDb();
  try {
    return await db.positiveBehaviorPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (err) {
    return [];
  }
}
/**
 * 모든 이용자(또는 담당 이용자)의 PBS 수립 현황(개수, 최신 일자 등)을 조회합니다.
 */
export async function getAllPatientsWithPBSStats(userRole?: string, userId?: string) {
  const db = getDb();
  try {
    const condition = userRole === "STAFF" && userId ? { assignedStaffId: userId } : {};

    const patients = await db.patient.findMany({
      where: condition,
      include: {
        _count: { select: { behaviorPlans: true } },
        behaviorPlans: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    return patients.map(p => ({
      id: p.id,
      name: p.name,
      disabilityType: p.disabilityType || "",
      planCount: p._count.behaviorPlans,
      lastUpdated: p.behaviorPlans.length > 0 ? p.behaviorPlans[0].createdAt.toISOString() : null
    }));
  } catch (err) {
    console.error("Failed to fetch PBS stats:", err);
    return [];
  }
}

export async function updatePBSPlan(id: string, data: any) {
  const db = getDb();
  try {
    await db.positiveBehaviorPlan.update({
      where: { id },
      data: {
        behaviorTitle: data.behaviorTitle,
        functionAnalyzed: data.functionAnalyzed,
        antecedentStrategy: data.antecedentStrategy,
        replacementSkill: data.replacementSkill,
        consequenceStrategy: data.consequenceStrategy,
        longTermSupport: data.longTermSupport,
        updatedAt: new Date()
      }
    });
    revalidatePath("/admin/pbs");
    return { success: true };
  } catch (err) {
    console.error("Update PBS Plan Error:", err);
    return { success: false, error: String(err) };
  }
}

export async function deletePBSPlan(id: string) {
  const db = getDb();
  console.log(`[PBS] Deleting plan with ID: ${id}`);
  try {
    await db.positiveBehaviorPlan.delete({ where: { id } });
    console.log(`[PBS] Delete successful for ${id}`);
    revalidatePath("/admin/pbs");
    return { success: true };
  } catch (err) {
    console.error("Delete PBS Plan Error:", err);
    return { success: false, error: String(err) };
  }
}
