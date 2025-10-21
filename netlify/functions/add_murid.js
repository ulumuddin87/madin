// add_murid.js
import pool from "./db.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const { nama, jilid, kelas, alamat, wali_murid, wali_kelas } = body;

    const client = await pool.connect();
    await client.query(
      `INSERT INTO murid (nama, jilid, kelas, alamat, wali_murid, wali_kelas)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [nama, jilid, kelas, alamat, wali_murid, wali_kelas]
    );
    client.release();

    return { statusCode: 200, body: JSON.stringify({ message: "Berhasil menambah murid" }) };
  } catch (err) {
    console.error("add_murid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal menambah murid" }) };
  }
}
