// client/src/pages/LandingPageEnhanced.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiShield,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import Header from "../components/Header";
import Logo from "../assets/logo.svg";

/*
  Enhanced landing page:
  - Animated counters (on-scroll)
  - Parallax effect (on-scroll transforms)
  - Video hero with poster fallback
  - Dark mode toggle (stores preference in localStorage)
  - Testimonials & county badges
  - Mobile-friendly improvements
*/

/* -------------------------
   RESOURCES (replace with your real project images/video)
   ------------------------- */
const RESOURCES = {
  video:
    // Placeholder: replace with your MP4 link or hosted video
    "https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-1591883519047?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // replace
  poster:
    "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1600&q=80&auto=format&fit=crop",
  projects: {
    kisumu:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80&auto=format&fit=crop",
    kisii:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=80&auto=format&fit=crop",
    mombasa:
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80&auto=format&fit=crop",
    nakuru:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&q=80&auto=format&fit=crop",
  },
  countyBadges: {
    nairobi:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&q=80&auto=format&fit=crop",
    kisii:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop",
    mombasa:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80&auto=format&fit=crop",
    nakuru:
      "https://images.unsplash.com/photo-1505672678657-cc7037095e2c?w=800&q=80&auto=format&fit=crop",
  },
};

/* -------------------------
   Small reusable components
   ------------------------- */
const Badge = ({ src, label }) => (
  <div className="flex flex-col items-center gap-2">
    <img
      src={src}
      alt={label}
      className="w-20 h-12 object-cover rounded-md shadow-sm"
    />
    <div className="text-xs text-slate-600 dark:text-slate-300">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, children }) => (
  <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transform transition hover:-translate-y-1">
    <div className="flex gap-3 items-start">
      <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {children}
        </p>
      </div>
    </div>
  </div>
);

/* -------------------------
   Counter Hook (no external libraries)
   ------------------------- */
const useAnimatedCounter = (ref, target, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    let rafId = null;

    const handle = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const step = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            setValue(current);
            if (progress < 1) rafId = requestAnimationFrame(step);
          };
          rafId = requestAnimationFrame(step);
        }
      });
    };

    const obs = new IntersectionObserver(handle, { threshold: 0.3 });
    obs.observe(el);

    return () => {
      obs.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [ref, target, duration]);

  return value;
};

/* -------------------------
   Main component
   ------------------------- */
