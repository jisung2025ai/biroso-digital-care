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

  // 1. 이용자(Patient) 조회 조건: 종사자는 본인 담당만, 관리자는 전체
  const pCondition = userRole === "STAFF" && userId ? { assignedStaffId: userId } : {};

  // 2. 유저(User) 조회 조건: 관리자는 전체, 종사자는 본인 + 모든 보호자(GUARDIAN)
  const sCondition = userRole === "STAFF" && userId
    ? { OR: [{ id: userId }, { role: "GUARDIAN" }] }
    : {};

  // 이용자(Patient) 전체 목록 (보호자 정보 포함)
  const patientsData = await db.patient.findMany({
    where: pCondition,
    include: {
      assignedStaff: { select: { name: true } },
      guardian: { select: { id: true, name: true } }, // 보호자 이름 조인
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
    guardianId: p.guardianId || "",
    guardianName: p.guardian?.name || "연결 없음",
    createdAt: p.createdAt.toISOString(),
    staffName: p.assignedStaff?.name || "",
    behaviorCount: p._count.behaviorRecords
  }));

  // 종사자 + 보호자 목록 분리 조회 (피보호 이용자 정보 포함)
  const allUsers = await db.user.findMany({
    where: sCondition,
    include: {
      guardedPatients: { select: { id: true, name: true } }, // 담당하는 이용자들 정보 조인
      _count: { select: { behaviorRecords: true } }
    }
  });

  const staffs = allUsers
    .filter(u => u.role === "ADMIN" || u.role === "STAFF")
    .map(u => ({
      id: u.id,
      name: u.name || "이름 없음",
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      recordCount: u._count.behaviorRecords
    }))
    .sort((a, b) => b.recordCount - a.recordCount);

  const guardians = allUsers
    .filter(u => u.role === "GUARDIAN")
    .map(u => ({
      id: u.id,
      name: u.name || "이름 없음",
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      // 보호자가 담당하는 환자 중 첫 번째 환자 정보를 표시 (현재 1:M 관계)
      patientName: u.guardedPatients.length > 0 ? u.guardedPatients[0].name : "연결 없음",
      patientId: u.guardedPatients.length > 0 ? u.guardedPatients[0].id : ""
    }));

  return (
    <UsersClient 
      patients={patients} 
      staffs={staffs} 
      guardians={guardians} 
      userRole={userRole} 
      userId={userId} 
    />
  );
}
