import React from "react";
import { FiBarChart2, FiShield, FiUsers } from "react-icons/fi";
import Logo from "../assets/logo.svg";

const FeatureCard = ({ icon, title, children }) => (
  <div className="p-6 rounded-xl shadow-sm bg-white">
    <div className="flex items-start gap-3">
      <div className="text-brand-500 w-10 h-10 flex items-center justify-center rounded-lg bg-brand-50">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-sm text-slate-600 mt-2">{children}</p>
      </div>
    </div>
  </div>
);

const HeroMosaic = ({ className = "" }) => {
  // Curated Unsplash images related to infrastructure and civic projects
  const imgA = "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1200&q=80&auto=format&fit=crop"; // road
  const imgB = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80&auto=format&fit=crop"; // construction

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <img
          src={imgA}
          alt="Infrastructure"
          className="rounded-xl object-cover h-56 w-full shadow"
        />
        <div className="space-y-2">
          <img
            src={imgB}
            alt="Construction"
            className="rounded-xl object-cover h-28 w-full shadow"
          />
          <div className="h-24 bg-brand-50 rounded-xl flex items-center justify-center text-sm text-brand-700">
            <div className="p-4">Community impact maps and live data</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-10 left-4 w-64 card brand-shadow p-4">
        <div className="text-xs text-muted">Live sample</div>
        <div className="mt-1 font-semibold text-brand-700">Kisumu Road Upgrade</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-brand-50 p-2 rounded text-sm">Budget: KSh 23M</div>
          <div className="bg-brand-50 p-2 rounded text-sm">Progress: 67%</div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => (
  <header className="bg-white border-b">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src={Logo} alt="GRAPTS logo" className="h-10 w-10" />
        <span className="text-lg font-semibold tracking-tight">GRAPTS</span>
      </div>
      <nav className="hidden md:flex gap-6 items-center">
        <a className="hover:underline text-slate-700" href="#features">
          Features
        </a>
        <a className="hover:underline text-slate-700" href="/reports">
          Reports
        </a>
        <a className="hover:underline text-slate-700" href="/login">
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
  </header>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-brand-50 text-sm text-brand-700 font-medium mb-4">
              Kenya • Public Transparency
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-deep leading-tight">
              Government Resource Allocation & Project Tracking
            </h1>
            <p className="mt-6 text-lg text-muted max-w-xl">
              Track projects, verify milestones, and make public spending
              transparent — built to increase accountability and citizen trust.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl shadow font-semibold"
              >
                Get started
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border border-slate-200 px-6 py-3 rounded-xl text-muted"
              >
                Learn more
              </a>
            </div>

            <p className="mt-4 text-sm text-muted italic">
              Uwajibikaji wa rasilimali za Umma
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={<FiBarChart2 className="w-5 h-5" />}
                title="Budget"
              >
                Track allocation and compare to actual spending across counties.
              </FeatureCard>
              <FeatureCard
                icon={<FiUsers className="w-5 h-5" />}
                title="Projects"
              >
                Register projects with milestones, documentation and geotags.
              </FeatureCard>
              <FeatureCard
                icon={<FiShield className="w-5 h-5" />}
                title="Audit Ledger"
              >
                Tamper-evident audit logs with cryptographic verification.
              </FeatureCard>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end relative">
            <div className="w-full max-w-lg">
              <HeroMosaic />
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-brand-deep">
              Core MVP features
            </h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<svg className="w-5 h-5" />}
                title="Project Management"
              >
                Register projects, add milestones, upload verified documents and
                track status publicly.
              </FeatureCard>
              <FeatureCard
                icon={<svg className="w-5 h-5" />}
                title="Resource & Disbursements"
              >
                Log and reconcile disbursements with clear, auditable trails.
              </FeatureCard>
              <FeatureCard
                icon={<svg className="w-5 h-5" />}
                title="Geospatial Transparency"
              >
                Map-based public dashboards show where funds are spent.
              </FeatureCard>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-semibold">
                Join the movement for accountable spending
              </h4>
              <p className="text-sm text-slate-600 mt-2">
                Sign up to monitor projects in your county and receive updates.
              </p>
            </div>
            <div>
              <a
                href="/signup"
                className="px-5 py-3 bg-brand-blue text-white rounded-lg font-semibold"
              >
                Create an account
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
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
