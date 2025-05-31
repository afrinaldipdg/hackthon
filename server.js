// server.js

const express = require('express');
const app = express();
const path = require('path');

// Konfigurasi untuk menyajikan file statis dari folder 'public'
// Ini penting agar browser bisa mengakses index.html, style.css, dan main.js
app.use(express.static('public'));

// Rute untuk halaman utama (root URL)
// Ketika ada request ke '/' (akar), kirim file index.html dari folder public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Konfigurasi port server
// Glitch otomatis menyediakan variabel process.env.PORT
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});