import React from "react";

const KpiCard = ({ title, value, delta }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-800">{value}</div>
        {delta && <div className="text-sm text-green-600">{delta}</div>}
      </div>
    </div>
  );
};

export default KpiCard;
