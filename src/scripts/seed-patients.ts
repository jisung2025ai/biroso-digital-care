import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. 기본 관리자 계정 생성
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("No users found. Creating default admin account...");
    await prisma.user.create({
      data: {
        email: "admin@broso.com",
        password: "password123", // 실제 운영시에는 해시처리 권장
        name: "최고관리자",
        role: "ADMIN"
      }
    });
    console.log("Default admin account created: admin@broso.com / password123");
  }

  // 2. 기본 이용자 목록 생성
  const patientsCount = await prisma.patient.count();
  if (patientsCount === 0) {
    console.log("No patients found. Creating seed patients...");
    await prisma.patient.createMany({
      data: [
        { name: "이용자A", disabilityType: "자폐성장애", healthInfo: "특이사항 없음" },
        { name: "이용자B", disabilityType: "지적장애", healthInfo: "약물 복용 중" },
        { name: "이용자C", disabilityType: "뇌병변장애", healthInfo: "휠체어 이용" },
      ],
    });
    console.log("Seed patients created.");
  } else {
    console.log(`${patientsCount} patients already exist.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
