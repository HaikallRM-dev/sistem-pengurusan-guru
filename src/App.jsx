import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

import DaftarGuru from './components/DaftarGuru';
import LoginGuru from './components/LoginGuru';
import ProfilGuru from './components/ProfilGuru';
import SubjekKelasGuru from './components/SubjekKelasGuru';
import KehadiranMurid from './components/KehadiranMurid';
import JadualWaktuGuru from './components/JadualWaktuGuru';
import Navbar from './components/Navbar';
import PengumumanAktiviti from './components/PengumumanAktiviti';
import DashboardGuru from './components/DashboardGuru';

export default function App() {
  const [user, setUser] = useState(null);
  const [namaGuru, setNamaGuru] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 🟢 State untuk Penapis & Indikator Muat Turun
  const [penapisGred, setPenapisGred] = useState('SEMUA');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const [authTab, setAuthTab] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const docRef = doc(db, "guru", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setNamaGuru(docSnap.data().nama);
          }
        } catch (err) {
          console.error("Ralat mengambil nama:", err);
        }
      } else {
        setNamaGuru('');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🟢 Fungsi Muat Turun PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "guru"));
      let senaraiGuru = [];
      
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        senaraiGuru.push({
          nama: d.nama || 'Tiada Nama',
          subjek: d.subjek || 'Tiada Subjek',
          gred: d.gred || 'DG41'
        });
      });

      if (penapisGred !== 'SEMUA') {
        senaraiGuru = senaraiGuru.filter((guru) => guru.gred === penapisGred);
      }

      const tajuk = penapisGred === 'SEMUA' 
        ? "LAPORAN SENARAI KESELURUHAN GURU" 
        : `LAPORAN SENARAI GURU (GRED ${penapisGred})`;

      const tarikhHariIni = new Date().toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const payload = {
        tajuk_laporan: tajuk,
        tarikh: tarikhHariIni,
        nama_sekolah: "SMK Sri Indah",
        senarai_guru: senaraiGuru
      };

      const response = await fetch('http://localhost:5000/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal mengambil PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Guru_${penapisGred}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      console.error("Ralat muat turun PDF:", err);
      alert("Gagal memuat turun PDF. Sila pastikan server berjalan.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 🟢 Fungsi Muat Turun Excel
  const handleDownloadExcel = async () => {
    setIsDownloadingExcel(true);
    try {
      const querySnapshot = await getDocs(collection(db, "guru"));
      let senaraiGuru = [];

      querySnapshot.forEach((doc) => {
        const d = doc.data();
        senaraiGuru.push({
          nama: d.nama || 'Tiada Nama',
          subjek: d.subjek || 'Tiada Subjek',
          gred: d.gred || 'DG41'
        });
      });

      if (penapisGred !== 'SEMUA') {
        senaraiGuru = senaraiGuru.filter((guru) => guru.gred === penapisGred);
      }

      const tajuk = penapisGred === 'SEMUA' 
        ? "LAPORAN SENARAI KESELURUHAN GURU" 
        : `LAPORAN SENARAI GURU (GRED ${penapisGred})`;

      const tarikhHariIni = new Date().toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const payload = {
        tajuk_laporan: tajuk,
        tarikh: tarikhHariIni,
        senarai_guru: senaraiGuru
      };

      const response = await fetch('http://localhost:5000/api/download-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal mengambil fail Excel");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Guru_${penapisGred}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      console.error("Ralat muat turun Excel:", err);
      alert("Gagal memuat turun fail Excel.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Sedang memuatkan sistem...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          namaGuru={namaGuru} 
        />

        <main className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto">

          {/* 🟢 Bar Tindakan + Pilihan Penapis Data */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Selamat Datang, {namaGuru || 'Guru'} 👋
              </h2>
              <p className="text-xs text-slate-500">Sistem Pengurusan Pengajaran & Kehadiran</p>
            </div>

            {/* Pilihan Dropdown Penapis, Butang PDF & Butang Excel */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={penapisGred}
                onChange={(e) => setPenapisGred(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="SEMUA">Semua Gred</option>
                <option value="DG41">Gred DG41</option>
                <option value="DG44">Gred DG44</option>
                <option value="DG48">Gred DG48</option>
                <option value="DG52">Gred DG52</option>
              </select>

              {/* Butang PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={`flex items-center gap-1.5 text-white text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all ${
                  isDownloading 
                    ? 'bg-emerald-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                📄 <span>{isDownloading ? 'Menjana PDF...' : 'Muat Turun PDF'}</span>
              </button>

              {/* Butang Excel */}
              <button
                onClick={handleDownloadExcel}
                disabled={isDownloadingExcel}
                className={`flex items-center gap-1.5 text-white text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all ${
                  isDownloadingExcel 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : 'bg-green-700 hover:bg-green-800'
                }`}
              >
                📊 <span>{isDownloadingExcel ? 'Menjana Excel...' : 'Muat Turun Excel'}</span>
              </button>
            </div>
          </div>

          {/* Halaman mengikut Tab */}
          {activeTab === 'dashboard' && <DashboardGuru user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'profil' && <ProfilGuru user={user} />}
          {activeTab === 'subjek' && <SubjekKelasGuru user={user} />}
          {activeTab === 'kehadiran' && <KehadiranMurid user={user} />}
          {activeTab === 'jadual' && <JadualWaktuGuru user={user} />}
          {activeTab === 'pengumuman' && <PengumumanAktiviti user={user} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setAuthTab('login')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            authTab === 'login' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Log Masuk
        </button>
        <button
          onClick={() => setAuthTab('daftar')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            authTab === 'daftar' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Daftar Guru
        </button>
      </div>

      {authTab === 'login' ? <LoginGuru /> : <DaftarGuru />}
    </div>
  );
}