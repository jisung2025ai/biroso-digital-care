import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Activity, BookOpen, Heart, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuardianPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  if (role !== "GUARDIAN") redirect("/admin");

  // 담당 이용자 조회
  const patient = await prisma.patient.findFirst({
    where: { guardianId: userId },
  }).catch(() => null);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="text-yellow-400" size={48} />
        <h2 className="text-xl font-bold text-white">담당 이용자가 없습니다</h2>
        <p className="text-slate-400 text-sm">관리자에게 이용자 연결을 요청해 주세요.</p>
      </div>
    );
  }

  // 최근 7일 행동 기록
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentBehaviors, recentDailyReports, totalBehaviors] = await Promise.all([
    prisma.behaviorRecord.findMany({
      where: { patientId: patient.id, recordDate: { gte: sevenDaysAgo } },
      orderBy: { recordDate: "desc" },
      take: 5,
    }),
    prisma.dailyReport.findMany({
      where: { patientId: patient.id },
      orderBy: { date: "desc" },
      take: 3,
    }),
    prisma.behaviorRecord.count({ where: { patientId: patient.id } }),
  ]);

  const intensityMap: Record<string, string> = { LOW: "낮음", MID: "보통", HIGH: "높음" };
  const moodMap: Record<string, string> = { HAPPY: "😊 좋음", ANXIOUS: "😰 불안", ANGRY: "😠 화남" };
  const mealMap: Record<string, string> = { GOOD: "✅ 잘 먹음", REJECT: "❌ 거부", NORMAL: "😐 보통" };

  const latestReport = recentDailyReports[0];

  return (
    <div className="space-y-6">
      {/* 이용자 프로필 카드 */}
      <div className="bg-gradient-to-r from-teal-900/60 to-emerald-900/60 border border-teal-700/40 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-teal-500/20">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-teal-300 text-sm">{patient.disabilityType || "장애 유형 미입력"}</p>
            <p className="text-slate-400 text-xs mt-1">
              생년월일: {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("ko-KR") : "미입력"}
            </p>
          </div>
        </div>
      </div>

      {/* 요약 지표 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-400">{totalBehaviors}</p>
          <p className="text-xs text-slate-400 mt-1">총 행동 기록</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{recentBehaviors.length}</p>
          <p className="text-xs text-slate-400 mt-1">최근 7일 발생</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-emerald-400">
            {latestReport ? moodMap[latestReport.mood || ""] || "-" : "-"}
          </p>
          <p className="text-xs text-slate-400 mt-1">최근 기분</p>
        </div>
      </div>

      {/* 최근 건강/생활 상태 */}
      {latestReport && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} className="text-rose-400" />
            <h3 className="font-semibold text-white text-sm">최근 생활 상태</h3>
            <span className="text-xs text-slate-500 ml-auto">
              {new Date(latestReport.date).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">식사</p>
              <p className="text-sm font-medium text-white">{mealMap[latestReport.mealStatus || ""] || "-"}</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">기분</p>
              <p className="text-sm font-medium text-white">{moodMap[latestReport.mood || ""] || "-"}</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">수면</p>
              <p className="text-sm font-medium text-white">
                {latestReport.sleepQuality === "GOOD" ? "😴 양호" : latestReport.sleepQuality === "POOR" ? "😣 불량" : "😐 보통"}
              </p>
            </div>
          </div>
          {latestReport.notes && (
            <p className="mt-3 text-xs text-slate-400 bg-slate-700/30 p-3 rounded-lg">
              💬 {latestReport.notes}
            </p>
          )}
        </div>
      )}

      {/* 최근 행동 기록 */}
      {recentBehaviors.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-orange-400" />
            <h3 className="font-semibold text-white text-sm">최근 행동 기록 (7일)</h3>
          </div>
          <div className="space-y-2">
            {recentBehaviors.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div>
                  <span className="text-sm font-medium text-white">{r.behaviorType}</span>
                  {r.antecedent && <span className="text-xs text-slate-500 ml-2">· {r.antecedent}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.intensity === "HIGH" ? "bg-red-900/40 text-red-300" :
                    r.intensity === "MID" ? "bg-yellow-900/40 text-yellow-300" :
                    "bg-green-900/40 text-green-300"
                  }`}>
                    {intensityMap[r.intensity || ""] || r.intensity}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(r.recordDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/guardian/records"
          className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-700/30 rounded-xl p-5 hover:border-orange-500/50 transition-all group">
          <Activity size={24} className="text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-white text-sm">행동 기록 전체 보기</p>
          <p className="text-xs text-slate-400 mt-1">도전행동 상세 기록 열람</p>
        </a>
        <a href="/guardian/daily"
          className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 border border-teal-700/30 rounded-xl p-5 hover:border-teal-500/50 transition-all group">
          <BookOpen size={24} className="text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-white text-sm">생활 일지 전체 보기</p>
          <p className="text-xs text-slate-400 mt-1">식사·기분·건강 일지 열람</p>
        </a>
      </div>
    </div>
  );
}
