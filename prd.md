# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Sistem Informasi Geografis Berbasis Web (WebGIS)

### Balai Penyuluhan Pertanian (BPP) Kecamatan Telaga

---

# 1. PENDAHULUAN

## 1.1 Tujuan

Dokumen ini bertujuan untuk mendefinisikan kebutuhan sistem dalam pengembangan aplikasi WebGIS yang digunakan untuk mengelola data pertanian secara terintegrasi antara data spasial dan nonspasial di BPP Kecamatan Telaga.

## 1.2 Latar Belakang

Pengelolaan data pertanian saat ini masih menggunakan file Excel dan dokumen terpisah sehingga:

* Tidak terintegrasi antara data
* Sulit dalam pencarian dan pembaruan data
* Tidak tersedia visualisasi peta
* Analisis data tidak optimal

Solusi yang ditawarkan adalah pembangunan sistem WebGIS berbasis web.

---

# 2. TUJUAN PRODUK

## 2.1 Tujuan Utama

* Mengintegrasikan data spasial dan nonspasial
* Menyediakan peta interaktif
* Meningkatkan efisiensi pengelolaan data

## 2.2 Target Pengguna

* Admin BPP
* Penyuluh Pertanian

---

# 3. RUANG LINGKUP SISTEM

## 3.1 Fitur Utama

1. Manajemen Data Petani
2. Manajemen Data Lahan
3. Manajemen Kelompok Tani
4. Manajemen Komoditas
5. Manajemen Bantuan
6. Visualisasi Peta Interaktif

## 3.2 Batasan Sistem

* Fokus pada Kecamatan Telaga
* Data uji pada Desa Luhu
* Tidak mencakup AI, IoT, dan pembayaran

---

# 4. ARSITEKTUR SISTEM

## 4.1 Konsep Arsitektur

Sistem menggunakan arsitektur client-server:

Frontend (React.js) ⇄ Backend API (Laravel) ⇄ Database (MySQL)

## 4.2 Komponen Sistem

### Frontend (React.js)

* Menampilkan UI
* Menampilkan peta (Leaflet.js)
* Mengirim request ke backend

### Backend (Laravel)

* Mengelola API
* Validasi data
* CRUD data

### Database (MySQL)

* Menyimpan data terstruktur
* Menyimpan GeoJSON

---

## 4.3 Bagan Arsitektur Sistem

[USER]
↓
[FRONTEND - React.js + Leaflet]
↓ API REQUEST
[BACKEND - Laravel]
↓
[DATABASE - MySQL]

---

# 5. DESAIN UI

## 5.1 Tema Warna

* Primary: #124170
* Secondary: #67C090
* Background: Putih / Hitam

## 5.2 Prinsip UI

* Minimalis
* Fokus data
* Responsif

---

# 6. STRUKTUR DATABASE

## 6.1 Tabel

### tabel_petani

* id_petani (PK)
* nik (UNIQUE)
* nama
* jenis_kelamin
* no_hp
* alamat

### tabel_kelompok_tani

* id_kelompok (PK)
* nama_kelompok
* desa

### tabel_keanggotaan

* id_petani (FK)
* id_kelompok (FK)

### tabel_lahan

* id_lahan (PK)
* id_petani (FK)
* luas
* koordinat (JSON/GeoJSON)

### tabel_komoditas

* id_komoditas (PK)
* nama_komoditas

### tabel_lahan_komoditas

* id_lahan (FK)
* id_komoditas (FK)

### tabel_bantuan

* id_bantuan (PK)
* nama_bantuan

### tabel_penerima_bantuan

* id_petani (FK)
* id_bantuan (FK)
* tanggal

---

## 6.2 Relasi Database

Petani → Lahan (1:N)
Petani → Kelompok (M:N)
Lahan → Komoditas (M:N)
Petani → Bantuan (M:N)

---

# 7. FITUR SISTEM

## 7.1 Manajemen Petani

* tambahPetani()
* ubahPetani()
* hapusPetani()
* ambilDataPetani()

## 7.2 Manajemen Lahan

* tambahLahan()
* gambarPolygon()
* simpanKoordinat()

## 7.3 Peta Interaktif

* tampilkanPeta()
* tampilkanPolygon()
* tampilkanDetail()

---

# 8. API DESIGN

GET /api/petani
POST /api/petani
PUT /api/petani/{id}
DELETE /api/petani/{id}

GET /api/lahan
POST /api/lahan

---

# 9. USE CASE

Aktor:

* Admin
* Penyuluh

Admin:

* Kelola data
* Kelola peta

Penyuluh:

* Melihat data
* Melihat peta

---

# 10. ALUR SISTEM

Login
↓
Dashboard
↓
Peta
↓
Klik Lahan
↓
Detail Data

---

# 11. SEQUENCE DIAGRAM

User → Frontend → Backend → Database
← Data ditampilkan kembali

---

# 12. PROTOTYPE HALAMAN

## 12.1 Login

* Input email & password

## 12.2 Dashboard

* Statistik data

## 12.3 Halaman Peta

* Peta Leaflet
* Polygon lahan

## 12.4 Data Petani

* Tabel + CRUD

## 12.5 Data Lahan

* Gambar polygon

---

# 13. NON-FUNCTIONAL REQUIREMENTS

## Performance

* Load < 3 detik

## Security

* Login & validasi input

## Usability

* Mudah digunakan

## Scalability

* Bisa tambah desa lain

---

# 14. METODE PENGEMBANGAN

Metode Prototype:

1. Communication
2. Quick Plan
3. Design
4. Construction
5. Feedback

---

# 15. OUTPUT SISTEM

* Data tabel
* Peta interaktif
* Informasi lahan

---

# 16. KESIMPULAN

Sistem WebGIS ini dirancang untuk meningkatkan efisiensi pengelolaan data pertanian melalui integrasi data spasial dan nonspasial dalam satu platform berbasis web.

---
