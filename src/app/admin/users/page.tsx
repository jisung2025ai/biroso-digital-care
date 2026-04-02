import { getDb } from "@/lib/prisma";
import UsersClient from "./UsersClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const db = getDb();

  const pCondition = userRole === "STAFF" && userId ? { assignedStaffId: userId } : {};
  const sCondition = userRole === "STAFF" && userId ? { id: userId } : {};

  // 이용자(Patient) 전체 목록
  const patientsData = await db.patient.findMany({
    where: pCondition,
    include: {
      assignedStaff: { select: { name: true } },
      _count: { select: { behaviorRecords: true } }
    },
    orderBy: { name: 'asc' }
  });

  const patients = patientsData.map(p => ({
    id: p.id,
    name: p.name,
    disabilityType: p.disabilityType || "",
    birthDate: p.birthDate?.toISOString() || "",
    healthInfo: p.healthInfo || "",
    assignedStaffId: p.assignedStaffId || "",
    createdAt: p.createdAt.toISOString(),
    staffName: p.assignedStaff?.name || "",
    behaviorCount: p._count.behaviorRecords
  }));

  // 종사자(Staff) 전체 목록 (STAFF인 경우 본인만 보여줌)
  const staffsData = await db.user.findMany({
    where: sCondition,
    include: {
      _count: { select: { behaviorRecords: true } }
    }
  });

  const staffs = staffsData.map(u => ({
    id: u.id,
    name: u.name || "이름 없음",
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    recordCount: u._count.behaviorRecords
  })).sort((a, b) => b.recordCount - a.recordCount);

  return <UsersClient patients={patients} staffs={staffs} userRole={userRole} userId={userId} />;
}
