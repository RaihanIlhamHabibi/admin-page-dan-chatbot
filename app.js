require('dotenv').config();

const express = require('express');
const path = require('path');
const { initDatabase } = require('./config/database');

const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Pretest Node.js - Admin Pembelian & Chatbot AI'
  });
});

app.use('/admin', adminRoutes);
app.use('/chatbot', chatbotRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan',
    message: 'Halaman yang kamu cari tidak ditemukan.'
  });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Gagal inisialisasi database:', error);
    process.exit(1);
  });
