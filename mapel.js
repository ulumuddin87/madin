import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========================================
// 🔹 KONEKSI SUPABASE
// ========================================
const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🔹 ELEMEN HTML
// ========================================
const tbody = document.querySelector("#tabelMapel tbody");
const formMapel = document.getElementById("formMapel");
const modalMapel = new bootstrap.Modal(document.getElementById("modalMapel"));
const modalTitle = document.getElementById("modalTitle");

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
// 🔹 RENDER TABEL
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
        <button class="btn btn-warning btn-sm me-1" onclick="editMapel(${m.id}, '${m.nama}', '${m.kategori}', '${m.deskripsi}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="hapusMapel(${m.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================================
// 🔹 TAMBAH / EDIT MAPEL
// ========================================
formMapel.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("mapelId").value;
  const nama = document.getElementById("nama").value.trim();
  const kategori = document.getElementById("kategori").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();

  if (!nama || !kategori) {
    alert("⚠️ Nama dan kategori wajib diisi!");
    return;
  }

  let error;
  if (id) {
    // UPDATE
    ({ error } = await db.from("mapel").update({ nama, kategori, deskripsi }).eq("id", id));
  } else {
    // INSERT
    ({ error } = await db.from("mapel").insert([{ nama, kategori, deskripsi }]));
  }

  if (error) {
    alert("❌ Gagal menyimpan mapel: " + error.message);
    return;
  }

  formMapel.reset();
  modalMapel.hide();
  setTimeout(loadMapel, 400);
});

// ========================================
// 🔹 HAPUS MAPEL
// ========================================
window.hapusMapel = async function (id) {
  if (!confirm("Yakin ingin menghapus mapel ini?")) return;
  const { error } = await db.from("mapel").delete().eq("id", id);
  if (error) alert("❌ Gagal hapus: " + error.message);
  else loadMapel();
};

// ========================================
// 🔹 EDIT MAPEL (BUKA MODAL)
// ========================================
window.editMapel = function (id, nama, kategori, deskripsi) {
  modalTitle.textContent = "Edit Mapel";
  document.getElementById("mapelId").value = id;
  document.getElementById("nama").value = nama;
  document.getElementById("kategori").value = kategori;
  document.getElementById("deskripsi").value = deskripsi;
  modalMapel.show();
};

// ========================================
// 🔹 RESET MODAL SAAT DITUTUP
// ========================================
document.getElementById("modalMapel").addEventListener("hidden.bs.modal", () => {
  formMapel.reset();
  document.getElementById("mapelId").value = "";
  modalTitle.textContent = "Tambah Mapel";
});

// ========================================
// 🔹 JALANKAN SAAT PAGE DIBUKA
// ========================================
loadMapel();
