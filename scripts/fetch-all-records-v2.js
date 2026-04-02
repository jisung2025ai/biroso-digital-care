const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath, { readonly: true });

try {
  const patients = db.prepare("SELECT * FROM Patient").all();

  console.log("=== AI PBS 분석용 데이터 추출 결과 ===");
  
  patients.forEach(p => {
    console.log(`\n[대상자: ${p.name}] (장애유형: ${p.disabilityType || '미지정'})`);
    
    // 최근 5개 도전행동 기록
    const abc = db.prepare("SELECT * FROM BehaviorRecord WHERE patientId = ? ORDER BY recordDate DESC LIMIT 5").all(p.id);
    console.log("  <최근 도전행동 기록>");
    abc.forEach(b => {
      console.log(`  - [${b.behaviorType}] 상황: ${b.antecedent || '기록없음'} / 조치: ${b.consequence || '기록없음'}`);
    });

    // 최근 5개 일상 건강 기록
    const daily = db.prepare("SELECT * FROM DailyReport WHERE patientId = ? ORDER BY date DESC LIMIT 5").all(p.id);
    console.log("  <최근 식사/건강 상태>");
    daily.forEach(d => {
      console.log(`  - 기분: ${d.mood || '평대'} / 식사: ${d.mealStatus || '보통'} / 수면: ${d.sleepQuality || '보통'}`);
    });
  });
} catch (err) {
  console.error("데이터 조회 실패:", err);
} finally {
  db.close();
}
