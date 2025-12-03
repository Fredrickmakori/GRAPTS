// src/components/ProjectTable.js
import React from "react";

const ProjectTable = ({ projects = [], onView }) => {
  return (
    <div className="glass-card p-5 rounded-xl neon-border">
      <h3 className="font-semibold text-white mb-3">Projects</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="sticky top-0 bg-black/40 backdrop-blur border-b border-white/10">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Budget</th>
              <th className="py-2">Status</th>
              <th className="py-2">Location</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="py-2">{p.name}</td>
                <td className="py-2 text-cyan-300">
                  {p.budget ? `KSh ${p.budget.toLocaleString()}` : "—"}
                </td>
                <td className="py-2">{p.status || "Unknown"}</td>
                <td className="py-2">{p.location || "N/A"}</td>
                <td className="py-2">
                  <button
                    onClick={() => onView(p)}
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-500 rounded text-white text-xs"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
