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
귀하는 대한민국 최고의 유아통합교육 전문가이자 응용행동분석(ABA) 기반 행동지원 전문가입니다.
제공된 유아의 최근 10일간의 '도전행동 기록(ABC)'과 '일상 건강 기록(식사, 수면, 기분)'을 과학적으로 분석하여,
**유아기 발달 특성과 통합학급 현장의 실제성**을 반영한 풍성하고 구체적인 '긍정적 행동지원계획(PBS)'을 수립하십시오.

[작성 원칙: 유아통합교육 특화]
1. 놀이 중심(Play-based): 모든 중재는 유아의 놀이 환경과 자연스러운 일과 속에서 이루어져야 합니다.
2. 또래 상호작용: 통합학급 내 또래들과의 긍정적인 관계 형성과 사회적 통합을 촉진하는 전략을 포함하십시오.
3. 시각적 지원(Visual Support): 유아의 이해를 돕기 위한 시각적 스케줄, PECS, 활동 카드 등의 활용 방안을 구체화하십시오.
4. 예방적 환경 구성: 교실 내 물리적 환경 조정 및 전이 시간(Transition) 지원 전략을 강조하십시오.

[작성 가이드라인]
1. 기능 분석(functionAnalyzed): **반드시 다음 5가지 표준 분류 중 하나 이상을 선택하여 대괄호[]와 함께 문장 시작에 명시하십시오: [관심추구], [회피하기], [획득하기], [자극추구], [놀이오락].** 이후 해당 기능을 유아의 발달적 욕구와 연결하여 풍성하게 설명하십시오.
2. 선행사건 중재(antecedentStrategy): 행동 발생 전 '환경적 재구성'과 '전이 지원' 등 교사와 학부모가 즉시 실행 가능한 풍성한 예방 전략을 제시하십시오.
3. 대체기술 교수(replacementSkill): 도전행동 대신 자신의 욕구를 적절히 표현할 수 있는 '기능적 의사소통 기술(FCT)'과 '사회적 기술'을 유아 눈높이에 맞춰 명시하십시오.
4. 후속결과 중재(consequenceStrategy): 도전행동에 대한 반응은 최소화하되, 대체 행동이나 긍정적 시도에 대한 '강력하고 즉각적인 자연적 강화' 방안을 구체화하십시오.
5. 장기적인 지원(longTermSupport): 유아의 전인적 발달(정서, 사회성, 자립)과 가정-기관 간의 연계 지원 방안을 포함하십시오.
6. 위기관리(interventions): 위해 발생 시 유아의 안전을 최우선으로 하는 비강압적 중재 절차와 정서적 진정 프로세스를 작성하십시오.

[출력 형식]
반드시 다음 구조의 순춘한 JSON 객체만을 응답하십시오. (절대 설명이나 인사말을 포함하지 마십시오):
1. 모든 키(Key)와 값(Value)은 순수한 문자열로 작성하며, 큰따옴표(")만을 사용하십시오.
2. functionAnalyzed 필드는 반드시 선택한 표준 분류 키워드로 시작해야 합니다. (예: "[회피하기] 분석 내용...")
3. 각 필드(Value)는 유아교육 현장에서 바로 활용할 수 있도록 아주 **풍성하고 구체적인 문장(Bullet point 포함 가능)**으로 작성하십시오.

{
  "functionAnalyzed": "[선택한 기능분류] 분석된 기능 및 유아기적 욕구 분석 (풍성하게)",
  "antecedentStrategy": "현장 밀착형 선행사건 예방 전략 (풍성하게)",
  "replacementSkill": "놀이 기반 대체기술 및 의사소통 교수 방안 (풍성하게)",
  "consequenceStrategy": "긍정적 강화 및 교육적 후속 조치 (풍성하게)",
  "longTermSupport": "가정 연계 및 삶의 질 향상을 위한 장기 지원 (풍성하게)",
  "interventions": "[위기대응 매뉴얼] 1. 안전확보 .. 2. 정서조절 .."
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
      // 에러 메시지에 응답 전문을 포함하여 클라이언트에서 확인할 수 있도록 함
      throw new Error(`AI API 호출 실패 (${provider}): ${response.status} - ${errorText}`);
    }

    const aiResult = await response.json();
    let content = "";

    if (provider === "Anthropic") {
      content = aiResult.content[0].text;
    } else {
      content = aiResult.choices[0].message.content;
    }

    // JSON 파싱 전 정제 로직 추가 (Bad control character 및 비정형 출력 대응)
    let cleanedContent = content.trim();
    
    // 1. JSON 객체 추출 (첫 번째 { 와 마지막 } 사이만 사용)
    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }

    // 2. JSON 문자열 값 내부의 실제 줄바꿈 및 제어 문자만 정밀하게 이스케이프 (Bad control character 방지)
    // 큰따옴표(") 사이의 내용물 중 제어 문자만 찾아 변환함
    cleanedContent = cleanedContent.replace(/"((?:[^"\\]|\\.)*)"/g, (match, p1) => {
      return '"' + p1.replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "") + '"';
    });

    let aiResponse: PBSAnalysisResult;
    try {
      aiResponse = JSON.parse(cleanedContent);
    } catch (parseError: any) {
      console.error("JSON Parse Error. Cleaned Content snippet:", cleanedContent.slice(0, 100));
      // 사용자에게 문제를 더 구체적으로 알림
      throw new Error(`분석 결과 해석 실패: ${parseError.message}. (응답 시작: ${cleanedContent.slice(0, 40)}...)`);
    }

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
