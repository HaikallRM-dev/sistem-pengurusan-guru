// File path: src/components/ErphPage.jsx
// Modul ERPH (e-RPH = Rancangan Pengajaran Harian).
// - Guru muat naik PDF ERPH (rujukan), pilih minggu & tahun.
// - Sistem jana LAPORAN EXCEL (template RPH mingguan) terus.
// - Rekod ERPH disimpan ke Firestore (rujukan semula).

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, where, orderBy, serverTimestamp,
} from '../firebase';
import * as XLSX from 'xlsx';
import { useToast } from './Toast';

const SENARAI_HARI = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];

export default function ErphPage({ user }) {
  const toast = useToast();

  const [minggu, setMinggu] = useState(1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [pdfFail, setPdfFail] = useState(null);     // { nama, base64 }
  const [pdfPratonton, setPdfPratonton] = useState(null); // object URL
  const [senaraiErph, setSenaraiErph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memuatNaik, setMemuatNaik] = useState(false);

  // Ambil rekod ERPH milik guru
  useEffect(() => {
    const fetchErph = async () => {
      try {
        const q = query(
          collection(db, 'erph'),
          where('guruId', '==', user.uid),
          orderBy('diciptaPada', 'desc')
        );
        const snap = await getDocs(q);
        setSenaraiErph(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Ralat muat ERPH:', err);
        toast.error('Gagal memuat senarai ERPH.');
      } finally {
        setLoading(false);
      }
    };
    fetchErph();
  }, [user.uid]);

  // Upload PDF -> base64
  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Sila pilih fail PDF sahaja.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfFail({ nama: file.name, base64: reader.result });
      setPdfPratonton(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  // Simpan rekod ERPH (PDF rujukan)
  const handleSimpan = async () => {
    if (!pdfFail) {
      toast.error('Sila muat naik PDF ERPH dahulu.');
      return;
    }
    setMemuatNaik(true);
    try {
      await addDoc(collection(db, 'erph'), {
        guruId: user.uid,
        minggu: Number(minggu),
        tahun: Number(tahun),
        namaFail: pdfFail.nama,
        pdfBase64: pdfFail.base64,
        diciptaPada: serverTimestamp(),
      });
      toast.success(`ERPH Minggu ${minggu} (${tahun}) disimpan.`);
      setPdfFail(null);
      setPdfPratonton(null);
      // refresh
      const q = query(
        collection(db, 'erph'),
        where('guruId', '==', user.uid),
        orderBy('diciptaPada', 'desc')
      );
      const snap = await getDocs(q);
      setSenaraiErph(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan ERPH: ' + err.message);
    } finally {
      setMemuatNaik(false);
    }
  };

  // Jana Excel laporan RPH mingguan
  const handleJanaExcel = () => {
    const rows = [['Hari', 'Tarikh', 'Mata Pelajaran', 'Tajuk', 'Objektif Pembelajaran', 'Aktiviti', 'Pemerhatian & Penilaian']];
    SENARAI_HARI.forEach((hari) => {
      rows.push([hari, '', '', '', '', '', '']);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 24 },
      { wch: 36 }, { wch: 36 }, { wch: 32 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Minggu ${minggu}`);
    XLSX.writeFile(wb, `Laporan_RPH_Minggu${minggu}_${tahun}.xlsx`);
    toast.success('Laporan Excel (RPH) berjaya dijana.');
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">📘 Modul ERPH (e-RPH)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Muat naik PDF ERPH, pilih minggu, dan jana laporan Excel rancangan pengajaran harian.
        </p>
      </div>

      {/* Borang muat naik + pilih minggu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Minggu Ke-</label>
            <select
              value={minggu}
              onChange={(e) => setMinggu(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>Minggu {w}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun</label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">PDF ERPH</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdf}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {pdfPratonton && (
          <div className="border rounded-xl p-3 bg-slate-50">
            <p className="text-xs font-medium text-slate-600 mb-2">Pratonton: {pdfFail?.nama}</p>
            <iframe title="Pratonton ERPH" src={pdfPratonton} className="w-full h-72 rounded-lg" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSimpan}
            disabled={memuatNaik || !pdfFail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-slate-400"
          >
            {memuatNaik ? 'Menyimpan...' : 'Simpan ERPH'}
          </button>
          <button
            onClick={handleJanaExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            📊 Jana Laporan Excel (RPH)
          </button>
        </div>
      </div>

      {/* Senarai rekod ERPH */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <h2 className="font-bold text-slate-800 text-sm mb-3">Rekod ERPH Tersimpan</h2>
        {loading ? (
          <p className="text-slate-400 text-sm">Memuatkan...</p>
        ) : senaraiErph.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6 border border-dashed border-slate-300 rounded-lg">
            Tiada rekod ERPH lagi.
          </p>
        ) : (
          <div className="space-y-2">
            {senaraiErph.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Minggu {r.minggu} · {r.tahun}</p>
                  <p className="text-xs text-slate-500">{r.namaFail}</p>
                </div>
                <div className="flex gap-2">
                  {r.pdfBase64 && (
                    <a
                      href={r.pdfBase64}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Lihat PDF
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, 'erph', r.id));
                      setSenaraiErph(senaraiErph.filter((x) => x.id !== r.id));
                      toast.success('Rekod dipadam.');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Padam
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
