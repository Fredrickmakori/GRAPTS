// Navbar.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../services/AuthContext";
import Logo from "../assets/logo.svg";
export default function Navbar({
  links = [], // public links
  ctaLabel = "Get started",
  ctaHref = "/login",
  showDarkToggle = true,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dark mode state
  const [dark, setDark] = useState(() => {
    const stored =
      typeof window !== "undefined" && localStorage.getItem("grapts_dark");
    if (stored !== null) return stored === "1";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("grapts_dark", "1");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("grapts_dark", "0");
    }
  }, [dark]);

  const handleDarkToggle = () => setDark((s) => !s);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    const roleRoutes = {
      admin: "/admin",
      project_manager: "/projects",
      financial_officer: "/financial",
      auditor: "/auditor",
      citizen: "/citizen",
    };
    return roleRoutes[user.role] || "/dashboard";
  };

  // Links
  const publicLinks = links.length > 0 ? links : [];
  const authLinks = user
    ? [
        { href: getDashboardRoute(), label: "Dashboard" },
        { href: "/projects", label: "Projects" },
        { href: "/reports", label: "Reports" },
      ]
    : [];
  const navLinks = user ? authLinks : publicLinks;

  return (
    <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="GRAPTS" className="w-10 h-10" />
          <div className="font-semibold text-lg text-slate-900 dark:text-white">
            GRAPTS
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 items-center">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition font-medium text-sm"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Dark Mode Toggle */}
          {showDarkToggle && (
            <button
              aria-label="Toggle dark mode"
              onClick={handleDarkToggle}
              className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              {dark ? (
                <FiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* CTA / Auth actions */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(ctaHref)}
              className="px-3 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition text-sm"
            >
              {ctaLabel}
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          {showDarkToggle && (
            <button
              aria-label="Toggle dark mode"
              onClick={handleDarkToggle}
              className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              {dark ? (
                <FiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>
          )}
          <button
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {mobileOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-50 dark:bg-slate-700 border-t dark:border-slate-600 p-4">
          <nav className="space-y-2 mb-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition font-medium text-sm"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile CTA / Auth actions */}
          <div className="pt-4 border-t dark:border-slate-600 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate(ctaHref);
                  setMobileOpen(false);
                }}
                className="block w-full text-center px-3 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition text-sm"
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
