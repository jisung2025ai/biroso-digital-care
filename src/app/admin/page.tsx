import { getDb } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const db = getDb();

  const behaviorWhere = userRole === "STAFF" && userId ? { staffId: userId } : {};
  const dailyWhere = userRole === "STAFF" && userId ? { staffId: userId } : {};

  // 1. 총 발생 건수
  const totalCount = await db.behaviorRecord.count({ where: behaviorWhere });

  // 2. 평균 지속 시간
  const aggDur = await db.behaviorRecord.aggregate({
    _avg: { durationMin: true },
    where: behaviorWhere
  });
  const avgDuration = parseFloat((aggDur._avg.durationMin ?? 0).toFixed(1));

  // 3. 행동 유형 그룹화
  const groupRows = await db.behaviorRecord.groupBy({
    by: ['behaviorType'],
    _count: { _all: true },
    where: behaviorWhere,
    orderBy: { _count: { behaviorType: 'desc' } }
  });
  const behaviorData = groupRows.map(r => ({ name: r.behaviorType, value: r._count._all }));
  const mostFrequentType = behaviorData.length > 0 ? behaviorData[0].name : "N/A";

  // 5. 식사/건강 기록 총 건수
  const dailyReportCount = await db.dailyReport.count({ where: dailyWhere });

  // 4. 최근 100건으로 요일별 추세
  const recentRows = await db.behaviorRecord.findMany({
    where: behaviorWhere,
    orderBy: { recordDate: 'desc' },
    take: 100,
    select: { recordDate: true, behaviorType: true }
  });

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const weeklyMap: Record<string, any> = {};
  for (const d of ["월","화","수","목","금","토","일"]) {
    weeklyMap[d] = { name: d, 자해: 0, 타해: 0, 물건파괴: 0, 도주: 0, 기타: 0 };
  }

  recentRows.forEach(rec => {
    try {
      const dateObj = new Date(rec.recordDate);
      const dayName = dayNames[dateObj.getDay()];
      if (weeklyMap[dayName]) {
        const typeKey = weeklyMap[dayName].hasOwnProperty(rec.behaviorType) ? rec.behaviorType : '기타';
        weeklyMap[dayName][typeKey] += 1;
      }
    } catch { /* skip malformed dates */ }
  });

  const weeklyData = Object.values(weeklyMap);

  return (
    <DashboardClient
      totalCount={totalCount}
      avgDuration={avgDuration}
      mostFrequentType={mostFrequentType}
      behaviorData={behaviorData}
      weeklyData={weeklyData}
      dailyReportCount={dailyReportCount}
    />
  );
}
