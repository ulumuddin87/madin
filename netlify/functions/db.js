// db.js
import pkg from "pg";
const { Pool } = pkg;

// DATABASE_URL di-set di Netlify (Site settings -> Environment)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  // Supabase requires SSL but rejectUnauthorized false in many hosts
  ssl: connectionString && connectionString.includes("supabase") ? { rejectUnauthorized: false } : false
});

export default pool;
