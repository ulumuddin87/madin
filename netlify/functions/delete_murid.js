// delete_murid.js
import pool from "./db.js";

export async function handler(event) {
  // Expecting ?id=123 (GET request) or POST with { id }
  const id = event.queryStringParameters?.id;
  try {
    let parsedId = id;
    if (!parsedId && event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      parsedId = body.id;
    }
    if (!parsedId) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const client = await pool.connect();
    await client.query("DELETE FROM murid WHERE id=$1", [parsedId]);
    client.release();

    return { statusCode: 200, body: JSON.stringify({ message: "Berhasil menghapus murid" }) };
  } catch (err) {
    console.error("delete_murid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal menghapus murid" }) };
  }
}
