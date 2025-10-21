// get_murid.js
import pool from "./db.js";

export async function handler() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT * FROM murid ORDER BY id ASC");
    client.release();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
      headers: { "Content-Type": "application/json" }
    };
  } catch (err) {
    console.error("get_murid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal mengambil data murid" }) };
  }
}
