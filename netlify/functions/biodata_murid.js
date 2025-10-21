// biodata_murid.js
import pool from "./db.js";

export async function handler(event) {
  // GET ?id=123  -> return single row
  // POST body -> update
  try {
    if (event.httpMethod === "GET") {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

      const client = await pool.connect();
      const res = await client.query("SELECT * FROM murid WHERE id=$1", [id]);
      client.release();
      if (res.rows.length === 0) return { statusCode: 404, body: JSON.stringify({ error: "Tidak ditemukan" }) };

      return { statusCode: 200, body: JSON.stringify(res.rows[0]) };
    }

    if (event.httpMethod === "POST") {
      const d = JSON.parse(event.body || "{}");
      const id = d.id || event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

      const client = await pool.connect();
      await client.query(
        `UPDATE murid SET 
         nama=$1, no_induk=$2, nik=$3, tempat_tanggal_lahir=$4, jenis_kelamin=$5,
         status_dalam_keluarga=$6, anak_ke=$7, nama_ayah=$8, no_tlp_ayah=$9, pekerjaan_ayah=$10,
         nama_ibu=$11, no_tlp_ibu=$12, pekerjaan_ibu=$13, dusun=$14, rt=$15, rw=$16, desa=$17,
         kecamatan=$18, kabupaten_kota=$19, provinsi=$20
         WHERE id=$21`,
        [
          d.nama, d.no_induk, d.nik, d.tempat_tanggal_lahir, d.jenis_kelamin,
          d.status_dalam_keluarga, d.anak_ke, d.nama_ayah, d.no_tlp_ayah, d.pekerjaan_ayah,
          d.nama_ibu, d.no_tlp_ibu, d.pekerjaan_ibu, d.dusun, d.rt, d.rw, d.desa,
          d.kecamatan, d.kabupaten_kota, d.provinsi, id
        ]
      );
      client.release();
      return { statusCode: 200, body: JSON.stringify({ message: "Biodata berhasil disimpan" }) };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("biodata_murid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal menyimpan biodata" }) };
  }
}
