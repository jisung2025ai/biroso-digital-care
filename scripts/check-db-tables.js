const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'dev.db');
console.log("Checking DB at:", dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tables found:", tables.map(t => t.name).join(", "));
  
  const hasPBSPlan = tables.some(t => t.name === 'PositiveBehaviorPlan');
  console.log("PositiveBehaviorPlan exists:", hasPBSPlan);

  if (hasPBSPlan) {
    const count = db.prepare("SELECT COUNT(*) as count FROM PositiveBehaviorPlan").get().count;
    console.log("Current PBS Plan count:", count);
  }
  
  db.close();
} catch (err) {
  console.error("DB Check Error:", err);
}
