import React from "react";

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 max-w-xl w-full p-6 rounded-xl glass-card text-white animate-scale">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 text-slate-200">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
