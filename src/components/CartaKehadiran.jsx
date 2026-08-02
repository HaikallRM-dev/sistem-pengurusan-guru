import React from 'react';

/**
 * Komponen CartaKehadiran
 * @param {number} peratusKeseluruhan - Peratusan keseluruhan (contoh: 88)
 * @param {object} ringkasan - Objek pecahan (pilihan: { hadir, lewat, tidakHadir })
 */
const CartaKehadiran = ({ peratusKeseluruhan = 0, ringkasan }) => {
  // Data laluan (default) jika data pecahan belum dihantar
  const dataRingkasan = ringkasan || {
    hadir: 88,
    lewat: 8,
    tidakHadir: 4,
  };

  // Memastikan nilai peratusan dalam julat 0 - 100
  const peratus = Math.min(100, Math.max(0, Number(peratusKeseluruhan) || 88));

  // Pengiraan radius & ukur lilit bulatan SVG
  const radius = 55;
  const ukurLilit = 2 * Math.PI * radius;
  const strokeDashoffset = ukurLilit - (peratus / 100) * ukurLilit;

  // Status & skema warna mengikut kadar peratusan
  const getDinamikStatus = (val) => {
    if (val >= 90) {
      return { label: 'Cemerlang', color: 'text-emerald-600', bg: 'bg-emerald-500', stroke: '#10b981' };
    }
    if (val >= 75) {
      return { label: 'Baik', color: 'text-blue-600', bg: 'bg-blue-500', stroke: '#3b82f6' };
    }
    if (val >= 50) {
      return { label: 'Sederhana', color: 'text-amber-600', bg: 'bg-amber-500', stroke: '#f59e0b' };
    }
    return { label: 'Perlu Perhatian', color: 'text-rose-600', bg: 'bg-rose-500', stroke: '#ef4444' };
  };

  const status = getDinamikStatus(peratus);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header Carta */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Analisis Kehadiran Murid</h3>
          <p className="text-xs text-slate-500">Kadar kehadiran purata terkini</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${status.bg}`}>
          {status.label}
        </span>
      </div>

      {/* Kandungan Utama Carta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* 1. Visual Bulatan Peratusan (SVG Circular Gauge) */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              {/* Bulatan Latar Belakang */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Bulatan Kemajuan */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={status.stroke}
                strokeWidth="10"
                strokeDasharray={ukurLilit}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Teks Peratus di Tengah */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold ${status.color}`}>
                {peratus}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Kehadiran
              </span>
            </div>
          </div>
        </div>

        {/* 2. Bar Pecahan Status Kehadiran */}
        <div className="space-y-4">
          {/* Hadir */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Hadir
              </span>
              <span className="font-bold text-slate-700">{dataRingkasan.hadir}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${dataRingkasan.hadir}%` }}
              ></div>
            </div>
          </div>

          {/* Hadir Lewat */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Hadir Lewat
              </span>
              <span className="font-bold text-slate-700">{dataRingkasan.lewat}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${dataRingkasan.lewat}%` }}
              ></div>
            </div>
          </div>

          {/* Tidak Hadir */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                Tidak Hadir
              </span>
              <span className="font-bold text-slate-700">{dataRingkasan.tidakHadir}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${dataRingkasan.tidakHadir}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartaKehadiran;