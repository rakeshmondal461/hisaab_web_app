import React, { useState, useCallback } from 'react';

let toastId = 0;
let globalAddToast = null;

export function useToast() {
  const show = useCallback((msg, type = 'info') => {
    if (globalAddToast) globalAddToast(msg, type);
  }, []);
  return show;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  globalAddToast = (msg, type) => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
