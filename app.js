// ========================================
// 🔹 KONEKSI SUPABASE
// ========================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🔹 ELEMEN HTML
// ========================================
const muridTableBody = document.querySelector("#muridTable tbody");
const searchInput = document.getElementById("searchInput");
const kelasFilter = document.getElementById("kelasFilter");
const jilidFilter = document.getElementById("jilidFilter");
const filterForm = document.getElementById("filterForm");
const muridForm = document.getElementById("muridForm");
const modalTitle = document.getElementById("modalFormLabel");
const muridIdInput = document.getElementById("muridId");

let muridData = [];

// ========================================
// 🔹 ROLE USER
// ========================================
// role dan kelas user disimpan saat login di localStorage
// Ambil role & info user langsung dari object "user"
const userData = JSON.parse(localStorage.getItem("user")) || {};
const userRole = userData.role || null;   // admin / guru / kepala


function setupRoleAccess() {
  if (!userRole) {
    alert("Role user tidak ditemukan. Silakan login kembali.");
    window.location.href = "login.html";
    return;
  }

  const btnTambah = document.querySelector("[data-bs-target='#modalForm']");
  const allInputs = document.querySelectorAll("#modalForm input, #modalForm select");
  const btnSimpan = document.querySelector("#modalForm button[type='submit']");

  if (userRole === "kepala") {
    // Kepala hanya bisa lihat → sembunyikan tombol tambah & edit
    if (btnTambah) btnTambah.style.display = "none";
    allInputs.forEach((i) => (i.disabled = true));
    if (btnSimpan) btnSimpan.style.display = "none";
  }

  if (userRole === "guru") {
    // Guru bisa edit tapi hanya murid kelas mereka
    // Saat renderTable nanti kita akan filter otomatis
    window.userKelasFilter = userKelas;
  }

  // admin → akses penuh, tidak ada batasan
}



// ========================================
// 🔹 LOAD DATA MURID
// ========================================
async function loadMurid() {
  const { data, error } = await db
    .from("murid")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error("Gagal load data:", error.message);
    alert("Gagal load data murid: " + error.message);
    return;
  }
  muridData = data;
  populateFilters();
  renderTable(muridData);
}

// ========================================
// 🔹 ISI DROPDOWN FILTER
// ========================================
function populateFilters() {
  const kelasSet = new Set();
  const jilidSet = new Set();
  muridData.forEach((m) => {
    if (m.kelas) kelasSet.add(m.kelas);
    if (m.jilid) jilidSet.add(m.jilid);
  });

  kelasFilter.innerHTML =
    `<option value="">Filter Kelas</option>` +
    [...kelasSet].map((k) => `<option value="${k}">${k}</option>`).join("");
  jilidFilter.innerHTML =
    `<option value="">Filter Jilid</option>` +
    [...jilidSet].map((j) => `<option value="${j}">${j}</option>`).join("");
}

