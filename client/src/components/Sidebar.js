import React from "react";

const Sidebar = ({ collapsed, className }) => {
  return (
    <aside
      className={`bg-white border-r ${className || ""}`}
      aria-label="Sidebar"
    >
      <div className="w-64 px-4 py-6">
        <nav className="space-y-2">
          <a
            href="/admin"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Overview
          </a>
          <a
            href="/admin/projects"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Projects
          </a>
          <a
            href="/admin/disbursements"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Disbursements
          </a>
          <a
            href="/admin/issues"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Issues
          </a>
          <a
            href="/admin/reports"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Reports
          </a>
          <a
            href="/admin/settings"
            className="block px-3 py-2 rounded hover:bg-slate-50"
          >
            Settings
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
