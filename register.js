import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const registerForm = document.getElementById("registerForm");
const roleSelect = document.getElementById("role");
const kelasField = document.getElementById("kelasField");

roleSelect.addEventListener("change", () => {
  kelasField.style.display = roleSelect.value === "guru" ? "block" : "none";
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value.trim();
  const kelas = document.getElementById("kelas").value.trim();

  if (!nama || !email || !password || !role) {
    alert("⚠️ Semua field wajib diisi!");
    return;
  }

  try {
    const { data, error } = await db
      .from("users")
      .insert([{ nama, email, password, role, kelas: role === "guru" ? kelas : null }])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      alert("Gagal menyimpan data ke database!");
      return;
    }

    alert(`✅ Registrasi berhasil untuk ${nama} (${role})`);
    window.location.href = "login.html";
  } catch (err) {
    console.error("🔥 Error registrasi:", err);
    alert("Terjadi kesalahan saat registrasi!");
  }
});
