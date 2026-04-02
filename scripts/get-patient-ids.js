const Database = require('better-sqlite3');
const db = new Database('dev.db', { readonly: true });
const patients = db.prepare("SELECT id, name FROM Patient").all();
console.log(JSON.stringify(patients, null, 2));
db.close();
