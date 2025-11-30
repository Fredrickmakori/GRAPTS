import React from "react";
import { FiBarChart2, FiShield, FiUsers } from "react-icons/fi";
import Logo from "../../design/logo.svg";
import Mock from "../../design/mock-dashboard.png";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-sky-800 to-sky-600 text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={Logo} alt="GRAPTS" className="h-10" />
            <h1 className="text-xl font-semibold tracking-tight">GRAPTS</h1>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="hover:underline" href="#features">
              Home
            </a>
            <a className="hover:underline" href="#how">
              About
            </a>
            <a className="hover:underline" href="/login">
              Login
            </a>
            <a
              href="/signup"
              className="bg-white text-sky-700 px-3 py-1 rounded-md shadow"
            >
              Sign Up
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800">
              Government Resource Allocation & Project Tracking
            </h2>
            <p className="text-slate-600 mt-4 max-w-xl">
              Transparent project tracking, fund disbursement records, milestone
              verification, and public dashboards — built for accountability and
              citizen transparency.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-sky-700 text-white px-4 py-2 rounded shadow"
              >
                Try Demo
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 rounded text-slate-700"
              >
                View Dashboard
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow flex items-center gap-3">
                <FiBarChart2 className="text-sky-600 w-6 h-6" />
                <div>
                  <div className="text-sm text-slate-500">Budget</div>
                  <div className="font-semibold text-slate-800">$12.4M</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center gap-3">
                <FiUsers className="text-sky-600 w-6 h-6" />
                <div>
                  <div className="text-sm text-slate-500">Projects</div>
                  <div className="font-semibold text-slate-800">24</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center gap-3">
                <FiShield className="text-sky-600 w-6 h-6" />
                <div>
                  <div className="text-sm text-slate-500">Auditable</div>
                  <div className="font-semibold text-slate-800">SHA-256</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-lg bg-white">
              <img
                src={Mock}
                alt="Dashboard mock"
                className="w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-12">
          <div className="container mx-auto px-6">
            <h3 className="text-2xl font-bold text-sky-800">
              Core MVP features
            </h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border bg-slate-50">
                <h4 className="font-semibold text-lg">Project Management</h4>
                <p className="text-slate-600 mt-2">
                  Register projects, add milestones, upload documents and track
                  status.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-slate-50">
                <h4 className="font-semibold text-lg">
                  Resource & Disbursements
                </h4>
                <p className="text-slate-600 mt-2">
                  Log disbursements, compare allocated vs used funds and
                  generate reports.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-slate-50">
                <h4 className="font-semibold text-lg">Audit Ledger</h4>
                <p className="text-slate-600 mt-2">
                  Tamper-evident audit logs with SHA-256 hashing for every
                  action.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-100 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            © GRAPTS — Government Resource Allocation & Project Tracking System
          </div>
          <div className="flex gap-4">
            <a className="text-slate-600" href="#">
              Privacy
            </a>
            <a className="text-slate-600" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
