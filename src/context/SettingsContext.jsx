// File path: src/context/SettingsContext.jsx
// Settings global: theme (light/dark), saiz font, dan simpan ke localStorage.
// Cara guna: const { theme, toggleTheme, fontScale, setFontScale } = useSettings();

import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

function bacaLocal() {
  try {
    return {
      theme: localStorage.getItem('eguru_theme') || 'light',
      fontScale: parseFloat(localStorage.getItem('eguru_font')) || 1,
    };
  } catch {
    return { theme: 'light', fontScale: 1 };
  }
}

export function SettingsProvider({ children }) {
  const awal = bacaLocal();
  const [theme, setTheme] = useState(awal.theme);
  const [fontScale, setFontScaleState] = useState(awal.fontScale);

  // Apply theme ke <html> (untuk Tailwind dark:)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('eguru_theme', theme); } catch {}
  }, [theme]);

  // Apply saiz font ke CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', String(fontScale));
    try { localStorage.setItem('eguru_font', String(fontScale)); } catch {}
  }, [fontScale]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const setFontScale = (v) => setFontScaleState(Math.min(1.4, Math.max(0.9, v)));

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, fontScale, setFontScale }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return { theme: 'light', toggleTheme: () => {}, fontScale: 1, setFontScale: () => {} };
  }
  return ctx;
}
