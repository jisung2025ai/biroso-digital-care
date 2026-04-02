const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    include: {
      behaviorRecords: true,
      dailyReports: true
    }
  });

  console.log("=== PATIENT DATA ANALYSIS ===");
  patients.forEach(p => {
    console.log(`\n[PATIENT: ${p.name}] (${p.disabilityType || 'Unknown'})`);
    
    console.log("--- Recent ABC Records ---");
    p.behaviorRecords.slice(-5).forEach(b => {
      console.log(`- ${b.recordDate}: Type: ${b.behaviorType}, Ante: ${b.antecedent}, Cons: ${b.consequence}`);
    });

    console.log("--- Recent Daily Reports ---");
    p.dailyReports.slice(-5).forEach(d => {
      console.log(`- ${d.date}: Meal: ${d.mealStatus}, Sleep: ${d.sleepQuality}, Mood: ${d.mood}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
