// File path: src/components/Toast.jsx
// Toast ringkas (ganti alert()).
// Cara guna:
//   import { ToastProvider, useToast } from './components/Toast';
//   const toast = useToast();
//   toast.success('Berjaya disimpan!');
//   toast.error('Gagal: ' + msg);
//   toast.info('Maklumat...');

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    const id = ++idCounter;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const api = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  // Jadikan api boleh dipanggil terus: toast("...") -> auto pilih type
  // (guna untuk ganti alert() sedia ada dengan selamat).
  const toast = (m) => push(m.toLowerCase().includes('gagal') ? 'error' : 'success', m);
  toast.success = api.success;
  toast.error = api.error;
  toast.info = api.info;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white transition-all ${
              t.type === 'success'
                ? 'bg-emerald-600'
                : t.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback selamat: kalau diluar provider, guna alert.
    const fallback = (m) => alert(m);
    fallback.success = (m) => alert(m);
    fallback.error = (m) => alert(m);
    fallback.info = (m) => alert(m);
    return fallback;
  }
  return ctx;
}
