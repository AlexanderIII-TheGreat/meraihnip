# TemanASN - Platform Belajar Mandiri & Simulasi Ujian CAT ASN

**TemanASN** (meraihNIP) adalah platform bimbingan belajar dan simulasi ujian berbasis web yang dirancang khusus untuk membantu calon Aparatur Sipil Negara (PNS & PPPK) mempersiapkan diri menghadapi seleksi CAT (Computer Assisted Test). Platform ini menyediakan modul materi, kelas bimbingan online (Bimbel), latihan soal, program kemitraan (Affiliate), serta modul pembuatan kuis mandiri secara cerdas (Generate Soal).

---

## 🛠️ Tech Stack & Teknologi yang Digunakan

### 🖥️ Frontend (`temanasn-fe`)
* **Core:** React (v18) dengan TypeScript & Vite
* **Routing:** React Router DOM (v6)
* **State Management:** Zustand (Persisted Store)
* **Styling:** Tailwind CSS & Vanilla CSS
* **UI Component Library:** TDesign React
* **Animasi:** Framer Motion & Slick Carousel
* **Tools pendukung:** Axios, Chart.js, Recharts, Tabler Icons, CKEditor 5

### ⚙️ Backend (`temanasn-be`)
* **Runtime & Framework:** Node.js dengan Express.js
* **Database ORM:** Prisma (menggunakan client `prisma-client-js`)
* **Caching & Session Storage:** Redis (menggunakan `ioredis` client)
* **Autentikasi:** JWT (JSON Web Token), cookies (`cookie-parser`), bcryptjs
* **Validasi Skema:** Joi
* **Media Upload:** Multer
* **Email Service:** Nodemailer
* **Development tool:** Nodemon, ESLint, Prettier

### 🗄️ Database & Infrastruktur
* **Primary Database:** MySQL
* **In-Memory Cache:** Redis (dijalankan via Docker Compose secara lokal)
* **Process Manager (Production):** PM2 (via `ecosystem.config.js`)

---

## 📂 Struktur Proyek (Directory Layout)

```text
bimblefungsional/
├── temanasn-be/               # Backend Express.js
│   ├── bin/                   # Entry point server (bin/www)
│   ├── prisma/                # Migrasi & Database schema SQLite (opsional/development)
│   ├── src/                   # Source code utama backend
│   │   ├── api/               # API Controllers, Services & Routes per modul
│   │   ├── database/          # Prisma schema.prisma dan konfigurasi database
│   │   ├── middlewares/       # Auth, error, & file upload middlewares
│   │   └── utils/             # Helper functions (token, mailer, multer)
│   └── package.json           # Dependensi backend
│
├── temanasn-fe/               # Frontend React & Vite
│   ├── dist/                  # Hasil compile build siap rilis (diabaikan oleh git)
│   ├── public/                # Aset statis public
│   ├── src/                   # Source code utama frontend
│   │   ├── assets/            # Gambar, logo, & media lokal
│   │   ├── components/        # Komponen UI global (CardProduct, SideMenu, Modal, dll)
│   │   ├── const/             # Routing paths & static menu lists
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── pages/             # Tampilan halaman admin & user
│   │   ├── stores/            # State management dengan Zustand
│   │   └── utils/             # Instance Axios, formatting uang, dll
│   └── package.json           # Dependensi frontend
│
├── docker-compose.yml         # Konfigurasi container lokal (Redis)
├── ecosystem.config.js        # Konfigurasi deploy PM2 untuk frontend & backend
└── package.json               # Konfigurasi workspace root Yarn
```

---

## 🚀 Panduan Setup & Instalasi Lokal

### 1. Prasyarat Sistem
* Node.js (v18 atau lebih baru)
* NPM (v7 atau lebih baru untuk dukungan workspaces)
* Docker (opsional, untuk menjalankan Redis)
* Database MySQL aktif

### 2. Kloning dan Setup Dependensi
Dari root direktori workspace, jalankan perintah instalasi dependensi untuk seluruh sub-folder sekaligus (menggunakan NPM Workspaces):
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)

#### Backend (`temanasn-be/.env`)
Salin berkas `.env.example` menjadi `.env` lalu sesuaikan isinya:
```ini
PORT=8002
DATABASE_URL="mysql://username:password@localhost:3306/temanasn"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="isi-dengan-secret-key-anda"
```

#### Frontend (`temanasn-fe/.env`)
Konfigurasikan API endpoint backend untuk client:
```ini
VITE_API_URL="http://localhost:8002/api"
```

### 4. Setup Database & Migrasi Prisma (Backend)
Jalankan migrasi schema dan buat tabel di MySQL database Anda:
```bash
cd temanasn-be
npx prisma db push
```
*(Opsional)* Jalankan seeder untuk mengisi data awal:
```bash
npm run seed --workspace=temanasn-be
```

