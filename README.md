# e-Guru — Sistem Pengurusan Guru

Sistem web untuk guru mengurus pengajaran & kehadiran: profil, subjek & kelas,
kehadiran murid, jadual waktu, pengumuman, laporan (PDF/Excel), modul **ERPH**
(e-RPH / Rancangan Pengajaran Harian), dan panel pentadbir.

## Teknologi
- **React 19 + Vite** (frontend)
- **Firebase** — Firestore (database) + Firebase Auth (log masuk)
- **Tailwind CSS** (styling)
- **html2pdf.js** (jana PDF laporan, client-side)
- **SheetJS (xlsx)** (jana Excel laporan & RPH, client-side)

## Ciri
| Modul | Keterangan |
|-------|-----------|
| Dashboard | Ringkasan kelas, slot hari ini, % kehadiran, carta analisis |
| Profil | Kemaskini profil & tukar kata laluan |
| Subjek & Kelas | Agihan subjek + kelas |
| Kehadiran | Tanda Hadir / Tidak Hadir / Bersebab mengikut murid |
| Jadual Waktu | Susun jadual + cetak PDF |
| Pengumuman | Makluman & aktiviti sekolah |
| **ERPH** | Muat naik PDF ERPH, pilih minggu → jana Excel laporan RPH |
| Laporan | Export senarai guru ke PDF & Excel (filter gred) |
| Pentadbir | (Admin sahaja) senarai semua guru |

## Persediaan
1. `npm install`
2. Salin `.env.example` ke `.env` dan isi konfigurasi Firebase:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   (Jika `.env` tiada, app guna nilai sandaran — sesuai untuk dev.)
3. `npm run dev` (jalan frontend + tiada lagi perlu server lain untuk laporan).

## Struktur Firestore
- `guru/{uid}` → `{ nama, noKp, gred, email, peranan, subjekKelas[], jadualWaktu[] }`
- `kehadiran/{uid}_{kelas}_{tarikh}` → `{ senaraiMurid[], statusKehadiran{} }`
- `pengumuman/{id}` → `{ tajuk, kategori, tarikhAktiviti, kandungan, penulisId }`
- `erph/{id}` → `{ guruId, minggu, tahun, namaFail, pdfBase64 }`

## Nota
- Laporan PDF & Excel dijana **client-side** terus dari data Firebase
  (tiada lagi kebergantungan pada `server.cjs` untuk muat turun).
- Jadikan akaun `peranan: 'admin'` dalam Firestore untuk akses panel Pentadbir.
