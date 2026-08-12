import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from '../firebase';
import { useToast } from './Toast';

export default function JadualWaktuGuru({ user }) {
  const toast = useToast();
  const [senaraiKelas, setSenaraiKelas] = useState([]);
  const [pilihKelas, setPilihKelas] = useState('');
  const [senaraiJadual, setSenaraiJadual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Maklumat Sekolah & Logo
  const [namaSekolah, setNamaSekolah] = useState('SK SERI MAWAR');
  const [logoSekolah, setLogoSekolah] = useState(null);

  // State borang jadual
  const [hari, setHari] = useState('Isnin');
  const [masaMula, setMasaMula] = useState('08:00');
  const [masaTamat, setMasaTamat] = useState('09:00');
  const [subjek, setSubjek] = useState('');

  const senaraiHari = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];

  // 1. Ambil senarai kelas & jadual waktu dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "guru", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            const subjekKelas = data.subjekKelas || [];
            const kelasUnik = [...new Set(subjekKelas.map(item => item.kelas))];
            setSenaraiKelas(kelasUnik);
            if (kelasUnik.length > 0) {
              setPilihKelas(kelasUnik[0]);
            }

            setSenaraiJadual(data.jadualWaktu || []);
            if (data.namaSekolah) setNamaSekolah(data.namaSekolah);
            if (data.logoSekolah) setLogoSekolah(data.logoSekolah);
          }
        } catch (error) {
          console.error("Ralat mengambil jadual waktu:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // 2. Fungsi Muat Naik Logo Sekolah (Tukar ke Base64)
  const handleMuatNaikLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Logo = reader.result;
        setLogoSekolah(base64Logo);
        
        // Simpan ke Firestore secara automatik
        try {
          const docRef = doc(db, "guru", user.uid);
          await updateDoc(docRef, { logoSekolah: base64Logo });
        } catch (err) {
          console.error("Ralat menyimpan logo:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Simpan Nama Sekolah ke Firestore
  const handleSimpanNamaSekolah = async () => {
    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, { namaSekolah });
      toast("Nama sekolah berjaya disimpan!");
    } catch (err) {
      console.error("Ralat menyimpan nama sekolah:", err);
    }
  };

  // 4. Tambah Slot Jadual Waktu
  const handleTambahJadual = async (e) => {
    e.preventDefault();
    if (!pilihKelas || !subjek || !masaMula || !masaTamat) {
      toast("Sila lengkapkan maklumat jadual.");
      return;
    }

    setSaving(true);
    const itemBaharu = {
      id: Date.now().toString(),
      kelas: pilihKelas,
      hari,
      masaMula,
      masaTamat,
      subjek
    };

    const senaraiKemaskini = [...senaraiJadual, itemBaharu];

    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, {
        jadualWaktu: senaraiKemaskini
      });

      setSenaraiJadual(senaraiKemaskini);
      setSubjek('');
      toast("Slot jadual berjaya ditambah!");
    } catch (error) {
      console.error("Ralat menyimpan jadual:", error);
      toast("Gagal menyimpan jadual: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 5. Padam Slot Jadual
  const handlePadam = async (id) => {
    if (!confirm("Adakah anda pasti ingin memadam slot jadual ini?")) return;

    const senaraiKemaskini = senaraiJadual.filter(item => item.id !== id);

    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, {
        jadualWaktu: senaraiKemaskini
      });

      setSenaraiJadual(senaraiKemaskini);
      toast("Slot jadual berjaya dipadam!");
    } catch (error) {
      console.error("Ralat memadam jadual:", error);
      toast("Gagal memadam: " + error.message);
    }
  };

  // 6. Cetak PDF
  const handleCetakPDF = () => {
    const el = document.getElementById('kawasan-jadual-pdf');
    if (!el) return;

    const tetapanPDF = {
      margin:       0.3,
      filename:     `Jadual_Waktu_${pilihKelas.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    const janaPDF = () => {
      window.html2pdf().set(tetapanPDF).from(el).save();
    };

    if (window.html2pdf) {
      janaPDF();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = janaPDF;
      document.body.appendChild(script);
    }
  };

  const jadualKelasDiPilih = senaraiJadual.filter(item => item.kelas === pilihKelas);

  if (loading) return <div className="text-center p-4">Memuatkan jadual waktu...</div>;

  return (
    <div className="w-full max-w-4xl space-y-6">
      
      {/* Tetapan Header Sekolah */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tetapan Header PDF & Sekolah</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Sekolah</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="cth. SK SERI MAWAR"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={handleSimpanNamaSekolah}
                className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Muat Naik Logo Sekolah</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMuatNaikLogo}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Borang Tambah Slot Jadual */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Kelas</label>
          {senaraiKelas.length > 0 ? (
            <select
              value={pilihKelas}
              onChange={(e) => setPilihKelas(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
            >
              {senaraiKelas.map((k, idx) => (
                <option key={idx} value={k}>{k}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Masukkan Nama Kelas (cth: 4 Ibnu Sina)"
              value={pilihKelas}
              onChange={(e) => setPilihKelas(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          )}
        </div>

        <form onSubmit={handleTambahJadual} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Hari</label>
            <select
              value={hari}
              onChange={(e) => setHari(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {senaraiHari.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Masa Mula</label>
            <input
              type="time"
              value={masaMula}
              onChange={(e) => setMasaMula(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Masa Tamat</label>
            <input
              type="time"
              value={masaTamat}
              onChange={(e) => setMasaTamat(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mata Pelajaran</label>
            <input
              type="text"
              placeholder="cth. Matematik"
              value={subjek}
              onChange={(e) => setSubjek(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition disabled:bg-slate-400"
            >
              {saving ? '...' : '+ Tambah Slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Paparan Jadual Waktu Bersama Header Rasmi PDF */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Jadual Waktu Kelas: <span className="text-blue-600">{pilihKelas || 'Belum Dipilih'}</span>
          </h3>
          
          <button
            onClick={handleCetakPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <span>📄</span> Muat Turun PDF
          </button>
        </div>

        {/* --- KAWASAN DOKUMEN CETAKAN PDF --- */}
        <div id="kawasan-jadual-pdf" className="p-6 bg-white rounded-xl">
          
          {/* Header Rasmi Sekolah dalam PDF */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              {logoSekolah ? (
                <img src={logoSekolah} alt="Logo Sekolah" className="max-h-16 max-w-16 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                  LOGO
                </div>
              )}
            </div>

            <div className="text-center flex-1 px-4">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                {namaSekolah || 'NAMA SEKOLAH'}
              </h1>
              <h2 className="text-sm font-bold text-slate-700 uppercase mt-0.5">
                JADUAL WAKTU KELAS: {pilihKelas || '-'}
              </h2>
            </div>

            {/* Ruang pengimbang supaya susunan header berada di tengah */}
            <div className="w-16"></div>
          </div>

          {/* Kad Jadual Waktu Mengikut Hari */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {senaraiHari.map((h, index) => {
              const slotHari = jadualKelasDiPilih
                .filter(item => item.hari === h)
                .sort((a, b) => a.masaMula.localeCompare(b.masaMula));

              return (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col">
                  <div className="bg-slate-800 text-white text-center py-1 rounded-lg text-xs font-bold uppercase mb-2">
                    {h}
                  </div>

                  {slotHari.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-4 my-auto">Tiada Kelas</p>
                  ) : (
                    <div className="space-y-2 flex-1">
                      {slotHari.map((item) => (
                        <div key={item.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-800">{item.subjek}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.masaMula} - {item.masaTamat}
                          </div>
                          <button
                            onClick={() => handlePadam(item.id)}
                            data-html2canvas-ignore="true"
                            className="mt-2 text-[9px] bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded w-full transition"
                          >
                            Padam
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}