// src/components/KpiCard.js
import React, { useEffect, useState } from "react";

const KpiCard = ({ title, value, delta }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
  }, [value]);

  return (
    <div className="glass-card p-5 rounded-xl neon-border hover:neon-glow transition-all duration-300">
      <div className="text-sm text-slate-300">{title}</div>

      <div className="mt-3 flex items-end gap-3">
        <div className="text-3xl font-bold text-brand-neon">{display}</div>

        {delta && (
          <div className="text-xs text-cyan-300 animate-pulse">{delta}</div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
