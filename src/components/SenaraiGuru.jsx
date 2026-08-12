// File path: src/components/SenaraiGuru.jsx
// Modul PENTADBIR: papar SENARAI SEMUA GURU (collection 'guru').
// Hanya dipaparkan bila peranan pengguna = 'admin'.

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from './Toast';

export default function SenaraiGuru({ user }) {
  const toast = useToast();
  const [senarai, setSenarai] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'guru'));
        const list = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setSenarai(list);
      } catch (err) {
        console.error('Ralat mengambil senarai guru:', err);
        toast.error('Gagal memuatkan senarai guru.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="text-center p-4">Memuatkan senarai guru...</div>;

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          👥 Senarai Keseluruhan Guru
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modul pentadbir — semua guru berdaftar dalam sistem ({senarai.length} rekod).
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
        {senarai.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            Tiada guru berdaftar lagi.
          </p>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-xs">
              <tr>
                <th className="p-3 rounded-l-lg">Bil</th>
                <th className="p-3">Nama</th>
                <th className="p-3">No. KP</th>
                <th className="p-3">Gred</th>
                <th className="p-3">Subjek</th>
                <th className="p-3">Email</th>
                <th className="p-3 rounded-r-lg">Peranan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {senarai.map((g, i) => (
                <tr key={g.uid} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-medium text-slate-500">{i + 1}</td>
                  <td className="p-3 font-semibold text-slate-800">{g.nama || '-'}</td>
                  <td className="p-3">{g.noKp || '-'}</td>
                  <td className="p-3">{g.gred || '-'}</td>
                  <td className="p-3">{(g.subjekKelas || []).map((s) => s.subjek).join(', ') || '-'}</td>
                  <td className="p-3">{g.email || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.peranan === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {g.peranan || 'guru'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
