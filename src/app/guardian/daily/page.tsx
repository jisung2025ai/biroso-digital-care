import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuardianDailyPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  if (role !== "GUARDIAN") redirect("/admin");

  const patient = await prisma.patient.findFirst({ where: { guardianId: userId } }).catch(() => null);
  if (!patient) redirect("/guardian");

  const reports = await prisma.dailyReport.findMany({
    where: { patientId: patient.id },
    orderBy: { date: "desc" },
    take: 100,
  });

  const moodMap: Record<string, string> = { HAPPY: "😊 좋음", ANXIOUS: "😰 불안", ANGRY: "😠 화남" };
  const mealMap: Record<string, string> = { GOOD: "✅ 잘 먹음", REJECT: "❌ 거부", NORMAL: "😐 보통" };
  const sleepMap: Record<string, string> = { GOOD: "😴 양호", FAIR: "😐 보통", POOR: "😣 불량" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-teal-400" size={24} />
          생활 일지
        </h2>
        <p className="text-slate-400 text-sm mt-1">{patient.name}님의 식사·기분·건강 일지 (최근 100건)</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">
                  {new Date(r.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">식사</p>
                  <p className="text-xs font-medium text-white">{mealMap[r.mealStatus || ""] || "-"}</p>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">기분</p>
                  <p className="text-xs font-medium text-white">{moodMap[r.mood || ""] || "-"}</p>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">수면</p>
                  <p className="text-xs font-medium text-white">{sleepMap[r.sleepQuality || ""] || "-"}</p>
                </div>
              </div>
              {r.notes && (
                <p className="text-xs text-slate-400 bg-slate-700/30 p-2.5 rounded-lg mt-2">
                  💬 {r.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
