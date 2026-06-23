# Pretest Node.js - Admin Pembelian dan Chatbot AI

Aplikasi ini adalah contoh pretest berbasis **Node.js**, **Express**, **EJS**, dan **SQLite** (menggunakan `sql.js`).

Aplikasi ini memiliki dua fitur utama:

1. **Admin Produk & Pembelian**
2. **Chatbot AI**

---

## Fitur Utama

### Admin Produk

- Lihat daftar produk beserta stok.
- Tambah produk baru.
- Edit produk yang sudah ada.
- Hapus produk.

### Pembelian

- Input pembelian baru dengan invoice otomatis.
- Pengurangan stok otomatis saat pembelian berhasil.
- Cancel pembelian oleh admin.
- Pengembalian stok otomatis saat pembelian dibatalkan.

### Chatbot AI

- Antarmuka chatbot sederhana.
- Dukungan provider: `demo`, `ollama`, `openai`, `deepseek`, `gemini`.
- Konfigurasi lewat `.env`.
- Default `demo` agar aplikasi bisa dijalankan tanpa API key.

---

## Teknologi

- Node.js
- Express
- EJS
- sql.js (SQLite)
- dotenv
- HTML / CSS / JavaScript

---

## Struktur Project

```text
pretest-nodejs-raihan/
├── app.js
├── package.json
├── README.md
├── .env.example
├── .gitignore
├── config/
│   └── database.js
├── database/
│   └── schema.sql
├── routes/
│   ├── adminRoutes.js
│   └── chatbotRoutes.js
├── services/
│   └── aiService.js
├── views/
│   ├── index.ejs
│   ├── error.ejs
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── admin/
│   │   ├── create-purchase.ejs
│   │   ├── create-product.ejs
│   │   ├── dashboard.ejs
│   │   ├── edit-product.ejs
│   │   ├── products.ejs
│   │   └── purchases.ejs
│   └── chatbot/
│       └── index.ejs
└── public/
    └── css/
        └── style.css
```

---

## Persyaratan

- Node.js v18 atau lebih baru
- npm

---

## Instalasi

1. Clone repository.
2. Masuk ke folder proyek.
3. Install dependensi.

```bash
npm install
```

4. Copy `.env.example` menjadi `.env`.

```bash
copy .env.example .env
```

5. Jalankan aplikasi.

```bash
npm start
```

6. Buka browser.

```text
http://localhost:3000
```

Untuk mode development dengan restart otomatis:

```bash
npm run dev
```

---

## Rute Utama

| Halaman | URL |
|---|---|
| Home | `/` |
| Admin Dashboard | `/admin` |
| Data Produk | `/admin/products` |
| Tambah Produk | `/admin/products/create` |
| Edit Produk | `/admin/products/edit/:id` |
| Data Pembelian | `/admin/purchases` |
| Input Pembelian | `/admin/purchases/create` |
| Chatbot AI | `/chatbot` |

---

## Konfigurasi `.env`

Salin `.env.example` menjadi `.env` dan isi value sesuai provider yang digunakan.

> Jangan upload `.env` ke GitHub.

### Contoh dasar

```env
PORT=3000
AI_PROVIDER=demo
AI_SYSTEM_PROMPT=Jawab dengan bahasa Indonesia yang singkat, jelas, sopan, dan membantu.
```

### OpenAI / ChatGPT

```env
AI_PROVIDER=openai
OPENAI_API_KEY=isi_api_key_openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

### DeepSeek

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=isi_api_key_deepseek
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Gemini

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=isi_api_key_gemini
GEMINI_MODEL=gemini-1.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### Ollama Lokal

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

## Catatan

- Provider `demo` tidak memerlukan API key.
- Provider lain (`openai`, `deepseek`, `gemini`, `ollama`) memerlukan konfigurasi di `.env`.
- CRUD produk sudah tersedia: tambah, edit, hapus.
- Pembelian mendukung cancel dengan rollback stok otomatis.

---

## Struktur Kode

- `app.js`: server, middleware, routing, dan inisialisasi database.
- `config/database.js`: setup SQLite dan query helper.
- `routes/adminRoutes.js`: produk dan pembelian admin.
- `routes/chatbotRoutes.js`: route chatbot.
- `services/aiService.js`: integrasi provider AI.
- `views/`: template EJS untuk halaman admin dan chatbot.

---

## Lisensi

Project ini dibuat untuk keperluan pretest dan latihan. Sesuaikan lisensi bila perlu.
# admin-page-dan-chatbot