### 5. Menjalankan Docker (Redis)
Jalankan container Redis lokal via Docker:
```bash
docker compose up -d
```

### 6. Menjalankan Server secara Development
Jalankan frontend dan backend secara bersamaan dari root direktori:
```bash
npm run dev
```
* Backend akan berjalan di: `http://localhost:8002`
* Frontend akan berjalan di: `http://localhost:5173`

---

## 📋 Korelasi Fitur & Pemetaan Tabel Database

Berikut adalah daftar modul fitur utama aplikasi TemanASN beserta korelasi tabel databasenya:

### 1. Manajemen Pengguna & Hak Akses
Mengelola data profil pengguna, pembagian hak akses (Role), serta autentikasi keamanan.
* **Tabel Utama:** `User`
* **Korelasi & Detail:**
  * Menyimpan email, password, nomor WhatsApp (`noWA`), jenis kelamin, alamat lengkap, dan foto profil.
  * Kolom `role` menentukan hak akses user (`USER` vs `ADMIN`).
  * Menyimpan saldo dan status program kemitraan (`affiliateBalance`, `affiliateCode`, `affiliateStatus`).

---

### 2. Paket Pembelian & Konten Belajar (Materi, Bimbel, & Tryout)
Menyediakan berbagai paket belajar berbayar yang berisi materi teks, bimbingan online (Bimbel), dan paket latihan ujian.
* **Tabel Utama:** `paketPembelian`
* **Tabel Pendukung:** 
  * `paketPembelianCategory` (Kategori paket)
  * `paketPembelianFitur` (Daftar fitur/keunggulan paket)
  * `paketPembelianMateri` (Akses modul materi & link file)
  * `paketPembelianBimbel` (Akses kelas bimbingan belajar, jadwal mentor, rekaman video)
  * `paketPembelianTryout` (Tryout yang disertakan di dalam paket)
* **Korelasi:**
  * `paketPembelian` memiliki hubungan *one-to-many* ke tabel pendukung di atas.
  * Relasi ke `PaketLatihan` menghubungkan paket dengan konten ujian tryout yang sesungguhnya.

---

### 3. Modul Ujian & Uji Coba (Tryout)
Jantung platform belajar yang memfasilitasi ujian CAT (Computer Assisted Test) simulasi seleksi ASN.
* **Tabel Konten Soal:**
  * `BankSoalParentCategory` & `BankSoalCategory` (Kategori rumpun soal seperti TWK, TIU, TKP)
  * `BankSoal` (Menyimpan narasi soal, pembahasan, dan subkategori)
  * `BankSoalJawaban` (Menyimpan pilihan ganda, kebenaran jawaban `isCorrect`, dan skor point per pilihan)
* **Tabel Paket Latihan:**
  * `PaketLatihan` (Nama ujian, waktu/durasi pengerjaan, KKM kelulusan)
  * `PaketLatihanSoal` (Junction table pembuat paket soal dari Bank Soal)
* **Tabel Hasil Ujian User:**
  * `Tryout` (Log pengerjaan oleh user, total poin, status kelulusan KKM, dan waktu selesai)
  * `TryoutSoal` (Menyimpan snapshot soal dan jawaban yang dipilih user saat ujian berlangsung untuk kebutuhan review/pembahasan)

---

### 4. Sistem Transaksi Pembayaran & Voucher Diskon
Menangani alur pembelian paket belajar, penagihan, kode promo diskon, serta integrasi status pembayaran.
* **Tabel Utama:** `Pembelian` (Invoice, metode pembayaran, total bayar, status transaksi `PAID`/`UNPAID`/`EXPIRED`)
* **Tabel Voucher:** 
  * `Voucher` (Kode promo, tipe potongan persen/nominal, dan status aktif)
  * `VoucherProduct` (Menentukan voucher mana saja yang bisa digunakan untuk suatu `paketPembelian`)
* **Korelasi:**
  * `Pembelian` menghubungkan `User` dengan `paketPembelian` yang dibeli.
  * `Pembelian` juga mencatat detail komisi afiliasi jika transaksi direferensikan oleh pengguna lain.

---

### 5. Program Kemitraan (Affiliate System)
Sistem bagi hasil/komisi ketika user membagikan kode referral dan mendatangkan pembeli baru.
* **Tabel Utama:** `AffiliateWithdrawal` (Log pencairan saldo komisi afiliasi)
* **Korelasi:**
  * `User` menyimpan saldo afiliasi (`affiliateBalance`) dan kode referral unik (`affiliateCode`).
  * Ketika transaksi `Pembelian` berstatus `PAID` menggunakan kode afiliasi, saldo pemilik kode bertambah dan tercatat di kolom komisi `Pembelian`.
  * `AffiliateWithdrawal` mencatat status penarikan dana (`pending`, `approved`, `rejected`) ke rekening tujuan.

