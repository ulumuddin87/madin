// ========================================
// 🔹 KONEKSI SUPABASE
// ========================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🔹 AMBIL ID MURID & ELEMNEN FORM
// ========================================
const params = new URLSearchParams(window.location.search);
const muridId = params.get("id");

const formNilai = document.getElementById("formNilai");
const listMapel = document.getElementById("listMapel");
const judul = document.getElementById("judul");
const semesterSelect = document.getElementById("semester");
const catatanWali = document.getElementById("catatanWali");
const btnSubmit = document.getElementById("btnSubmit");

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
// 🔹 LOAD MAPEL & CATATAN
// ========================================
async function loadMapel() {
  const semester = semesterSelect.value;

  // Ambil data mapel
  const { data: mapelData, error: mapelError } = await supabase.from("mapel").select("*");
  if (mapelError) return alert("Gagal ambil data mapel: " + mapelError.message);

  // Cek nilai murid semester ini
  const { data: nilaiData, error: nilaiError } = await supabase
    .from("nilai")
    .select("mapel_id, nilai, deskripsi")
    .eq("murid_id", muridId)
    .eq("semester", semester);

  if (nilaiError) return alert("Gagal cek nilai: " + nilaiError.message);

  // Load catatan wali kelas
  const { data: muridData } = await supabase.from("murid")
    .select("catatan_ganjil, catatan_genap")
    .eq("id", muridId)
    .single();

  catatanWali.value = semester === "Ganjil" ? muridData.catatan_ganjil || "" : muridData.catatan_genap || "";

  if (nilaiData && nilaiData.length > 0) {
    // tampilkan nilai lama
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

    catatanWali.disabled = true;
    btnSubmit.disabled = true;
    btnSubmit.innerText = "✅ Nilai & Catatan sudah diisi";
    return;
  }

  // kalau belum ada nilai → input baru
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

  catatanWali.disabled = false;
  btnSubmit.disabled = false;
  btnSubmit.innerText = "🚀 Simpan Nilai & Catatan";
}

// ========================================
// 🔹 SIMPAN NILAI & CATATAN
// ========================================
formNilai.addEventListener("submit", async (e) => {
  e.preventDefault();
  const semester = semesterSelect.value;
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

  // Simpan nilai
  const { error: nilaiError } = await supabase
    .from("nilai")
    .upsert(entries, { onConflict: "murid_id,mapel_id,semester" });

  if (nilaiError) return alert("❌ Gagal menyimpan nilai: " + nilaiError.message);

  // Simpan catatan wali kelas
  const catatanField = semester === "Ganjil" ? "catatan_ganjil" : "catatan_genap";
  const { error: catatanError } = await supabase
    .from("murid")
    .update({ [catatanField]: catatanWali.value.trim() })
    .eq("id", muridId);

  if (catatanError) return alert("❌ Gagal menyimpan catatan: " + catatanError.message);

  alert("✅ Nilai & catatan berhasil disimpan!");
  loadMapel();
});

// ========================================
// 🔹 EVENT: GANTI SEMESTER
// ========================================
semesterSelect.addEventListener("change", loadMapel);

// ========================================
// 🔹 JALANKAN SAAT HALAMAN DIBUKA
// ========================================
await loadMurid();
await loadMapel();
