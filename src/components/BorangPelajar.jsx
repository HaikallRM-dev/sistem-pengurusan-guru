import { useState } from 'react';

export default function BorangPelajar() {
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Pendaftaran Pelajar</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelajar</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="cth. Ahmad Albab"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="cth. 5 Cemerlang"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}