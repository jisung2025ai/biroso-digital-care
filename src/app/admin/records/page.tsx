import { getDb } from "@/lib/prisma";
import RecordsClient from "./RecordsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { date?: string };
}

export default async function RecordsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  // 1. 날짜 결정 (기본값: 오늘)
  const today = new Date();
  const dateStr = searchParams.date || today.toISOString().split('T')[0];
  
  // 2. 해당 날짜의 시작과 끝 계산 (지역 시각 기준 대응)
  const startDate = new Date(`${dateStr}T00:00:00`);
  const endDate = new Date(`${dateStr}T23:59:59`);

  const db = getDb();
  
  // 3. 권한별 조건 구성
  const condition: any = {
    recordDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (userRole === "STAFF" && userId) {
    condition.OR = [
      { staffId: userId },
      { patient: { assignedStaffId: userId } }
    ];
  }

  // 4. 데이터 조회 (날짜 필터링 적용)
  const rows = await db.behaviorRecord.findMany({
    where: condition,
    include: {
      patient: { select: { name: true } },
      staff: { select: { name: true } }
    },
    orderBy: { recordDate: 'desc' },
  });

  const formattedRecords = rows.map(rec => {
    let displayDate = "날짜 없음";
    try {
      const dateObj = new Date(rec.recordDate);
      displayDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
    } catch {}

    return {
      id: rec.id,
      patientId: rec.patientId,
      date: displayDate,
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

  return <RecordsClient initialRecords={formattedRecords} currentDate={dateStr} />;
}
