// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const statusMessage = document.getElementById('statusMessage');
    const responseArea = document.getElementById('responseArea');

    let materiPelajaran = []; // Variabel untuk menyimpan materi dari JSON
    let currentMateriIndex = 0; // Indeks materi yang sedang diajarkan

    // --- Inisialisasi Web Speech API (Input & Output Suara) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    let recognition; // Objek untuk pengenalan suara
    let synth = SpeechSynthesis; // Objek untuk sintesis suara

    // Cek dukungan Web Speech API di browser
    if (SpeechRecognition && SpeechSynthesis) {
        recognition = new SpeechRecognition();
        recognition.lang = 'id-ID'; // Mengatur bahasa pengenalan suara ke Bahasa Indonesia
        recognition.interimResults = false; // Hanya memberikan hasil akhir
        recognition.maxAlternatives = 1; // Hanya satu alternatif hasil

        statusMessage.textContent = 'Memuat materi...';

        // --- Fungsi untuk Mengucapkan Teks ---
        const speakText = (text, callback) => {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.lang = 'id-ID'; // Mengatur bahasa ucapan ke Bahasa Indonesia
            utterThis.onend = () => {
                if (callback) callback(); // Panggil callback setelah selesai bicara
            };
            utterThis.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                statusMessage.textContent = 'Terjadi kesalahan suara. Coba lagi.';
                startButton.disabled = false;
            };
            synth.speak(utterThis);
        };

        // --- Fungsi untuk Memulai Pelajaran ---
        const startLesson = () => {
            if (materiPelajaran.length === 0) {
                speakText("Maaf, materi pelajaran belum tersedia atau gagal dimuat.", () => {
                    startButton.disabled = false;
                    statusMessage.textContent = 'Aplikasi siap.';
                });
                return;
            }

            startButton.disabled = true;
            const materi = materiPelajaran[currentMateriIndex];
            // Kosongkan dulu area respons
            responseArea.innerHTML = '';

            // Buat elemen gambar
            const imgElement = document.createElement('img');
            imgElement.src = materi.image_path;
            imgElement.alt = materi.text_content;
            imgElement.style.cssText = "max-width: 100px; height: auto; display: block; margin: 0 auto 10px;";
            responseArea.appendChild(imgElement);

            // Buat elemen paragraf untuk teks instruksi
            const textPromptElement = document.createElement('p');
            textPromptElement.textContent = `Coba ucapkan: "${materi.text_content}"`;
            responseArea.appendChild(textPromptElement);

            speakText(materi.quiz_prompt, () => {
                statusMessage.textContent = 'Mendengarkan... Silakan ucapkan.';
                recognition.start(); // Setelah AI berbicara, mulai mendengarkan siswa
            });
        };

        // --- Handler untuk Hasil Pengenalan Suara Siswa ---
        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript;
            responseArea.innerHTML += `<p>Anda berkata: "${command}"</p>`;
            console.log('Siswa berkata:', command);

            const currentMateri = materiPelajaran[currentMateriIndex];
            const expected = currentMateri.expected_responses.map(res => res.toLowerCase());
            const studentResponse = command.toLowerCase();

            let feedback;
            if (expected.some(res => studentResponse.includes(res))) {
                feedback = "Bagus sekali! Itu benar.";
                speakText(feedback, () => {
                    currentMateriIndex++; // Lanjut ke materi berikutnya
                    if (currentMateriIndex < materiPelajaran.length) {
                        setTimeout(startLesson, 2000); // Lanjutkan setelah 2 detik
                    } else {
                        speakText("Selamat! Anda telah menyelesaikan semua materi pelajaran dasar.", () => {
                            currentMateriIndex = 0; // Reset untuk mulai lagi
                            startButton.disabled = false;
                            statusMessage.textContent = 'Aplikasi siap. Tekan "Mulai Belajar" lagi.';
                        });
                    }
                });
            } else {
                feedback = `Maaf, itu belum tepat. Coba ucapkan "${currentMateri.pronunciation_text}" lagi.`;
                speakText(feedback, () => {
                    startButton.disabled = false; // Aktifkan tombol untuk mencoba lagi
                    statusMessage.textContent = 'Silakan coba lagi.';
                });
            }
            responseArea.innerHTML += `<p>AI: "${feedback}"</p>`;
        };

        recognition.onspeechend = () => {
            recognition.stop();
            // Status dan tombol akan diupdate setelah AI merespon dan selesai berbicara
        };

        recognition.onerror = (event) => {
            startButton.disabled = false;
            statusMessage.textContent = `Error suara: ${event.error}. Tekan "Mulai Belajar" untuk coba lagi.`;
            console.error('Speech recognition error', event.error);
            speakText("Maaf, ada masalah dengan pengenalan suara. Silakan coba lagi.", () => {
                // Kembali ke status siap setelah pesan error diucapkan
            });
        };

        // --- Fungsi untuk Memuat Materi dari JSON ---
        const loadMateri = async () => {
            try {
                // Coba ambil dari Local Storage dulu (untuk offline)
                const cachedMateri = localStorage.getItem('materiPelajaran');
                if (cachedMateri) {
                    materiPelajaran = JSON.parse(cachedMateri);
                    statusMessage.textContent = 'Materi dimuat dari cache. Aplikasi siap.';
                    startButton.disabled = false;
                    console.log('Materi dimuat dari Local Storage.');
                    return;
                }

                // Jika tidak ada di Local Storage, ambil dari jaringan
                statusMessage.textContent = 'Mengunduh materi pelajaran...';
                const response = await fetch('data/materi.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                materiPelajaran = data;
                localStorage.setItem('materiPelajaran', JSON.stringify(materiPelajaran)); // Simpan ke Local Storage
                statusMessage.textContent = 'Materi berhasil diunduh dan disimpan. Aplikasi siap.';
                startButton.disabled = false;
                console.log('Materi berhasil diunduh dan disimpan ke Local Storage.');
            } catch (error) {
                console.error('Gagal memuat materi:', error);
                statusMessage.textContent = 'Gagal memuat materi pelajaran. Periksa koneksi internet Anda atau coba lagi nanti.';
                startButton.disabled = true;
            }
        };

        // --- Event Listener Tombol Start ---
        startButton.addEventListener('click', startLesson);

        // --- Panggil saat DOMContentLoaded untuk memuat materi ---
        loadMateri();

    } else {
        startButton.disabled = true;
        statusMessage.textContent = 'Maaf, browser Anda tidak mendukung Web Speech API (Speech Recognition atau Synthesis). Silakan coba di Chrome atau Firefox terbaru.';
    }
});