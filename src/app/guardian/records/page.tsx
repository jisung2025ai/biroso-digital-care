import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuardianRecordsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  if (role !== "GUARDIAN") redirect("/admin");

  const patient = await prisma.patient.findFirst({ where: { guardianId: userId } }).catch(() => null);
  if (!patient) redirect("/guardian");

  const records = await prisma.behaviorRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { recordDate: "desc" },
    take: 100,
  });

  const intensityColor: Record<string, string> = {
    HIGH: "bg-red-900/30 text-red-300 border-red-700/30",
    MID:  "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
    LOW:  "bg-green-900/30 text-green-300 border-green-700/30",
  };
  const intensityLabel: Record<string, string> = { HIGH: "높음", MID: "보통", LOW: "낮음" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-orange-400" size={24} />
          행동 기록
        </h2>
        <p className="text-slate-400 text-sm mt-1">{patient.name}님의 도전행동 관찰 기록 (최근 100건)</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Activity size={40} className="mx-auto mb-3 opacity-30" />
          <p>기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{r.behaviorType}</span>
                  {r.intensity && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${intensityColor[r.intensity] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                      {intensityLabel[r.intensity] || r.intensity}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(r.recordDate).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {r.antecedent && (
                <p className="text-xs text-slate-400"><span className="text-slate-500">선행사건:</span> {r.antecedent}</p>
              )}
              {r.consequence && (
                <p className="text-xs text-slate-400 mt-1"><span className="text-slate-500">중재:</span> {r.consequence}</p>
              )}
              {r.durationMin && (
                <p className="text-xs text-slate-500 mt-1">지속시간: {r.durationMin}분</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
