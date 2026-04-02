import { getDb } from "@/lib/prisma";
import DailyReportsClient from "./DailyReportsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function DailyReportsPage() {
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

  const rows = await db.dailyReport.findMany({
    where: condition,
    include: {
      patient: { select: { name: true } },
      staff: { select: { name: true } }
    },
    orderBy: { date: 'desc' },
    take: 100
  });

  const formattedRecords = rows.map(rec => {
    let dateStr = "날짜 없음";
    try {
      const dateObj = new Date(rec.date);
      dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
    } catch {}

    // 맵 처리 (한글 변환)
    const mealMap: any = { GOOD: "양호", NORMAL: "보통", REJECT: "결식" };
    const sleepMap: any = { GOOD: "양호", FAIR: "보통", POOR: "불량" };
    const moodMap: any = { HAPPY: "좋음 😊", CALM: "평온 😐", ANXIOUS: "불안 😰", ANGRY: "긴장 😡" };

    return {
      id: rec.id,
      date: dateStr,
      patientName: rec.patient?.name || "알 수 없음",
      meal: rec.mealStatus ? (mealMap[rec.mealStatus] || rec.mealStatus) : "-",
      sleep: rec.sleepQuality ? (sleepMap[rec.sleepQuality] || rec.sleepQuality) : "-",
      mood: rec.mood ? (moodMap[rec.mood] || rec.mood) : "-",
      notes: rec.notes || "-",
      reporter: rec.staff?.name || "기록자 누락"
    };
  });

  return <DailyReportsClient initialRecords={formattedRecords} />;
}
