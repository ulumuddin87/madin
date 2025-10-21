// edit_murid.js
import pool from "./db.js";

export async function handler(event) {
  if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const id = body.id || event.queryStringParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const { nama, jilid, kelas, alamat, wali_murid, wali_kelas } = body;

    const client = await pool.connect();
    await client.query(
      `UPDATE murid SET nama=$1, jilid=$2, kelas=$3, alamat=$4, wali_murid=$5, wali_kelas=$6 WHERE id=$7`,
      [nama, jilid, kelas, alamat, wali_murid, wali_kelas, id]
    );
    client.release();

    return { statusCode: 200, body: JSON.stringify({ message: "Berhasil update murid" }) };
  } catch (err) {
    console.error("edit_murid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal update murid" }) };
  }
}
