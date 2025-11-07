// ✅ app.js
console.log("✅ app.js berhasil dimuat");

// Inisialisasi Supabase
const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const muridTableBody = document.querySelector("#muridTable tbody");
const searchInput = document.getElementById("searchInput");
const kelasFilter = document.getElementById("kelasFilter");
const jilidFilter = document.getElementById("jilidFilter");
const filterForm = document.getElementById("filterForm");
const muridForm = document.getElementById("muridForm");
const modalTitle = document.getElementById("modalFormLabel");
const muridIdInput = document.getElementById("muridId");

let muridData = [];

// 🔹 Ambil semua data murid
async function loadMurid() {
  const { data, error } = await db
    .from("murid")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    alert("Gagal memuat data murid: " + error.message);
    console.error(error);
    return;
  }

  muridData = data;
  populateFilters();
  renderTable(muridData);
}

// 🔹 Isi filter dropdown
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

// 🔹 Tampilkan tabel murid
function renderTable(data) {
  muridTableBody.innerHTML = "";
  data.forEach((m) => {
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
        <button class="btn btn-sm btn-secondary">Nilai</button>
      </td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-info" onclick="editMurid(${m.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="hapusMurid(${m.id})">Hapus</button>
        </div>
      </td>
    `;
    muridTableBody.appendChild(row);
  });
}

// 🔹 Filter & cari
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

// 🔹 Simpan murid (tambah / edit)
muridForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = muridIdInput.value;

  const payload = {
    nama: document.getElementById("nama").value.trim(),
    jilid: document.getElementById("jilid").value.trim() || null,
    kelas: document.getElementById("kelas").value.trim() || null,
    alamat: document.getElementById("alamat").value.trim() || null,
    wali_murid: document.getElementById("wali_murid").value.trim() || null,
    wali_kelas: document.getElementById("wali_kelas").value.trim() || null,
  };

  try {
    if (id) {
      await db.from("murid").update(payload).eq("id", id);
    } else {
      await db.from("murid").insert([payload]);
    }

    bootstrap.Modal.getInstance(document.getElementById("modalForm")).hide();
    muridForm.reset();
    loadMurid();
  } catch (err) {
    alert("Gagal menyimpan: " + err.message);
  }
});

// 🔹 Edit murid
window.editMurid = (id) => {
  const m = muridData.find((x) => x.id === id);
  if (!m) return;

  modalTitle.textContent = "Edit Murid";
  muridIdInput.value = m.id;
  document.getElementById("nama").value = m.nama;
  document.getElementById("jilid").value = m.jilid;
  document.getElementById("kelas").value = m.kelas;
  document.getElementById("alamat").value = m.alamat;
  document.getElementById("wali_murid").value = m.wali_murid;
  document.getElementById("wali_kelas").value = m.wali_kelas;

  const modal = new bootstrap.Modal(document.getElementById("modalForm"));
  modal.show();
};

// 🔹 Hapus murid
window.hapusMurid = async (id) => {
  if (!confirm("Yakin ingin menghapus?")) return;
  await db.from("murid").delete().eq("id", id);
  loadMurid();
};

// 🔹 Jalankan pertama kali
loadMurid();