---

### 6. Fitur Pembuatan Soal Mandiri (Generate Soal)
Fitur interaktif bagi pengguna untuk membuat kuis mini secara instan berdasarkan parameter jumlah soal, tingkat kesulitan, dan kategori yang diinginkan.
* **Tabel Pendukung:** 
  * `ParentGenerateSoalCategory`
  * `GenerateSoalCategory`
  * `SoalGenerateSoal` (Bank soal khusus generator kuis)
  * `GenerateSoalHistory` (Riwayat kuis yang digenerate user)
  * `GenerateSoalHistoryDetail` (Detail log jawaban user pada kuis mandiri)

---

### 7. Layanan Bantuan & Pengaduan (Support Tickets)
Sistem bantuan pelanggan untuk mempermudah komunikasi kendala teknis antara pengguna dengan Admin.
* **Tabel Utama:** `tickets` (Tiket bantuan, judul kendala, deskripsi, gambar lampiran, status `open`/`closed`)
* **Tabel Percakapan:** `ChatTicket` (Log chat balasan real-time antara Admin dan User di dalam tiket tersebut)

---

### 8. Notifikasi & Pengumuman
Menyampaikan pengumuman admin maupun notifikasi transaksi otomatis kepada user.
* **Tabel Utama:** 
  * `DashboardNotification` (Pengumuman publik di dashboard admin/user)
  * `Notification` (Definisi pesan notifikasi sistem)
  * `NotificationUser` (Junction table notifikasi spesifik per user beserta status `isRead`)

---

### 9. Testimoni, FAQ, dan Fitur Tambahan
* **Testimoni & Feedback:** `Testimoni` (tampilan landing page) dan `Feedback` (saran internal user setelah memakai platform).
* **FAQ Chatbot:** `FaqChatbot` (Data tanya-jawab chatbot otomatis di pojok layar).
* **Kalender Event:** `KalenderEvent` (Jadwal event tryout massal atau agenda bimbel).
* **Berita:** `Berita` (Blog/artikel informasi terkini seleksi ASN).
* **Sidebar Settings:** `SidebarMenu` (Konfigurasi dinamis tampilan menu di sidebar Admin & User).

---

## 📈 Alur Relasi Utama (Skema Ringkas)

```mermaid
erDiagram
    User ||--o{ Pembelian : "melakukan"
    User ||--o{ Tryout : "mengerjakan"
    User ||--o{ AffiliateWithdrawal : "mencairkan komisi"
    User ||--o{ tickets : "membuat aduan"
    
    paketPembelian ||--o{ Pembelian : "dibeli dalam"
    paketPembelian ||--o{ paketPembelianTryout : "berisi"
    paketPembelian ||--o{ paketPembelianBimbel : "berisi"
    paketPembelian ||--o{ paketPembelianMateri : "berisi"
    
    PaketLatihan ||--o{ paketPembelianTryout : "dijadikan"
    PaketLatihan ||--o{ Tryout : "dikerjakan sebagai"
    PaketLatihan ||--o{ PaketLatihanSoal : "memiliki"
    BankSoalCategory ||--o{ PaketLatihanSoal : "dikelompokkan ke"
    BankSoalCategory ||--o{ BankSoal : "berisi"
    BankSoal ||--o{ BankSoalJawaban : "memiliki pilihan"
    
    Tryout ||--o{ TryoutSoal : "menyimpan pilihan"
```

---

## 📦 Panduan Build Produksi & Deployment

### Build Aset Frontend
Lakukan kompilasi file aset statis frontend agar siap dideploy:
```bash
npm run build --workspace=temanasn-fe
```
Hasil build akan berada di direktori `temanasn-fe/dist/`.

### Deployment dengan PM2 (Production)
Aplikasi dikonfigurasi untuk dijalankan menggunakan PM2 Process Manager secara production. Berkas konfigurasi berada di `ecosystem.config.js`.

Langkah-langkah deployment:

1. **Instal PM2 secara global** (jika belum):
   ```bash
   npm install -g pm2
   ```

2. **Instal seluruh dependensi project** di direktori root:
   ```bash
   npm install
   ```

3. **Lakukan Build Frontend**:
   ```bash
   npm run build --workspace=temanasn-fe
   ```

4. **Jalankan Aplikasi dengan PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

5. **Manajemen Proses PM2**:
   * Melihat status aplikasi: `pm2 status`
   * Melihat log real-time: `pm2 logs`
   * Menghentikan aplikasi: `pm2 stop ecosystem.config.js`
   * Restart aplikasi: `pm2 restart ecosystem.config.js`
   * Menyimpan daftar proses agar otomatis berjalan kembali saat server restart: `pm2 save`
