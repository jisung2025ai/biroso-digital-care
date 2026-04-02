import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

console.log('--- Seeding Auth Users ---');

// 기존 유저 삭제 후 재생성 (테스트용)
db.prepare("DELETE FROM User WHERE email IN ('admin@broso.com', 'staff@broso.com')").run();

// Admin User
db.prepare(`
  INSERT INTO User (id, email, password, name, role, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'admin-id-001',
  'admin@broso.com',
  'admin123',
  '최중증관리자',
  'ADMIN',
  new Date().toISOString()
);

// Staff User
db.prepare(`
  INSERT INTO User (id, email, password, name, role, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'staff-id-001',
  'staff@broso.com',
  'staff123',
  '현장복지사',
  'STAFF',
  new Date().toISOString()
);

console.log('✅ Auth Users Seeded: admin@broso.com / admin123, staff@broso.com / staff123');
