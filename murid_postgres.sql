-- PostgreSQL dump converted from SQLite

DROP TABLE IF EXISTS sqlite_sequence CASCADE;
CREATE TABLE sqlite_sequence (
  "name" TEXT,
  "seq" TEXT
);

INSERT INTO sqlite_sequence VALUES ('murid', 1);

DROP TABLE IF EXISTS murid CASCADE;
CREATE TABLE murid (
  "id" BIGINT PRIMARY KEY,
  "nama" TEXT NOT NULL,
  "jilid" TEXT,
  "kelas" TEXT,
  "alamat" TEXT,
  "wali_murid" TEXT,
  "wali_kelas" TEXT,
  "nik" BIGINT,
  "no_induk" BIGINT,
  "tempat_tanggal_lahir" TEXT,
  "jenis_kelamin" TEXT,
  "nilai_bacaan" BIGINT,
  "nilai_hafalan" BIGINT,
  "nilai_ahlak" BIGINT,
  "status_dalam_keluarga" TEXT,
  "anak_ke" BIGINT,
  "nama_ayah" TEXT,
  "no_tlp_ayah" BIGINT,
  "pekerjaan_ayah" TEXT,
  "nama_ibu" TEXT,
  "no_tlp_ibu" BIGINT,
  "pekerjaan_ibu" TEXT,
  "dusun" TEXT,
  "rt" BIGINT,
  "rw" BIGINT,
  "desa" TEXT,
  "kecamatan" TEXT,
  "kabupaten_kota" TEXT,
  "provinsi" TEXT,
  "nilai_kehadiran" BIGINT,
  "nilai_menulis" BIGINT,
  "diskripsi" TEXT,
  "diskripsi_bacaan" TEXT,
  "diskripsi_hafalan" TEXT,
  "diskripsi_menulis" TEXT,
  "diskripsi_ahlak" TEXT,
  "diskripsi_kehadiran" TEXT,
  "catatan" TEXT
);

INSERT INTO murid VALUES (1, 'HILMAN', '3', '3', 'jombang', 'kkkd', 'diah', NULL, NULL, NULL, NULL, 60, 80, 90, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 80, 70, 'Bacaan: Cukup, tingkatkan lagi. | Menulis: Baik, pertahankan. | Hafalan: Baik, pertahankan. | Ahlak: Sangat baik, teruskan. | Kehadiran: Cukup baik, tapi masih bisa ditingkatkan.', NULL, NULL, NULL, NULL, NULL, NULL);

