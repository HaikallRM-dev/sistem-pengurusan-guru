import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from './Toast';

export default function SubjekKelasGuru({ user }) {
  const toast = useToast();
  const [senaraiSubjekKelas, setSenaraiSubjekKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk borang input
  const [subjek, setSubjek] = useState('');
  const [kelas, setKelas] = useState('');

  // Senarai cadangan subjek
  const senaraiPilihanSubjek = [
    'Bahasa Melayu',
    'Bahasa Inggeris',
    'Matematik',
    'Sains',
    'Pendidikan Islam',
    'Sejarah',
    'Geografi',
    'Reka Bentuk & Teknologi (RBT)',
    'Pendidikan Seni Visual (PSV)',
    'Pendidikan Jasmani & Kesihatan (PJK)',
    'Pendidikan Moral',
    'Bahasa Arab',
    'Lain-lain'
  ];

  // 1. Ambil data agihan subjek & kelas dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "guru", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSenaraiSubjekKelas(data.subjekKelas || []);
          }
        } catch (error) {
          console.error("Ralat mengambil agihan subjek & kelas:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // 2. Tambah Subjek & Kelas Baharu
  const handleTambah = async (e) => {
    e.preventDefault();
    if (!subjek || !kelas) {
      toast("Sila pilih subjek dan masukkan nama kelas.");
      return;
    }

    setSaving(true);
    const itemBaharu = {
      id: Date.now().toString(),
      subjek,
      kelas
    };

    const senaraiKemaskini = [...senaraiSubjekKelas, itemBaharu];

    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, {
        subjekKelas: senaraiKemaskini
      });

      setSenaraiSubjekKelas(senaraiKemaskini);
      setSubjek('');
      setKelas('');
      toast("Agihan subjek dan kelas berjaya ditambah!");
    } catch (error) {
      console.error("Ralat menyimpan:", error);
      toast("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Padam Subjek & Kelas
  const handlePadam = async (id) => {
    if (!confirm("Adakah anda pasti ingin memadam agihan ini?")) return;

    const senaraiKemaskini = senaraiSubjekKelas.filter(item => item.id !== id);

    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, {
        subjekKelas: senaraiKemaskini
      });

      setSenaraiSubjekKelas(senaraiKemaskini);
      toast("Agihan berjaya dipadam!");
    } catch (error) {
      console.error("Ralat memadam:", error);
      toast("Gagal memadam: " + error.message);
    }
  };

  if (loading) return <div className="text-center p-4">Memuatkan data subjek & kelas...</div>;

  return (
    <div className="w-full max-w-2xl space-y-6">
      
      {/* Borang Tambah Agihan Subjek & Kelas */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Agihan Subjek & Kelas</h2>
        
        <form onSubmit={handleTambah} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          
          {/* Pilihan Subjek */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mata Pelajaran</label>
            <select
              value={subjek}
              onChange={(e) => setSubjek(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">-- Pilih Subjek --</option>
              {senaraiPilihanSubjek.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Nama Kelas */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Kelas</label>
            <input
              type="text"
              placeholder="cth. 4 Ibnu Sina / 1 Cemerlang"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Butang Tambah */}
          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition disabled:bg-slate-400"
            >
              {saving ? '...' : '+ Tambah'}
            </button>
          </div>
        </form>
      </div>

      {/* Senarai Agihan Subjek & Kelas */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Senarai Agihan Subjek & Kelas ({senaraiSubjekKelas.length})
        </h2>

        {senaraiSubjekKelas.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
            Belum ada subjek dan kelas didaftarkan. Sila tambah di atas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-xs">
                <tr>
                  <th className="p-3 rounded-l-lg">Bil</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3 text-center rounded-r-lg">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {senaraiSubjekKelas.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-medium text-slate-500">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.subjek}</td>
                    <td className="p-3">{item.kelas}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handlePadam(item.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-semibold transition"
                      >
                        Padam
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}