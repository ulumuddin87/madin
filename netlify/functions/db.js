// netlify/functions/db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Export default agar bisa di-import langsung
export default pool;
