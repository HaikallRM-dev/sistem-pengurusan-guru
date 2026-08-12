// File path: src/utils/laporan.js
// Utiliti jana LAPORAN GURU (PDF + Excel) dari data sebenar, client-side.
// - PDF guna html2pdf.js (dari dependency)
// - Excel guna SheetJS (xlsx)

import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

// ============================================================
// PDF — jana dari data sebenar (bukan fail statik)
// ============================================================
export async function generateGuruPDF(senaraiGuru, penapisGred) {
  const tajuk = penapisGred === 'SEMUA'
    ? 'LAPORAN SENARAI KESELURUHAN GURU'
    : `LAPORAN SENARAI GURU (GRED ${penapisGred})`;

  const tarikhHariIni = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Bina HTML laporan
  const rows = senaraiGuru.map((g, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(g.nama)}</td>
      <td>${escapeHtml(g.subjek)}</td>
      <td>${escapeHtml(g.gred)}</td>
    </tr>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 32px; color: #1e293b;">
      <div style="text-align:center; border-bottom:3px solid #1e293b; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="margin:0; font-size:22px; text-transform:uppercase;">${escapeHtml(tajuk)}</h1>
        <p style="margin:6px 0 0; font-size:13px; color:#64748b;">
          Sekolah: SMK Sri Indah &nbsp;|&nbsp; Tarikh: ${tarikhHariIni}
        </p>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#1e293b; color:#fff;">
            <th style="padding:10px; border:1px solid #cbd5e1; text-align:left;">Bil</th>
            <th style="padding:10px; border:1px solid #cbd5e1; text-align:left;">Nama Guru</th>
            <th style="padding:10px; border:1px solid #cbd5e1; text-align:left;">Subjek Utama</th>
            <th style="padding:10px; border:1px solid #cbd5e1; text-align:left;">Gred</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" style="padding:12px; text-align:center; border:1px solid #cbd5e1;">Tiada rekod guru dijumpai</td></tr>'}
        </tbody>
      </table>
      <p style="margin-top:24px; font-size:11px; color:#94a3b8;">
        Dijana secara automatik oleh Sistem Pengurusan Guru (e-Guru).
      </p>
    </div>`;

  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);

  const options = {
    margin: 0.3,
    filename: `Laporan_Guru_${penapisGred}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(options).from(el).save();
  } finally {
    document.body.removeChild(el);
  }
}

// ============================================================
// EXCEL — jana .xlsx proper dari data sebenar (client-side)
// ============================================================
export function generateGuruExcel(senaraiGuru, penapisGred) {
  const tajuk = penapisGred === 'SEMUA'
    ? 'LAPORAN SENARAI KESELURUHAN GURU'
    : `LAPORAN SENARAI GURU (GRED ${penapisGred})`;

  const tarikhHariIni = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const data = [
    ['Tajuk', tajuk],
    ['Tarikh Cetakan', tarikhHariIni],
    ['Sekolah', 'SMK Sri Indah'],
    [],
    ['Bil', 'Nama Guru', 'Subjek Utama', 'Gred'],
  ];

  senaraiGuru.forEach((g, i) => {
    data.push([i + 1, g.nama || '', g.subjek || '', g.gred || '']);
  });

  if (senaraiGuru.length === 0) {
    data.push(['-', 'Tiada rekod guru dijumpai', '-', '-']);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 32 }, { wch: 24 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Senarai Guru');
  XLSX.writeFile(wb, `Laporan_Guru_${penapisGred}.xlsx`);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
