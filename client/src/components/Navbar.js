import React from "react";
import Logo from "../assets/logo.svg";

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open sidebar"
              onClick={onToggleSidebar}
              className="p-2 rounded-md hover:bg-slate-100 md:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <img src={Logo} alt="GRAPTS" className="h-8 w-8" />
            <span className="font-semibold text-lg text-slate-800">GRAPTS</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm text-slate-700 hover:underline">
              Home
            </a>
            <a
              href="/reports"
              className="text-sm text-slate-700 hover:underline"
            >
              Reports
            </a>
            <a href="/login" className="text-sm text-slate-700 hover:underline">
              Login
            </a>
            <a
              href="/signup"
              className="ml-2 inline-flex items-center px-3 py-1 rounded-md bg-brand-500 text-white text-sm"
            >
              Get started
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
