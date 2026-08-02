const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 🟢 ENDPOINT 1: PDF (Sokong GET & POST)
// ==========================================

// 1. Jika frontend buat permintaan GET
app.get('/api/download-pdf', (req, res) => {
  const pdfPath = path.join(__dirname, 'Laporan_Guru_2026.pdf');
  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, 'Laporan_Guru_2026.pdf');
  } else {
    res.status(404).send("Fail Laporan_Guru_2026.pdf tidak dijumpai.");
  }
});

// 2. Jika frontend buat permintaan POST (Terus hantar fail sedia ada)
app.post('/api/download-pdf', (req, res) => {
  console.log("⚡ Menerima permintaan muat turun PDF (kaedah straight forward)...");
  
  const pdfPath = path.join(__dirname, 'Laporan_Guru_2026.pdf');

  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, 'Laporan_Guru_2026.pdf');
  } else {
    res.status(404).send("Fail Laporan_Guru_2026.pdf tidak dijumpai dalam folder server.");
  }
});

// ==========================================
// 🟢 ENDPOINT 2: EXCEL / CSV (Sokong GET & POST)
// ==========================================

const handleExcel = (req, res) => {
  try {
    console.log("⚡ Menerima permintaan eksport Excel...");
    const { tajuk_laporan = "Laporan Guru", tarikh = "2026", senarai_guru = [] } = req.body || {};

    let csvContent = '\ufeff';
    csvContent += `Tajuk,${tajuk_laporan}\n`;
    csvContent += `Tarikh Cetakan,${tarikh}\n\n`;
    csvContent += `Bil,Nama Guru,Subjek Utama,Gred\n`;

    if (senarai_guru && senarai_guru.length > 0) {
      senarai_guru.forEach((guru, index) => {
        const nama = `"${(guru.nama || '').replace(/"/g, '""')}"`;
        const subjek = `"${(guru.subjek || '').replace(/"/g, '""')}"`;
        const gred = `"${(guru.gred || '').replace(/"/g, '""')}"`;
        csvContent += `${index + 1},${nama},${subjek},${gred}\n`;
      });
    } else {
      csvContent += `-,Tiada rekod guru dijumpai,-,-\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Guru.csv');
    return res.status(200).send(csvContent);

  } catch (err) {
    console.error("❌ Ralat eksport Excel:", err);
    res.status(500).send("Gagal mengeksport fail Excel");
  }
};

app.get('/api/download-excel', handleExcel);
app.post('/api/download-excel', handleExcel);

// ==========================================
// 🚀 MENJALANKAN SERVER
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Express berjalan di http://localhost:${PORT}`);
});