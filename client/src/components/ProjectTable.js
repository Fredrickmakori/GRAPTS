import React from "react";

const ProjectTable = ({ projects = [], onView }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-3">Projects</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-600">
              <th className="py-2">Name</th>
              <th className="py-2">Budget</th>
              <th className="py-2">Status</th>
              <th className="py-2">Location</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id || p.name} className="border-t">
                <td className="py-2">{p.name}</td>
                <td className="py-2">
                  {p.budget ? `KSh ${p.budget.toLocaleString()}` : "—"}
                </td>
                <td className="py-2">{p.status || "Unknown"}</td>
                <td className="py-2">{p.location || "N/A"}</td>
                <td className="py-2">
                  <button
                    onClick={() => onView && onView(p)}
                    className="px-3 py-1 text-sm rounded bg-brand-500 text-white"
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
