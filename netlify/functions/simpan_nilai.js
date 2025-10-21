// simpan_nilai.js
import pool from "./db.js";

function generateDiskripsi(bacaan, menulis, hafalan, ahlak, kehadiran) {
  return `Bacaan: ${bacaan}, Menulis: ${menulis}, Hafalan: ${hafalan}, Ahlak: ${ahlak}, Kehadiran: ${kehadiran}`;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const d = JSON.parse(event.body || "{}");
    const id = d.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const { bacaan, menulis, hafalan, ahlak, kehadiran } = d;
    const diskripsi = d.diskripsi || generateDiskripsi(bacaan, menulis, hafalan, ahlak, kehadiran);

    const client = await pool.connect();
    await client.query(
      `UPDATE murid SET 
        nilai_bacaan=$1, nilai_menulis=$2, nilai_hafalan=$3, nilai_ahlak=$4,
        nilai_kehadiran=$5, diskripsi=$6
       WHERE id=$7`,
      [bacaan, menulis, hafalan, ahlak, kehadiran, diskripsi, id]
    );
    client.release();

    return { statusCode: 200, body: JSON.stringify({ message: "Nilai berhasil disimpan" }) };
  } catch (err) {
    console.error("simpan_nilai error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal menyimpan nilai" }) };
  }
}