// ========================================
// 🔹 RENDER TABEL MURID
// ========================================
function renderTable(data) {
  muridTableBody.innerHTML = "";
  data.forEach((m) => {
    // 🔹 filter untuk guru → hanya murid kelas mereka
    if (userRole === "guru" && window.userKelasFilter && m.kelas !== window.userKelasFilter) return;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nama}</td>
      <td>${m.jilid || "-"}</td>
      <td>${m.kelas || "-"}</td>
      <td>${m.alamat || "-"}</td>
      <td>${m.wali_murid || "-"}</td>
      <td>${m.wali_kelas || "-"}</td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <a href="nilai.html?id=${m.id}" class="btn btn-sm btn-success">📘 Nilai</a>
          <a href="rapot.html?id=${m.id}" class="btn btn-sm btn-outline-dark">Rapot</a>
        </div>
      </td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-info" onclick="viewBiodata(${m.id})">🧾 Biodata</button>
          ${userRole === "kepala" ? "" : `<button class="btn btn-sm btn-danger" onclick="hapusMurid(${m.id})">Hapus</button>`}
        </div>
      </td>
    `;
    muridTableBody.appendChild(row);
  });
}


// ========================================
// 🔹 FILTER & PENCARIAN
// ========================================
filterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.toLowerCase();
  const k = kelasFilter.value;
  const j = jilidFilter.value;

  const filtered = muridData.filter(
    (m) =>
      (!q || m.nama.toLowerCase().includes(q)) &&
      (!k || m.kelas === k) &&
      (!j || m.jilid === j)
  );

  renderTable(filtered);
});

searchInput.addEventListener("keyup", () =>
  filterForm.dispatchEvent(new Event("submit"))
);

// ========================================
// 🔹 TAMBAH / UPDATE MURID
// ========================================
muridForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = muridIdInput.value;

  const payload = {
    nama: val("nama"),
    jilid: val("jilid"),
    kelas: val("kelas"),
    alamat: val("alamat"),
    wali_murid: val("wali_murid"),
    wali_kelas: val("wali_kelas"),
    nik: val("nik"),
    no_induk: val("no_induk"),
    tempat_tanggal_lahir: val("tempat_tanggal_lahir"),
    jenis_kelamin: val("jenis_kelamin"),
    nilai_bacaan: val("nilai_bacaan"),
    nilai_hafalan: val("nilai_hafalan"),
    nilai_ahlak: val("nilai_ahlak"),
    nilai_kehadiran: val("nilai_kehadiran"),
    status_dalam_keluarga: val("status_dalam_keluarga"),
    anak_ke: val("anak_ke"),
    nama_ayah: val("nama_ayah"),
    no_tlp_ayah: val("no_tlp_ayah"),
    pekerjaan_ayah: val("pekerjaan_ayah"),
    nama_ibu: val("nama_ibu"),
    no_tlp_ibu: val("no_tlp_ibu"),
    pekerjaan_ibu: val("pekerjaan_ibu"),
    dusun: val("dusun"),
    rt: val("rt"),
    rw: val("rw"),
    desa: val("desa"),
    kecamatan: val("kecamatan"),
    kabupaten_kota: val("kabupaten_kota"),
    provinsi: val("provinsi"),
  };

  try {
    if (id) {
      const { error } = await db.from("murid").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("murid").insert([payload]);
      if (error) throw error;
    }

    bootstrap.Modal.getInstance(document.getElementById("modalForm")).hide();
    muridForm.reset();
    loadMurid();
    alert("✅ Data murid berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan murid:", err.message);
    alert("❌ Gagal simpan murid: " + err.message);
  }
});

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() || null : null;
}

// ========================================
// 🔹 HAPUS MURID
// ========================================
window.hapusMurid = async function (id) {
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  try {
    const { error } = await db.from("murid").delete().eq("id", id);
    if (error) throw error;
    loadMurid();
    alert("✅ Data murid berhasil dihapus!");
  } catch (err) {
    console.error("Gagal hapus murid:", err.message);
    alert("❌ Gagal hapus murid: " + err.message);
  }
};

// ========================================
// 🔹 LIHAT BIODATA
// ========================================
window.viewBiodata = function (id) {
  const m = muridData.find((x) => x.id === id);
  if (!m) return alert("Data murid tidak ditemukan!");

  modalTitle.innerText = "Lengkapi Biodata Murid";
  muridIdInput.value = m.id;

  Object.keys(m).forEach((k) => {
    const el = document.getElementById(k);
    if (el) el.value = m[k] ?? "";
  });

  const modal = new bootstrap.Modal(document.getElementById("modalForm"));
  modal.show();
};

// ========================================
// 🔹 EXPORT EXCEL (LENGKAP + BIODATA)
// ========================================
document.getElementById("exportExcelBtn").addEventListener("click", () => {
  if (!muridData || muridData.length === 0) {
    alert("Data murid masih kosong!");
    return;
  }

  // 🔒 Filter sesuai role (AMAN)
  let dataExport = muridData;

  if (userRole === "guru" && window.userKelasFilter) {
    dataExport = muridData.filter(m => m.kelas === window.userKelasFilter);
  }

  const excelData = dataExport.map((m, i) => ({
    "No": i + 1,
    "ID": m.id,
    "Nama": m.nama,
    "Jilid": m.jilid,
    "Kelas": m.kelas,
    "Alamat": m.alamat,
    "Wali Murid": m.wali_murid,
    "Wali Kelas": m.wali_kelas,

    "NIK": m.nik ? `'${m.nik}` : "",
    "No Induk": m.no_induk,
    "TTL": m.tempat_tanggal_lahir,
    "Jenis Kelamin": m.jenis_kelamin,

    "Nilai Bacaan": m.nilai_bacaan,
    "Nilai Hafalan": m.nilai_hafalan,
    "Nilai Ahlak": m.nilai_ahlak,
    "Nilai Kehadiran": m.nilai_kehadiran,

    "Status Dalam Keluarga": m.status_dalam_keluarga,
    "Anak Ke": m.anak_ke,

    "Nama Ayah": m.nama_ayah,
    "No Tlp Ayah": m.no_tlp_ayah,
    "Pekerjaan Ayah": m.pekerjaan_ayah,

    "Nama Ibu": m.nama_ibu,
    "No Tlp Ibu": m.no_tlp_ibu,
    "Pekerjaan Ibu": m.pekerjaan_ibu,

    "Dusun": m.dusun,
    "RT": m.rt,
    "RW": m.rw,
    "Desa": m.desa,
    "Kecamatan": m.kecamatan,
    "Kabupaten/Kota": m.kabupaten_kota,
    "Provinsi": m.provinsi
  }));
// ================= KOP + DATA =================
const ws = XLSX.utils.json_to_sheet([]);

/// KOP
XLSX.utils.sheet_add_aoa(ws, [
  ["PONDOK PESANTREN MAFATIHUL HUDA"],
  ["DATA SANTRI (LENGKAP)"],
  [`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`],
  []
], { origin: "A1" });

// DATA
XLSX.utils.sheet_add_json(ws, excelData, {
  origin: "A5",
  skipHeader: false
});

// FREEZE BARIS 1–5
ws["!freeze"] = {
  xSplit: 0,
  ySplit: 5
};


  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Murid");

  XLSX.writeFile(
    wb,
    `Data_Santri_Mafatihul_Huda_${new Date().toISOString().slice(0,10)}.xlsx`
  );
});


// ========================================
// 🔹 LOAD SAAT PERTAMA
// ========================================
// 🔹 Setup role sebelum load data
setupRoleAccess();
loadMurid();
