// File path: src/components/SettingsModal.jsx
// Modal Setting: theme (light/dark), saiz font, akses profil guru, about.

import { useSettings } from '../context/SettingsContext';
import { useToast } from './Toast';

export default function SettingsModal({ buka, tutup, user, setActiveTab }) {
  const { theme, toggleTheme, fontScale, setFontScale } = useSettings();
  const toast = useToast();

  if (!buka) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" onClick={tutup}>
      <div
        className="card w-full max-w-md p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">⚙️ Tetapan</h2>
          <button onClick={tutup} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* Tema */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Mod Paparan</p>
            <p className="text-xs text-slate-500">Terang atau Gelap</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-16 h-9 rounded-full transition ${theme === 'dark' ? 'bg-accent-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-8' : 'left-1'}`}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>

        {/* Saiz Font */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-slate-800 dark:text-white">Saiz Tulisan</p>
            <span className="text-xs text-slate-500">{Math.round(fontScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.9"
            max="1.4"
            step="0.05"
            value={fontScale}
            onChange={(e) => setFontScale(parseFloat(e.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="text-[11px] text-slate-400 mt-1">Larger = lebih selesa dibaca di kelas/pejabat.</p>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        {/* Profil Guru */}
        <button
          onClick={() => { tutup(); setActiveTab('profil'); }}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
        >
          <span className="text-xl">👤</span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Profil Guru</p>
            <p className="text-xs text-slate-500">Kemaskini nama, KP, gred, telefon, kata laluan</p>
          </div>
        </button>

        {/* About */}
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-600 dark:text-slate-300">e-Guru · Sistem Pengurusan Guru</p>
          <p>Versi 1.0 — Modul: Dashboard, Kehadiran, Jadual, ERPH, Laporan.</p>
        </div>

        <button onClick={() => { toast.info('Tetapan disimpan secara automatik.'); tutup(); }}
          className="btn-primary w-full">
          Tutup
        </button>
      </div>
    </div>
  );
}
