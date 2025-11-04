// 🔹 Ganti dengan URL & ANON KEY Supabase Anda
const SUPABASE_URL = "https://wfscxloykjfiqjhizihh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc2N4bG95a2pmaXFqaGl6aWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTkyNTAsImV4cCI6MjA3NzgzNTI1MH0.vLBX7NXKVsjyqyVSseLGmrObbGSrzXh-eXbENuKCIx8"; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const muridTableBody = document.querySelector("#muridTable tbody");
const searchInput = document.getElementById("searchInput");
const kelasFilter = document.getElementById("kelasFilter");
const jilidFilter = document.getElementById("jilidFilter");
const filterForm = document.getElementById("filterForm");
const muridForm = document.getElementById("muridForm");
const modalTitle = document.getElementById("modalFormLabel");
const muridIdInput = document.getElementById("muridId");

let muridData = [];

// Load semua murid
async function loadMurid() {
  const { data, error } = await supabase.from("murid").select("*");
  if(error){
    console.error("Gagal load data:", error.message);
    alert("Gagal load data murid: " + error.message);
    return;
  }
  muridData = data;
  populateFilters();
  renderTable(muridData);
}

// Populate filter dropdown
function populateFilters() {
  const kelasSet = new Set();
  const jilidSet = new Set();
  muridData.forEach(m => {
    if(m.kelas) kelasSet.add(m.kelas);
    if(m.jilid) jilidSet.add(m.jilid);
  });

  kelasFilter.innerHTML = `<option value="">Filter Kelas</option>` + [...kelasSet].map(k => `<option value="${k}">${k}</option>`).join("");
  jilidFilter.innerHTML = `<option value="">Filter Jilid</option>` + [...jilidSet].map(j => `<option value="${j}">${j}</option>`).join("");
}

// Render table
function renderTable(data) {
  muridTableBody.innerHTML = "";
  data.forEach(m => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nama}</td>
      <td>${m.jilid || '-'}</td>
      <td>${m.kelas || '-'}</td>
      <td>${m.alamat || '-'}</td>
      <td>${m.wali_murid || '-'}</td>
      <td>${m.wali_kelas || '-'}</td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-secondary">Nilai</button>
          <button class="btn btn-sm btn-outline-dark">Riwayat</button>
        </div>
      </td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-info" onclick="editMurid(${m.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="hapusMurid(${m.id})">Hapus</button>
          <button class="btn btn-sm btn-primary" onclick="viewBiodata(${m.id})">Biodata</button>
        </div>
      </td>
    `;
    muridTableBody.appendChild(row);
  });
}

// Search & Filter
filterForm.addEventListener("submit", e => {
  e.preventDefault();
  const q = searchInput.value.toLowerCase();
  const k = kelasFilter.value;
  const j = jilidFilter.value;

  const filtered = muridData.filter(m =>
    (!q || m.nama.toLowerCase().includes(q)) &&
    (!k || m.kelas === k) &&
    (!j || m.jilid === j)
  );

  renderTable(filtered);
});
searchInput.addEventListener("keyup", () => filterForm.dispatchEvent(new Event('submit')));

// Tambah/Edit Murid
muridForm.addEventListener("submit", async e => {
  e.preventDefault();
  const id = muridIdInput.value;

  const payload = {
    nama: document.getElementById("nama").value.trim(),
    jilid: document.getElementById("jilid").value.trim() || null,
    kelas: document.getElementById("kelas").value.trim() || null,
    alamat: document.getElementById("alamat").value.trim() || null,
    wali_murid: document.getElementById("wali_murid").value.trim() || null,
    wali_kelas: document.getElementById("wali_kelas").value.trim() || null
  };

  try {
    if(id){
      const { error } = await supabase.from("murid").update(payload).eq("id", id);
      if(error) throw error;
    } else {
      const { error } = await supabase.from("murid").insert([payload]);
      if(error) throw error;
    }

    bootstrap.Modal.getInstance(document.getElementById('modalForm')).hide();
    muridForm.reset();
    loadMurid();
    alert("Data murid berhasil disimpan!");
  } catch(err) {
    console.error("Gagal simpan murid:", err.message);
    alert("Gagal simpan murid: " + err.message);
  }
});

// Edit
window.editMurid = function(id){
  const m = muridData.find(x => x.id === id);
  if(!m) return;
  modalTitle.innerText = "Edit Murid";
  muridIdInput.value = m.id;
  document.getElementById("nama").value = m.nama;
  document.getElementById("jilid").value = m.jilid;
  document.getElementById("kelas").value = m.kelas;
  document.getElementById("alamat").value = m.alamat;
  document.getElementById("wali_murid").value = m.wali_murid;
  document.getElementById("wali_kelas").value = m.wali_kelas;

  const modal = new bootstrap.Modal(document.getElementById('modalForm'));
  modal.show();
}

// Hapus
window.hapusMurid = async function(id){
  if(!confirm("Yakin ingin menghapus data ini?")) return;
  try {
    const { error } = await supabase.from("murid").delete().eq("id", id);
    if(error) throw error;
    loadMurid();
    alert("Data murid berhasil dihapus!");
  } catch(err) {
    console.error("Gagal hapus murid:", err.message);
    alert("Gagal hapus murid: " + err.message);
  }
}

// View Biodata
window.viewBiodata = function(id){
  const m = muridData.find(x => x.id === id);
  if(!m) return alert("Data murid tidak ditemukan!");
  alert(JSON.stringify(m, null, 2));
}

// Load awal
loadMurid();
