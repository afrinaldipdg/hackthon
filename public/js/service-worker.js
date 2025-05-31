// public/js/service-worker.js

const CACHE_NAME = 'aksara-nusantara-cache-v1';
// Daftar semua aset yang ingin Anda cache agar aplikasi bisa offline
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/service-worker.js', // Penting: cache service worker itu sendiri
  '/data/materi.json',
  '/assets/logo.png',
  // Tambahkan path untuk semua gambar materi Anda di sini
  '/assets/huruf_a.png',
  '/assets/huruf_b.png',
  '/assets/angka_1.png',
  '/assets/angka_2.png'
  // Jika Anda nanti menggunakan model TensorFlow.js, tambahkan path ke model.json dan weights.bin
  // '/models/my_tf_model/model.json',
  // '/models/my_tf_model/weights.bin'
];

// Event 'install': Dipicu saat service worker pertama kali diinstal
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Menginstal Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache dibuka, menambahkan URL ke cache...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Memaksa service worker baru untuk aktif segera
      .catch((error) => console.error('[Service Worker] Gagal menginstal cache:', error))
  );
});

// Event 'activate': Dipicu saat service worker aktif
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Mengaktifkan Service Worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Memaksa kontrol halaman segera
  );
});

// Event 'fetch': Dipicu setiap kali ada permintaan jaringan
self.addEventListener('fetch', (event) => {
  // Hanya tangani permintaan HTTP/HTTPS, abaikan permintaan chrome-extension:// dll.
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika ada di cache, langsung kembalikan dari cache
        if (response) {
          console.log(`[Service Worker] Melayani dari cache: ${event.request.url}`);
          return response;
        }

        // Jika tidak ada di cache, ambil dari jaringan
        console.log(`[Service Worker] Mengambil dari jaringan: ${event.request.url}`);
        return fetch(event.request).then(
          (response) => {
            // Jika request tidak valid, atau bukan response OK, jangan cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Kloning response karena response stream hanya bisa dibaca sekali
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});
