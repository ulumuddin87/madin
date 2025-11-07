// ========================================
// 🔹 KONEKSI SUPABASE
// ========================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🔹 AMBIL ID MURID DARI URL
// ========================================
const params = new URLSearchParams(window.location.search);
const muridId = params.get("id");
const formNilai = document.getElementById("formNilai");
const listMapel = document.getElementById("listMapel");
const judul = document.getElementById("judul");

// ========================================
// 🔹 TAMPILKAN NAMA MURID DI JUDUL
// ========================================
async function loadMurid() {
  const { data, error } = await supabase
    .from("murid")
    .select("nama")
    .eq("id", muridId)
    .single();
  if (error) {
    console.error(error);
    judul.innerText = "Nilai Murid";
  } else {
    judul.innerText = `Nilai Murid: ${data.nama}`;
  }
}

// ========================================
// 🔹 AMBIL DAFTAR MAPEL
// ========================================
// Ambil daftar mapel dan nilai murid
async function loadMapel() {
  const semester = document.getElementById("semester").value;

  // 1️⃣ Ambil data mapel
  const { data: mapelData, error: mapelError } = await supabase.from("mapel").select("*");
  if (mapelError) return alert("Gagal ambil data mapel: " + mapelError.message);

  // 2️⃣ Cek apakah murid ini sudah punya nilai di semester ini
  const { data: nilaiData, error: nilaiError } = await supabase
    .from("nilai")
    .select("mapel_id, nilai, deskripsi")
    .eq("murid_id", muridId)
    .eq("semester", semester);

  if (nilaiError) return alert("Gagal cek nilai: " + nilaiError.message);

  // 3️⃣ Jika sudah ada nilai, tampilkan tapi input dikunci (readonly)
  if (nilaiData && nilaiData.length > 0) {
    listMapel.innerHTML = mapelData.map(m => {
      const n = nilaiData.find(x => x.mapel_id === m.id);
      return `
        <div class="col-md-6">
          <label class="form-label">${m.nama}</label>
          <input type="number" class="form-control" value="${n ? n.nilai : ''}" readonly>
        </div>
        <div class="col-md-6">
          <label class="form-label">Deskripsi ${m.nama}</label>
          <input type="text" class="form-control" value="${n ? n.deskripsi : ''}" readonly>
        </div>
      `;
    }).join("");

    // Nonaktifkan tombol simpan
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "✅ Nilai sudah diisi";
    alert("Nilai untuk semester ini sudah diisi, tidak dapat diedit lagi dari frontend.");
    return;
  }

  // 4️⃣ Kalau belum ada nilai, tampilkan input baru
  listMapel.innerHTML = mapelData.map(m => `
    <div class="col-md-6">
      <label class="form-label">${m.nama}</label>
      <input type="number" class="form-control" name="mapel_${m.id}" placeholder="Nilai ${m.nama}" required>
    </div>
    <div class="col-md-6">
      <label class="form-label">Deskripsi ${m.nama}</label>
      <input type="text" class="form-control" name="deskripsi_${m.id}" placeholder="Deskripsi singkat" required>
    </div>
  `).join("");
}


// ========================================
// 🔹 MUAT NILAI YANG SUDAH ADA
// ========================================
async function loadNilaiLama() {
  const semester = document.getElementById("semester").value;
  const { data, error } = await supabase
    .from("nilai")
    .select("mapel_id, nilai, deskripsi")
    .eq("murid_id", muridId)
    .eq("semester", semester);

  if (error || !data) return;

  data.forEach((n) => {
    const nilaiInput = document.querySelector(`[name='mapel_${n.mapel_id}']`);
    const deskInput = document.querySelector(`[name='deskripsi_${n.mapel_id}']`);
    if (nilaiInput) nilaiInput.value = n.nilai;
    if (deskInput) deskInput.value = n.deskripsi;
  });
}

// ========================================
// 🔹 EVENT: GANTI SEMESTER -> LOAD NILAI
// ========================================
document.getElementById("semester").addEventListener("change", loadNilaiLama);

// ========================================
// 🔹 SIMPAN NILAI KE DATABASE
// ========================================
formNilai.addEventListener("submit", async (e) => {
  e.preventDefault();
  const semester = document.getElementById("semester").value;
  const inputs = new FormData(formNilai);

  const entries = [];
  for (const [key, value] of inputs.entries()) {
    if (key.startsWith("mapel_")) {
      const id = key.split("_")[1];
      const deskripsi = inputs.get(`deskripsi_${id}`);
      entries.push({
        murid_id: muridId,
        mapel_id: id,
        semester,
        nilai: parseFloat(value) || 0,
        deskripsi: deskripsi || "",
      });
    }
  }

  // Simpan (insert atau update)
  const { error } = await supabase
    .from("nilai")
    .upsert(entries, { onConflict: "murid_id,mapel_id,semester" });

  if (error) alert("❌ Gagal menyimpan nilai: " + error.message);
  else alert("✅ Nilai berhasil disimpan!");
});

// ========================================
// 🔹 JALANKAN SAAT HALAMAN DIBUKA
// ========================================
await loadMurid();
await loadMapel();