const LandingPageEnhanced = () => {
  const [dark, setDark] = useState(() => {
    // read stored preference or prefer-color-scheme
    const stored =
      typeof window !== "undefined" && localStorage.getItem("grapts_dark");
    if (stored !== null) return stored === "1";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // Parallax refs
  const heroRef = useRef(null);
  const parallaxRef = useRef(null);

  // Counters
  const projectsRef = useRef(null);
  const fundsRef = useRef(null);
  const countiesRef = useRef(null);

  const projectsCount = useAnimatedCounter(projectsRef, 128, 1400);
  const fundsCount = useAnimatedCounter(fundsRef, 1200000000, 1200); // animate big number
  const countiesCount = useAnimatedCounter(countiesRef, 47, 1000);

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

  useEffect(() => {
    // Parallax scroll handler
    const handle = () => {
      if (!parallaxRef.current || !heroRef.current) return;
      const scrollY = window.scrollY;
      // move parallax element subtly
      parallaxRef.current.style.transform = `translateY(${scrollY * 0.08}px)`;
      heroRef.current.style.backgroundPosition = `center ${-scrollY * 0.15}px`;
    };
    handle(); // initial
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // format large KSh number for display
  const formatMoney = (n) => {
    if (n >= 1e9) return `KSh ${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `KSh ${(n / 1e6).toFixed(1)}M`;
    return `KSh ${n.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-page-bg dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* HEADER */}
      <Header
        dark={dark}
        setDark={setDark}
        links={[
          { href: "#features", label: "Features" },
          { href: "#how", label: "How it works" },
          { href: "#counties", label: "Counties" },
          { href: "/reports", label: "Reports" },
        ]}
        ctaLabel="Get started"
        ctaHref="/signup"
      />

      {/* HERO with video background + poster fallback for mobile */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35))`,
        }}
      >
        <div className="absolute inset-0 -z-10">
          {/* Video: set muted autoplay loop playsInline. Provide poster for mobile or slow networks */}
          <video
            src={RESOURCES.video}
            poster={RESOURCES.poster}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover filter brightness-75"
            onError={(e) => {
              // fallback: replace with poster image if video is unavailable
              const v = e.target;
              v.style.display = "none";
              const img = document.createElement("img");
              img.src = RESOURCES.poster;
              img.alt = "hero poster";
              img.className = "w-full h-full object-cover";
              v.parentNode.appendChild(img);
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-sm font-medium">
                Kenya • Public Transparency
              </span>

              <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-md">
                Track public projects — increase accountability & trust
              </h1>

              <p className="mt-4 max-w-xl text-white/90">
                GRAPTS lets citizens, auditors and county officers register
                projects, verify milestones with photos and geotags, and view
                auditable spending in real time.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="px-5 py-3 bg-brand-500 text-white rounded-md font-semibold shadow hover:bg-brand-600"
                >
                  Create account
                </a>
                <a
                  href="#features"
                  className="px-5 py-3 bg-white/80 text-slate-900 rounded-md font-medium hover:bg-white"
                >
                  See features
                </a>
              </div>

              {/* Animated counters */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div className="p-3 bg-white/90 rounded-lg text-center">
                  <div
                    ref={projectsRef}
                    className="text-2xl font-bold text-brand-700"
                  >
                    {projectsCount}
                  </div>
                  <div className="text-xs text-slate-700">Active Projects</div>
                </div>
                <div className="p-3 bg-white/90 rounded-lg text-center">
                  <div
                    ref={fundsRef}
                    className="text-2xl font-bold text-brand-700"
                  >
                    {/* fundsCount is large; show KSh formatting while counting */}
                    {formatShort(fundsCount)}
                  </div>
                  <div className="text-xs text-slate-700">Total Funds</div>
                </div>
                <div className="p-3 bg-white/90 rounded-lg text-center">
                  <div
                    ref={countiesRef}
                    className="text-2xl font-bold text-brand-700"
                  >
                    {countiesCount}
                  </div>
                  <div className="text-xs text-slate-700">Counties Covered</div>
                </div>
              </div>
            </div>

            {/* Right: parallax image card */}
            <div className="relative">
              <div
                ref={parallaxRef}
                className="rounded-xl overflow-hidden shadow-xl transform transition will-change-transform"
              >
                <img
                  src={RESOURCES.projects.kisumu}
                  alt="Kisumu road"
                  className="w-full h-80 object-cover"
                />
                <div className="p-4 bg-white dark:bg-slate-800">
                  <div className="font-semibold">Kisumu Road Upgrade</div>
                  <div className="text-sm text-slate-500">
                    Budget: KSh 23M • Progress: 67%
                  </div>
                </div>
              </div>

              {/* smaller stacked images (mobile friendly) */}
              <div className="hidden sm:grid grid-cols-2 gap-3 mt-4">
                <img
                  src={RESOURCES.projects.kisii}
                  alt="Kisii"
                  className="w-full h-28 object-cover rounded-md shadow"
                />
                <img
                  src={RESOURCES.projects.mombasa}
                  alt="Mombasa"
                  className="w-full h-28 object-cover rounded-md shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <h2 className="text-2xl font-bold mb-4">Core features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard icon={<FiBarChart2 />} title="Budget & Analytics">
            Real-time spending dashboards and anomaly detection for better
            oversight.
          </FeatureCard>
          <FeatureCard icon={<FiUsers />} title="Project Registry">
            Register projects, milestones, geotags and upload verification
            evidence.
          </FeatureCard>
          <FeatureCard icon={<FiShield />} title="Tamper-evident Ledger">
            Cryptographic audit logs for immutable, verifiable history of
            actions.
          </FeatureCard>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">How it works</h3>
            <ol className="space-y-4 text-slate-700 dark:text-slate-300">
              <li>
                <strong>1.</strong> County officer registers projects with
                budget & milestones.
              </li>
              <li>
                <strong>2.</strong> Site engineers upload milestone photos &
                geotags.
              </li>
              <li>
                <strong>3.</strong> Auditors verify and release payments;
                citizens view updates.
              </li>
            </ol>
            <div className="mt-6">
              <a
                href="/login"
                className="px-4 py-2 bg-brand-500 text-white rounded-md"
              >
                Try the dashboard
              </a>
            </div>
          </div>

          <div>
            <div className="rounded-xl overflow-hidden shadow">
              <iframe
                title="Public dashboard preview"
                srcDoc={dashboardMockHtml()}
                className="w-full h-64 border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* COUNTY BADGES */}
      <section
        id="counties"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <h3 className="text-xl font-semibold mb-4">Trusted by counties</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Badge src={RESOURCES.countyBadges.nairobi} label="Nairobi" />
          <Badge src={RESOURCES.countyBadges.kisii} label="Kisii" />
          <Badge src={RESOURCES.countyBadges.mombasa} label="Mombasa" />
          <Badge src={RESOURCES.countyBadges.nakuru} label="Nakuru" />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-12 bg-brand-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold mb-6">What county officers say</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Ms. Achieng, Kisumu",
                text: "GRAPTS made our road project reporting so much easier — we now upload photos and get real-time citizen feedback.",
              },
              {
                name: "Mr. Otieno, Mombasa",
                text: "The audit logs are a game-changer. Our procurement team uses the ledger to reconcile disbursements every month.",
              },
              {
                name: "Ms. Wanjiru, Nakuru",
                text: "Citizens can now see progress on school renovations — it has increased public trust significantly.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-5 bg-white dark:bg-slate-800 rounded-lg shadow"
              >
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">Start monitoring today</h4>
            <p className="text-sm text-slate-600">
              Create an account and join citizens across the country tracking
              public projects.
            </p>
          </div>
          <div>
            <a
              href="/signup"
              className="px-4 py-2 bg-brand-600 text-white rounded-md"
            >
              Create account
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-100 dark:bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600 dark:text-slate-300">
          © {new Date().getFullYear()} GRAPTS — Government Resource Allocation &
          Project Tracking System
        </div>
      </footer>
    </div>
  );

  /* -------------------------
     HELPERS
     ------------------------- */

  function formatShort(n) {
    // display a short money string from animated value (n could be percent or number)
    if (typeof n !== "number") return "KSh 0";
    if (n >= 1_000_000_000) return `KSh ${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `KSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `KSh ${(n / 1000).toFixed(1)}K`;
    return `KSh ${n}`;
  }

  function dashboardMockHtml() {
    // small inline mock for iframe preview (avoids external dependencies)
    return `
      <html>
        <head>
          <style>
            body { font-family: Inter, system-ui, -apple-system; margin:0; background:#fff; color:#111;}
            .wrap{padding:16px;}
            .card{border-radius:8px; padding:12px; background:#f8fafc; margin-bottom:10px;}
            .bar{height:10px; background:#0b5fff; border-radius:6px; width:60%;}
          </style>
        </head>
        <body>
          <div class="wrap">
            <h3>Public Dashboard Preview</h3>
            <div class="card"><strong>Kisumu Road Upgrade</strong><div style="margin-top:8px;" class="bar"></div></div>
            <div class="card"><strong>Nakuru School Renovation</strong><div style="margin-top:8px;" class="bar" /></div>
            <div class="card"><strong>Mombasa Shoreline Works</strong><div style="margin-top:8px;" class="bar" /></div>
          </div>
        </body>
      </html>
    `;
  }
};

export default LandingPageEnhanced;
