import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import CartaKehadiran from './CartaKehadiran'; // 1. Import komponen carta

export default function DashboardGuru({ user, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [namaGuru, setNamaGuru] = useState('');
  const [statData, setStatData] = useState({
    jumlahKelas: 0,
    jumlahSubjek: 0,
    jumlahMurid: 0,
    jadualHariIni: [],
    ringkasanKehadiran: { total: 0, hadir: 0, tidakHadir: 0, bersebab: 0, peratus: 0 }
  });

  // Hari semasa dalam Bahasa Melayu
  const senaraiHari = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const hariIni = senaraiHari[new Date().getDay()];
  const tarikhHariIni = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // 1. Ambil Data Guru (Subjek, Kelas, Jadual Waktu)
        const docRef = doc(db, "guru", user.uid);
        const docSnap = await getDoc(docRef);

        let kelasUnik = [];
        let subjekUnik = [];
        let jadualHariIniList = [];

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNamaGuru(data.nama || '');

          // Hitung Kelas & Subjek
          const subjekKelas = data.subjekKelas || [];
          kelasUnik = [...new Set(subjekKelas.map(i => i.kelas))];
          subjekUnik = [...new Set(subjekKelas.map(i => i.subjek))];

          // Tapis Jadual Waktu Hari Ini
          const jadualWaktu = data.jadualWaktu || [];
          jadualHariIniList = jadualWaktu
            .filter(item => item.hari === hariIni)
            .sort((a, b) => a.masaMula.localeCompare(b.masaMula));
        }

        // 2. Ambil Data Kehadiran Hari Ini
        const qKehadiran = query(
          collection(db, "kehadiran"),
          where("guruId", "==", user.uid),
          where("tarikh", "==", tarikhHariIni)
        );
        const snapshotKehadiran = await getDocs(qKehadiran);

        let totalMurid = 0;
        let totalHadir = 0;
        let totalTidakHadir = 0;
        let totalBersebab = 0;

        snapshotKehadiran.forEach(docSnap => {
          const data = docSnap.data();
          const statusMap = data.statusKehadiran || {};
          Object.values(statusMap).forEach(status => {
            totalMurid++;
            if (status === 'Hadir') totalHadir++;
            else if (status === 'Tidak Hadir') totalTidakHadir++;
            else if (status === 'Bersebab') totalBersebab++;
          });
        });

        const peratus = totalMurid > 0 ? Math.round((totalHadir / totalMurid) * 100) : 0;

        // 3. Kira TOTAL MURID (setiap kelas, ambil rekod terbaharu)
        const qSemua = query(
          collection(db, "kehadiran"),
          where("guruId", "==", user.uid)
        );
        const snapSemua = await getDocs(qSemua);
        const muridPerKelas = {}; // kelas -> bilangan murid maksimum
        snapSemua.forEach((docSnap) => {
          const data = docSnap.data();
          const kelas = data.kelas;
          const bil = (data.senaraiMurid || []).length;
          if (!kelas) return;
          if (!(kelas in muridPerKelas) || bil > muridPerKelas[kelas]) {
            muridPerKelas[kelas] = bil;
          }
        });
        const totalMuridSemua = Object.values(muridPerKelas).reduce((a, b) => a + b, 0);

        setStatData({
          jumlahKelas: kelasUnik.length,
          jumlahSubjek: subjekUnik.length,
          jumlahMurid: totalMuridSemua,
          jadualHariIni: jadualHariIniList,
          ringkasanKehadiran: {
            total: totalMurid,
            hadir: totalHadir,
            tidakHadir: totalTidakHadir,
            bersebab: totalBersebab,
            peratus
          }
        });

      } catch (err) {
        console.error("Ralat memuatkan dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12 text-slate-500 font-medium">
        Memuatkan papan pemuka...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      
      {/* Banner Selamat Datang */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            {hariIni}, {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {namaGuru ? `Cikgu ${namaGuru}` : 'Guru'}! 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Ringkasan aktiviti pengajaran, kehadiran murid, dan jadual waktu anda untuk hari ini.
          </p>
        </div>
      </div>

      {/* Kad Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Kad 0: Total Murid */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Jumlah Murid</p>
            <h3 className="text-2xl font-black text-brand-700 dark:text-brand-300 mt-1">{statData.jumlahMurid} Murid</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua kelas anda</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center text-xl font-bold">
            👥
          </div>
        </div>

        {/* Kad 1: Kelas & Subjek */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Agihan Kelas</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{statData.jumlahKelas} Kelas</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{statData.jumlahSubjek} Mata Pelajaran</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            📚
          </div>
        </div>

        {/* Kad 2: Slot Kelas Hari Ini */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Jadual Hari Ini ({hariIni})</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{statData.jadualHariIni.length} Kelas</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Masa Mengajar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            ⏰
          </div>
        </div>

        {/* Kad 3: Peratus Kehadiran */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Kehadiran Hari Ini</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{statData.ringkasanKehadiran.peratus}%</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{statData.ringkasanKehadiran.hadir} daripada {statData.ringkasanKehadiran.total} murid</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ✅
          </div>
        </div>

        {/* Kad 4: Murid Tidak Hadir */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tidak Hadir / Bersebab</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {statData.ringkasanKehadiran.tidakHadir + statData.ringkasanKehadiran.bersebab} Murid
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Perlu Tindakan / Semakan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
            ⚠️
          </div>
        </div>

      </div>

      {/* 2. CARTA VISUAL KEHADIRAN (DIMASUKKAN DI SINI) */}
      <CartaKehadiran 
        peratusKeseluruhan={statData.ringkasanKehadiran.peratus} 
      />

      {/* Seksyen Pautan Pantas & Jadual Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Senarai Kelas Hari Ini (2 Lajur) */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white text-base">Jadual Mengajar Hari Ini ({hariIni})</h2>
            <button
              onClick={() => setActiveTab('jadual')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua →
            </button>
          </div>

          {statData.jadualHariIni.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs">Tiada kelas dijadualkan untuk hari {hariIni}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statData.jadualHariIni.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{slot.subjek}</h4>
                      <p className="text-xs text-slate-500">Kelas: {slot.kelas}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    {slot.masaMula} - {slot.masaTamat}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pautan Pantas & Akses Penting (1 Lajur) */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-white text-base">Pautan Pantas</h2>
          
          <div className="space-y-2.5">
            <button
              onClick={() => setActiveTab('kehadiran')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📝</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Tanda Kehadiran</div>
                  <div className="text-[10px] text-slate-400">Kemaskini rekod murid hari ini</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600">→</span>
            </button>

            <button
              onClick={() => setActiveTab('jadual')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Cetak Jadual Waktu</div>
                  <div className="text-[10px] text-slate-400">Muat turun jadual ke format PDF</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-indigo-600">→</span>
            </button>

            <button
              onClick={() => setActiveTab('subjek')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📖</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Tetapan Subjek</div>
                  <div className="text-[10px] text-slate-400">Urus agihan subjek & kelas</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-purple-600">→</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}