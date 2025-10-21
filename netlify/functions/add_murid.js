import pool from "./db.js";

export async function handler(event) {
  const data = JSON.parse(event.body);

  try {
    const result = await pool.query(
      `INSERT INTO murid (nama, jilid, kelas, alamat, wali_murid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.nama, data.jilid, data.kelas, data.alamat, data.wali_murid]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
