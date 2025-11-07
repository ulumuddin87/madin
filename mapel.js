// ========================================
// 🔹 KONEKSI SUPABASE
// ========================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co"; // 🔸 ganti dengan milikmu
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🔹 ELEMEN HTML
// ========================================
const tbody = document.querySelector("#tabelMapel tbody");
const formTambah = document.querySelector("#formTambah");

// ========================================
// 🔹 LOAD DATA MAPEL
// ========================================
async function loadMapel() {
  const { data, error } = await db.from("mapel").select("*").order("id", { ascending: false });

  if (error) {
    console.error("Gagal load mapel:", error);
    alert("❌ Gagal memuat mapel: " + error.message);
    return;
  }

  renderTabel(data);
}

// ========================================
// 🔹 TAMPILKAN DATA KE TABEL
// ========================================
function renderTabel(mapel) {
  tbody.innerHTML = "";
  mapel.forEach((m, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i + 1}</td>
      <td>${m.nama}</td>
      <td>${m.kategori}</td>
      <td>${m.deskripsi}</td>
      <td class="text-center">
        <button class="btn btn-warning btn-sm" onclick="editMapel(${m.id}, '${m.nama}', '${m.kategori}', '${m.deskripsi}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="hapusMapel(${m.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================================
// 🔹 TAMBAH MAPEL
// ========================================
formTambah.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const kategori = document.getElementById("kategori").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();

  const { error } = await db.from("mapel").insert([{ nama, kategori, deskripsi }]);
  if (error) {
    console.error("Gagal tambah mapel:", error);
    alert("❌ Gagal tambah mapel: " + error.message);
    return;
  }

  formTambah.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalTambah")).hide();
  loadMapel();
});

// ========================================
// 🔹 HAPUS MAPEL
// ========================================
window.hapusMapel = async function (id) {
  if (!confirm("Yakin ingin menghapus mapel ini?")) return;
  const { error } = await db.from("mapel").delete().eq("id", id);
  if (error) {
    alert("❌ Gagal hapus: " + error.message);
    return;
  }
  loadMapel();
};

// ========================================
// 🔹 EDIT MAPEL
// ========================================
window.editMapel = async function (id, nama, kategori, deskripsi) {
  const newNama = prompt("Ubah nama mapel:", nama);
  if (newNama === null) return;

  const { error } = await db
    .from("mapel")
    .update({ nama: newNama, kategori, deskripsi })
    .eq("id", id);

  if (error) {
    alert("❌ Gagal ubah: " + error.message);
    return;
  }

  loadMapel();
};

// ========================================
// 🔹 JALANKAN SAAT PAGE DIBUKA
// ========================================
loadMapel();
