import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export default function PengumumanAktiviti({ user }) {
  const [senarai, setSenarai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [tajuk, setTajuk] = useState('');
  const [kategori, setKategori] = useState('Pengumuman'); // Pengumuman / Peringatan / Aktiviti
  const [tarikhAktiviti, setTarikhAktiviti] = useState('');
  const [kandungan, setKandungan] = useState('');

  // 1. Ambil data pengumuman daripada Firestore
  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'pengumuman'), 
        orderBy('tarikhCipta', 'desc')
      );
      const snapshot = await getDocs(q);
      const dataList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSenarai(dataList);
    } catch (err) {
      console.error("Ralat mengambil pengumuman:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  // 2. Tambah Pengumuman Baharu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tajuk || !kandungan) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'pengumuman'), {
        tajuk,
        kategori,
        tarikhAktiviti: tarikhAktiviti || null,
        kandungan,
        penulisId: user?.uid || '',
        tarikhCipta: serverTimestamp()
      });

      // Reset Form
      setTajuk('');
      setKategori('Pengumuman');
      setTarikhAktiviti('');
      setKandungan('');

      // Muat semula data
      fetchPengumuman();
    } catch (err) {
      console.error("Ralat menyimpan pengumuman:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Padam Pengumuman
  const handleDelete = async (id) => {
    if (!window.confirm("Adakah anda pasti ingin memadam pengumuman ini?")) return;

    try {
      await deleteDoc(doc(db, 'pengumuman', id));
      setSenarai(senarai.filter(item => item.id !== id));
    } catch (err) {
      console.error("Ralat memadam pengumuman:", err);
    }
  };

  const getKategoriBadge = (kat) => {
    switch (kat) {
      case 'Aktiviti':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Peringatan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      
      {/* Tajuk Halaman */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          📢 Pengumuman & Peringatan Aktiviti
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Urus makluman sekolah, aktiviti ko-kurikulum, dan peringatan mesyuarat guru.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Borang Tambah Pengumuman (1 Lajur) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h2 className="font-bold text-slate-800 text-sm border-b pb-2">
            ➕ Cipta Pengumuman Baharu
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tajuk</label>
              <input
                type="text"
                required
                placeholder="Contoh: Mesyuarat PIBG / Hari Sukan"
                value={tajuk}
                onChange={(e) => setTajuk(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Pengumuman">📢 Pengumuman Umum</option>
                <option value="Aktiviti">🏆 Aktiviti Sekolah</option>
                <option value="Peringatan">⏰ Peringatan Mesyuarat / Tugas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tarikh Aktiviti (Opsional)
              </label>
              <input
                type="date"
                value={tarikhAktiviti}
                onChange={(e) => setTarikhAktiviti(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kandungan / Perincian</label>
              <textarea
                rows="4"
                required
                placeholder="Tulis butiran pengumuman di sini..."
                value={kandungan}
                onChange={(e) => setKandungan(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Menyiarkan...' : 'Siarkan Pengumuman'}
            </button>
          </form>
        </div>

        {/* Senarai Pengumuman (2 Lajur) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 text-sm">
            📌 Senarai Pengumuman Terkini
          </h2>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border">
              Memuatkan senarai pengumuman...
            </div>
          ) : senarai.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-300">
              <p className="text-xs text-slate-400">Tiada pengumuman atau aktiviti direkodkan lagi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {senarai.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getKategoriBadge(item.kategori)}`}>
                          {item.kategori}
                        </span>
                        {item.tarikhAktiviti && (
                          <span className="text-[11px] font-medium text-slate-500">
                            📅 Tarikh: {item.tarikhAktiviti}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">{item.tajuk}</h3>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition text-sm p-1"
                      title="Padam Pengumuman"
                    >
                      🗑️
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.kandungan}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}