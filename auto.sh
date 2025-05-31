#!/bin/bash

# Membuat struktur direktori dasar
mkdir -p public/css public/js public/assets views

# Menghapus file default Glitch yang tidak digunakan
rm -f views/index.html views/header.html views/footer.html 2>/dev/null
rm -f public/style.css public/script.js index.html 2>/dev/null

# Membuat file-file baru

# public/index.html
cat << 'EOF' > public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aksara Nusantara AI Tutor</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <h1>Selamat Datang di Aksara Nusantara AI Tutor</h1>
  <p>Platform pembelajaran aksara tradisional Indonesia berbasis suara.</p>
  <script src="js/main.js"></script>
</body>
</html>
EOF

# public/css/style.css
cat << 'EOF' > public/css/style.css
/* Style dasar */
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  color: #333;
  text-align: center;
  margin-top: 50px;
}

h1 {
  color: #2c3e50;
}
EOF

# public/js/main.js
cat << 'EOF' > public/js/main.js
// JavaScript dasar
console.log("Aplikasi dimulai...");
EOF

# server.js
cat << 'EOF' > server.js
Import library express
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

// Anda bisa menambahkan rute API di sini jika diperlukan di masa depan
// Misalnya:
// app.get('/api/data', (req, res) => {
//   res.json({ message: 'Data from API' });
// });

// Konfigurasi port server
// Glitch otomatis menyediakan variabel process.env.PORT
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
EOF

# package.json (kosong, bisa diisi nanti)
cat << 'EOF' > package.json
{
  "name": "aksara-nusantara-ai-tutor",
  "version": "1.0.0",
  "description": "AI Tutor untuk pembelajaran aksara Nusantara",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {}
}
EOF

# .env
cat << 'EOF' > .env
# Variabel lingkungan
NODE_ENV=development
EOF

# .gitignore
cat << 'EOF' > .gitignore
# Ignore environment variables
.env

# Ignore node_modules
node_modules/
EOF

# Tambahkan logo placeholder
echo "Logo akan ditambahkan manual di public/assets/logo.png"

# Selesai
echo ""
echo "✅ Struktur proyek berhasil dibuat!"
echo "📁 Struktur Folder:"
echo "├── public/"
echo "│   ├── index.html"
echo "│   ├── css/"
echo "│   │   └── style.css"
echo "│   ├── js/"
echo "│   │   └── main.js"
echo "│   └── assets/"
echo "│       └── logo.png"
echo "├── views/              # Direktori opsional untuk template server-side"
echo "├── server.js"
echo "├── package.json"
echo "├── .env"
echo "└── .gitignore"
