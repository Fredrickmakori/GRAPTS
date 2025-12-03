// src/components/Sidebar.js
import React from "react";
import {
  FiHome,
  FiMap,
  FiFileText,
  FiSettings,
  FiLayers,
} from "react-icons/fi";

const Item = ({ icon, label, link }) => (
  <a
    href={link}
    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 neon-hover transition"
  >
    {icon}
    <span>{label}</span>
  </a>
);

const Sidebar = ({ collapsed = false, className }) => {
  return (
    <aside
      className={`h-full glass-card border-r border-white/10 p-4 ${className}`}
    >
      <nav className="space-y-2 text-sm">
        <Item icon={<FiHome />} label="Overview" link="/admin" />
        <Item icon={<FiLayers />} label="Projects" link="/admin/projects" />
        <Item
          icon={<FiMap />}
          label="Disbursements"
          link="/admin/disbursements"
        />
        <Item icon={<FiFileText />} label="Issues" link="/admin/issues" />
        <Item icon={<FiSettings />} label="Settings" link="/admin/settings" />
      </nav>
    </aside>
  );
};

export default Sidebar;
