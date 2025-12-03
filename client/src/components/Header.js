import React, { useState, useEffect } from "react";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import Logo from "../assets/logo.svg";

/**
 * Header component — reusable across public and authenticated pages.
 * Manages dark mode, branding, navigation links, and mobile menu.
 *
 * Props:
 *   - dark: boolean — current dark mode state
 *   - setDark: (bool) => void — toggle dark mode
 *   - links: array of { href, label } — nav links to display (hidden on mobile)
 *   - ctaLabel: string — "Get started", "Login", etc. (hidden on mobile)
 *   - ctaHref: string — link for CTA button
 */
const Header = ({
  dark = false,
  setDark = () => {},
  links = [],
  ctaLabel = "Get started",
  ctaHref = "/signup",
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Apply dark class to root (Tailwind 'class' strategy)
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("grapts_dark", "1");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("grapts_dark", "0");
    }
  }, [dark]);

  const handleDarkToggle = () => {
    setDark((s) => !s);
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="GRAPTS" className="w-10 h-10" />
          <div className="font-semibold text-lg">GRAPTS</div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 items-center">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Dark mode toggle */}
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

          {/* CTA Button */}
          <a
            href={ctaHref}
            className="px-3 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition"
          >
            {ctaLabel}
          </a>
        </div>

        {/* Mobile Menu Toggle + Dark Mode */}
        <div className="md:hidden flex items-center gap-2">
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-50 dark:bg-slate-700 border-t dark:border-slate-600 p-4">
          <nav className="space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-slate-700 dark:text-slate-300 hover:text-brand-500 transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t dark:border-slate-600">
            <a
              href={ctaHref}
              className="block w-full text-center px-3 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition"
              onClick={() => setMobileOpen(false)}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
