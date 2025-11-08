console.log("✅ login.js berhasil dimuat!");

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Email dan password wajib diisi!");
    return;
  }

  try {
    const { data, error } = await db
      .from("users")
      .select("id, email, role, nama, password")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error:", error);
      alert("Terjadi kesalahan koneksi database!");
      return;
    }

    if (!data) {
      alert("❌ Email atau password salah!");
      return;
    }

    if (!data.role) {
      alert("⚠️ Akun ini belum memiliki role di database!");
      return;
    }

    // Simpan user login di localStorage
    localStorage.setItem("user", JSON.stringify(data));

    // 🔹 Langsung redirect tanpa alert
    switch (data.role.toLowerCase()) {
      case "admin":
        window.location.href = "index.html";
        break;
      case "guru":
        window.location.href = "guru_dashboard.html";
        break;
      case "kepala":
        window.location.href = "kepala_dashboard.html";
        break;
      default:
        window.location.href = "index.html";
    }
  } catch (err) {
    console.error("🔥 Error saat login:", err);
    alert("Terjadi kesalahan saat login, periksa console log!");
  }
});
