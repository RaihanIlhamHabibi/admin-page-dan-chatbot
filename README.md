# Pretest Node.js - Admin Pembelian dan Chatbot AI

Project ini dibuat untuk memenuhi tugas pretest dengan ketentuan membuat aplikasi **Admin Page Pembelian** dan **Chatbot AI**.

Aplikasi ini dibangun menggunakan **Node.js**, **Express.js**, **EJS**, dan **SQLite menggunakan sql.js**. Untuk fitur chatbot, aplikasi ini terintegrasi dengan **Gemini API**.

## Daftar Isi

* [Fitur Utama](#fitur-utama)
* [Teknologi yang Digunakan](#teknologi-yang-digunakan)
* [Struktur Project](#struktur-project)
* [Persyaratan](#persyaratan)
* [Instalasi dan Menjalankan Project](#instalasi-dan-menjalankan-project)
* [Konfigurasi Environment](#konfigurasi-environment)
* [Rute Halaman](#rute-halaman)
* [Database](#database)
* [Alur Aplikasi](#alur-aplikasi)
* [Catatan Penting](#catatan-penting)

## Fitur Utama

Project ini memiliki dua fitur utama sesuai ketentuan pretest:

1. **Admin Page Pembelian**
2. **Chatbot AI menggunakan Gemini API**

### 1. Admin Produk

Fitur ini digunakan untuk mengelola data produk dan stok produk.

Fitur yang tersedia:

* Menampilkan daftar produk
* Menampilkan stok produk
* Menambahkan produk baru
* Mengedit data produk
* Menghapus produk

### 2. Pembelian

Fitur ini digunakan untuk mengelola transaksi pembelian produk.

Fitur yang tersedia:

* Input data pembelian baru
* Generate invoice otomatis
* Pengurangan stok otomatis saat pembelian berhasil
* Cancel pembelian oleh admin
* Pengembalian stok otomatis saat pembelian dibatalkan

### 3. Chatbot AI

Fitur chatbot digunakan untuk mengirim pertanyaan dan menerima jawaban dari AI.

Chatbot pada project ini menggunakan **Gemini API**. API key disimpan pada file `.env` dan tidak disertakan ke GitHub untuk menjaga keamanan.

Fitur yang tersedia:

* Halaman chatbot sederhana
* Input pertanyaan dari user
* Mengirim pertanyaan ke Gemini API
* Menampilkan jawaban dari Gemini AI
* Konfigurasi API key melalui file `.env`

## Teknologi yang Digunakan

* Node.js
* Express.js
* EJS
* SQLite menggunakan sql.js
* Gemini API
* dotenv
* HTML
* CSS
* JavaScript

## Struktur Project

```txt
admin-page-dan-chatbot/
├── app.js
├── package.json
├── package-lock.json
├── README.md
├── .env.example
├── .gitignore
│
├── config/
│   └── database.js
│
├── database/
│   └── schema.sql
│
├── routes/
│   ├── adminRoutes.js
│   └── chatbotRoutes.js
│
├── services/
│   └── aiService.js
│
├── views/
│   ├── index.ejs
│   ├── error.ejs
│   │
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   │
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── products.ejs
│   │   ├── create-product.ejs
│   │   ├── edit-product.ejs
│   │   ├── purchases.ejs
│   │   └── create-purchase.ejs
│   │
│   └── chatbot/
│       └── index.ejs
│
└── public/
    └── css/
        └── style.css
```

## Persyaratan

Sebelum menjalankan aplikasi, pastikan perangkat sudah memiliki:

* Node.js versi 18 atau lebih baru
* npm
* Gemini API Key

Gemini API Key diperlukan untuk menjalankan fitur Chatbot AI.

## Instalasi dan Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/RaihanIlhamHabibi/admin-page-dan-chatbot.git
```

### 2. Masuk ke Folder Project

```bash
cd admin-page-dan-chatbot
```

### 3. Install Dependency

```bash
npm install
```

### 4. Buat File `.env`

Copy file `.env.example` menjadi `.env`.

Untuk Windows:

```bash
copy .env.example .env
```

Untuk Mac/Linux:

```bash
cp .env.example .env
```

### 5. Isi Konfigurasi `.env`

Buka file `.env`, lalu isi API key Gemini yang valid.

Contoh konfigurasi:

```env
PORT=3000
AI_PROVIDER=gemini
GEMINI_API_KEY=masukkan_api_key_gemini_anda
GEMINI_MODEL=gemini-1.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
AI_SYSTEM_PROMPT=Jawab dengan bahasa Indonesia yang singkat, jelas, sopan, dan membantu.
```

### 6. Jalankan Aplikasi

```bash
npm start
```

Untuk mode development dengan restart otomatis:

```bash
npm run dev
```

### 7. Buka Aplikasi di Browser

```txt
http://localhost:3000
```

## Konfigurasi Environment

Project ini menggunakan file `.env` untuk menyimpan konfigurasi penting seperti port aplikasi dan API key Gemini.

File `.env` tidak di-upload ke GitHub karena berisi data rahasia. Repository hanya menyediakan file `.env.example` sebagai contoh konfigurasi.

Contoh isi `.env.example`:

```env
PORT=3000
AI_PROVIDER=gemini
GEMINI_API_KEY=isi_api_key_gemini_anda
GEMINI_MODEL=gemini-1.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
AI_SYSTEM_PROMPT=Jawab dengan bahasa Indonesia yang singkat, jelas, sopan, dan membantu.
```

## Rute Halaman

| Halaman         | URL                        |
| --------------- | -------------------------- |
| Home            | `/`                        |
| Admin Dashboard | `/admin`                   |
| Data Produk     | `/admin/products`          |
| Tambah Produk   | `/admin/products/create`   |
| Edit Produk     | `/admin/products/edit/:id` |
| Data Pembelian  | `/admin/purchases`         |
| Input Pembelian | `/admin/purchases/create`  |
| Chatbot AI      | `/chatbot`                 |

## Database

Database menggunakan SQLite melalui library `sql.js`.

Struktur database terdiri dari:

1. Tabel produk
2. Tabel stok produk
3. Tabel pembelian

Database sudah dilengkapi data awal berupa **10 produk** sesuai ketentuan pretest.

File database terdapat pada folder:

```txt
database/schema.sql
```

## Alur Aplikasi

### Alur Admin Produk

1. Admin membuka halaman data produk.
2. Sistem menampilkan daftar produk beserta stok.
3. Admin dapat menambahkan produk baru.
4. Admin dapat mengedit data produk.
5. Admin dapat menghapus produk.

### Alur Pembelian

1. Admin membuka halaman input pembelian.
2. Admin memilih produk dan mengisi jumlah pembelian.
3. Sistem membuat invoice secara otomatis.
4. Sistem mengurangi stok produk sesuai jumlah pembelian.
5. Admin dapat membatalkan pembelian.
6. Jika pembelian dibatalkan, status pembelian berubah menjadi cancel.
7. Stok produk dikembalikan secara otomatis.

### Alur Chatbot AI

1. User membuka halaman chatbot.
2. User mengirim pertanyaan melalui form chatbot.
3. Sistem mengirim pertanyaan ke Gemini API.
4. Gemini API memproses pertanyaan.
5. Jawaban dari Gemini AI ditampilkan pada halaman chatbot.

## Struktur Kode

| File / Folder             | Keterangan                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `app.js`                  | File utama untuk menjalankan server, middleware, routing, dan inisialisasi database |
| `config/database.js`      | Konfigurasi database SQLite dan helper query                                        |
| `database/schema.sql`     | Struktur database dan data awal produk                                              |
| `routes/adminRoutes.js`   | Routing untuk fitur produk, stok, pembelian, dan cancel pembelian                   |
| `routes/chatbotRoutes.js` | Routing untuk halaman chatbot dan proses pengiriman pertanyaan                      |
| `services/aiService.js`   | Service untuk integrasi chatbot dengan Gemini API                                   |
| `views/`                  | Template EJS untuk tampilan halaman aplikasi                                        |
| `public/css/style.css`    | File CSS untuk styling tampilan aplikasi                                            |

## Catatan Penting

* Pastikan sudah menjalankan `npm install` sebelum menjalankan aplikasi.
* Pastikan file `.env` sudah dibuat dari `.env.example`.
* Pastikan `GEMINI_API_KEY` sudah diisi dengan API key yang valid.
* File `.env` tidak boleh di-upload ke GitHub.
* File `.env.example` boleh di-upload karena hanya berisi contoh konfigurasi.
* Jika aplikasi gagal berjalan, periksa kembali dependency, konfigurasi `.env`, dan API key Gemini.

## Lisensi

Project ini dibuat untuk keperluan pretest.
