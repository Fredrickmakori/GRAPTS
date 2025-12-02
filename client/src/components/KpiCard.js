import React from "react";

const KpiCard = ({ title, value, delta }) => {
  return (
    <div className="p-4 shadow-sm card">
      <div className="text-sm text-muted">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div
          style={{ color: "var(--text-900)" }}
          className="text-2xl font-semibold"
        >
          {value}
        </div>
        {delta && (
          <div style={{ color: "var(--accent-amber)" }} className="text-sm">
            {delta}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
