// src/components/Toast.js
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(
    (message, { timeout = 3000, type = "info" } = {}) => {
      const id = Date.now().toString();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, timeout);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg glass-card neon-border animate-slide-in text-white ${
              t.type === "error"
                ? "border-red-500/40 text-red-300"
                : t.type === "success"
                ? "border-green-500/40 text-green-300"
                : "text-cyan-300"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
