import { getDb } from "@/lib/prisma";
import RecordsClient from "./RecordsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function RecordsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const db = getDb();
  
  const condition = userRole === "STAFF" && userId ? {
    OR: [
      { staffId: userId },
      { patient: { assignedStaffId: userId } }
    ]
  } : {};

  const rows = await db.behaviorRecord.findMany({
    where: condition,
    include: {
      patient: { select: { name: true } },
      staff: { select: { name: true } }
    },
    orderBy: { recordDate: 'desc' },
    take: 30
  });

  const formattedRecords = rows.map(rec => {
    let dateStr = "날짜 없음";
    try {
      const dateObj = new Date(rec.recordDate);
      dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
    } catch {}

    return {
      id: rec.id,
      patientId: rec.patientId,
      date: dateStr,
      name: rec.patient?.name || "알 수 없음",
      type: rec.behaviorType,
      detail: rec.behaviorDetail || "",
      intensity: rec.intensity || "",
      duration: `${rec.durationMin || 0}분`,
      antecedent: rec.antecedent || "내용 없음",
      consequence: rec.consequence || "내용 없음",
      reporter: rec.staff?.name || "기록자 누락"
    };
  });

  return <RecordsClient initialRecords={formattedRecords} />;
}
