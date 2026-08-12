import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from './Toast';

export default function KehadiranMurid({ user }) {
  const toast = useToast();
  const [senaraiKelas, setSenaraiKelas] = useState([]);
  const [pilihKelas, setPilihKelas] = useState('');
  const [tarikh, setTarikh] = useState(new Date().toISOString().split('T')[0]);
  const [senaraiMurid, setSenaraiMurid] = useState([]);
  const [namaMuridBaharu, setNamaMuridBaharu] = useState('');
  const [statusKehadiran, setStatusKehadiran] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Ambil senarai kelas guru dari Firestore (dari subjekKelas)
  useEffect(() => {
    const fetchKelas = async () => {
      if (user) {
        try {
          const docRef = doc(db, "guru", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const senarai = data.subjekKelas || [];
            // Ambil nama kelas secara unik (elak duplikasi)
            const kelasUnik = [...new Set(senarai.map(item => item.kelas))];
            setSenaraiKelas(kelasUnik);
            if (kelasUnik.length > 0) {
              setPilihKelas(kelasUnik[0]);
            }
          }
        } catch (error) {
          console.error("Ralat mengambil senarai kelas:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchKelas();
  }, [user]);

  // 2. Ambil rekod kehadiran bagi kelas & tarikh yang dipilih
  useEffect(() => {
    const fetchKehadiran = async () => {
      if (user && pilihKelas && tarikh) {
        try {
          // Format ID dokumen: UID_NAMA-KELAS_TARIKH
          const idDokumen = `${user.uid}_${pilihKelas.replace(/\s+/g, '_')}_${tarikh}`;
          const docRef = doc(db, "kehadiran", idDokumen);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Backward-compatible: data lama simpan nama sebagai string
            const rawList = data.senaraiMurid || [];
            const converted = rawList.map((m) =>
              typeof m === 'string'
                ? { id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, nama: m }
                : m
            );
            setSenaraiMurid(converted);
            setStatusKehadiran(data.statusKehadiran || {});
          } else {
            // Jika belum ada rekod pada tarikh ini, kekalkan senarai murid
            setStatusKehadiran({});
          }
        } catch (error) {
          console.error("Ralat mengambil rekod kehadiran:", error);
        }
      }
    };
    fetchKehadiran();
  }, [user, pilihKelas, tarikh]);

  // 3. Fungsi tambah murid baharu
  const handleTambahMurid = (e) => {
    e.preventDefault();
    if (!namaMuridBaharu.trim()) return;

    if (senaraiMurid.some((m) => m.nama === namaMuridBaharu.trim())) {
      toast("Nama murid ini sudah wujud dalam senarai.");
      return;
    }

    const muridBaharu = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nama: namaMuridBaharu.trim(),
    };
    setSenaraiMurid([...senaraiMurid, muridBaharu]);
    setStatusKehadiran(prev => ({
      ...prev,
      [muridBaharu.id]: 'Hadir' // Default status
    }));
    setNamaMuridBaharu('');
  };

  // 4. Tukar status kehadiran murid (mengikut ID)
  const handleTukarStatus = (id, status) => {
    setStatusKehadiran(prev => ({
      ...prev,
      [id]: status
    }));
  };

  // 5. Simpan rekod ke Firestore
  const handleSimpanKehadiran = async () => {
    if (!pilihKelas) {
      toast("Sila pilih kelas terlebih dahulu.");
      return;
    }

    if (senaraiMurid.length === 0) {
      toast("Sila tambah sekurang-kurangnya seorang murid.");
      return;
    }

    setSaving(true);
    try {
      const idDokumen = `${user.uid}_${pilihKelas.replace(/\s+/g, '_')}_${tarikh}`;
      const docRef = doc(db, "kehadiran", idDokumen);

      await setDoc(docRef, {
        guruId: user.uid,
        kelas: pilihKelas,
        tarikh: tarikh,
        senaraiMurid: senaraiMurid,
        statusKehadiran: statusKehadiran,
        dikemaskiniPada: new Date().toISOString()
      });

      toast("Rekod kehadiran berjaya disimpan!");
    } catch (error) {
      console.error("Ralat menyimpan kehadiran:", error);
      toast("Gagal menyimpan kehadiran: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-4">Memuatkan modul kehadiran...</div>;

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Pengurusan Kehadiran Murid</h2>

        {/* Pilihan Kelas dan Tarikh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Kelas</label>
            {senaraiKelas.length > 0 ? (
              <select
                value={pilihKelas}
                onChange={(e) => setPilihKelas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tarikh Kehadiran</label>
            <input
              type="date"
              value={tarikh}
              onChange={(e) => setTarikh(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Borang Tambah Murid */}
        <form onSubmit={handleTambahMurid} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Masukkan Nama Murid Baharu"
            value={namaMuridBaharu}
            onChange={(e) => setNamaMuridBaharu(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Tambah Murid
          </button>
        </form>

        {/* Senarai Semak Kehadiran */}
        {senaraiMurid.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
            Belum ada murid dalam kelas ini. Sila tambah nama murid di atas.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b text-xs font-semibold text-slate-500 uppercase">
              <span>Nama Murid ({senaraiMurid.length})</span>
              <span>Status Kehadiran</span>
            </div>

            {senaraiMurid.map((m, idx) => {
              const statusSemasa = statusKehadiran[m.id] || 'Hadir';
              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-800 text-sm">{idx + 1}. {m.nama}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleTukarStatus(m.id, 'Hadir')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                        statusSemasa === 'Hadir'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTukarStatus(m.id, 'Tidak Hadir')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                        statusSemasa === 'Tidak Hadir'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      Tidak Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTukarStatus(m.id, 'Bersebab')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                        statusSemasa === 'Bersebab'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      Bersebab
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <button
                onClick={handleSimpanKehadiran}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:bg-slate-400"
              >
                {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}