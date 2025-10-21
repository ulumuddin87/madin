// login.js
export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { username, password } = JSON.parse(event.body || "{}");
    // sederhana — sama dengan Flask: admin/admin
    if (username === "admin" && password === "admin") {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "Username atau password salah" })
      };
    }
  } catch (err) {
    console.error("login error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Login error" }) };
  }
}
