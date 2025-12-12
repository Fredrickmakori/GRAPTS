// src/pages/CitizenPortal.js
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MapWrapper from "../components/MapWrapper";
import { ToastProvider, useToast } from "../components/Toast";
import { fetchPublicProjects, BASE_URL } from "../services/api"; // implement to return public projects

export default function CitizenPortal() {
  return (
    <ToastProvider>
      <CitizenInner />
    </ToastProvider>
  );
}

function CitizenInner() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [showKenyaOnly, setShowKenyaOnly] = useState(false);
  const { show } = useToast();
  const navigate = useNavigate();
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchPublicProjects()
      .then((data) => {
        // Ensure data is always an array
        const projectsList = Array.isArray(data) ? data : data?.projects || [];
        setProjects(projectsList);
      })
      .catch((err) => {
        console.error(err);
        setProjects([]);
        show("Could not load projects", { type: "error" });
      });
  }, [show]);

  // When AI mode is enabled and there's a query, call server-side AI search
  useEffect(() => {
    let cancelled = false;
    const q = (query || "").trim();
    if (!useAi || !q || q.length < 3) {
      setAiResults([]);
      setAiLoading(false);
      return;
    }

    if (!BASE_URL) {
      show("Server AI search unavailable: missing API URL", { type: "error" });
      return;
    }

    setAiLoading(true);
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/ai/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, limit: 50 }),
        });
        if (!r.ok) throw new Error(`AI search failed (${r.status})`);
        const body = await r.json();
        if (!cancelled) {
          setAiResults(Array.isArray(body.results) ? body.results : body.results || []);
        }
      } catch (err) {
        console.error('AI search error:', err);
        if (!cancelled) setAiResults([]);
        show('AI search failed', { type: 'error' });
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useAi, query, show]);

  const filteredProjects = useMemo(() => {
    let list = Array.isArray(projects) ? projects : [];
    if (query && query.trim()) {
      const q = query.toLowerCase();
      // If AI mode enabled, do a simple fuzzy match across fields (client-side)
      if (useAi) {
        list = list.filter((p) => {
          const hay = [p.name, p.what, p.where, p.county, p.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
      } else {
        // simple substring match
        list = list.filter((p) => {
          return (
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.county && p.county.toLowerCase().includes(q)) ||
            (p.what && p.what.toLowerCase().includes(q))
          );
        });
      }
    }

    if (showKenyaOnly) {
      list = list.filter((p) => {
        // Accept either a `country` field or `county` that includes Kenya
        const country = (p.country || "").toString().toLowerCase();
        const county = (p.county || "").toString().toLowerCase();
        return country.includes("kenya") || county.includes("kenya");
      });
    }

    return list;
  }, [projects, query, useAi, showKenyaOnly]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Explore public projects</h1>
          <div className="text-sm text-slate-300">
            Filter by county or sector — coming soon
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-96 glass-card rounded-xl p-2">
              <MapWrapper
                markers={(useAi && aiResults.length ? aiResults : filteredProjects)
                  .filter((p) => p.latitude && p.longitude || p.lat && p.lng)
                  .map((p) => ({
                    id: p.id,
                    lat: p.latitude || p.lat,
                    lng: p.longitude || p.lng,
                    title: p.name,
                    subtitle: `${p.county || "Unknown"} • ${p.status || ""}`,
                    who: p.who,
                    what: p.what,
                    where: p.where,
                    when: p.when,
                    why: p.why,
                  }))}
              />
            </div>
          </div>

          <aside>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-semibold">Latest projects</h3>
              <ul className="mt-3 space-y-3">
                {(useAi && aiResults.length ? aiResults : filteredProjects).slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    className="p-2 rounded hover:bg-white/5 transition"
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-300">
                      {p.county} • Progress: {p.progress}%
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 glass-card p-4 rounded-xl">
              <h4 className="font-semibold">Report an issue</h4>
              <p className="text-sm text-slate-300 mt-2">
                If you spot a problem, send a report to the county office with
                photos.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-2 bg-cyan-500 rounded text-black font-semibold"
                  onClick={() => navigate("/reports")}
                >
                  Report
                </button>
                <button
                  className="px-3 py-2 bg-slate-700 rounded text-white text-sm"
                  onClick={() => show("Report feature coming soon", { type: "info" })}
                >
                  Quick report
                </button>
              </div>
            </div>
            <div className="mt-4 glass-card p-4 rounded-xl">
              <h4 className="font-semibold">Published projects in Kenya</h4>
              <p className="text-sm text-slate-300 mt-2">
                Showing projects that are tagged as located in Kenya.
              </p>
              <div className="mt-3">
                <div className="text-sm text-slate-300">Total: {projects.filter(p => ((p.country||"").toString().toLowerCase().includes('kenya') || (p.county||"").toString().toLowerCase().includes('kenya'))).length}</div>
                <ul className="mt-2 space-y-2">
                  {projects
                    .filter(p => ((p.country||"").toString().toLowerCase().includes('kenya') || (p.county||"").toString().toLowerCase().includes('kenya')))
                    .slice(0,5)
                    .map(p => (
                      <li key={p.id} className="p-2 bg-slate-800 rounded">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-slate-300">{p.county} • Progress: {p.progress}%</div>
                        <div className="w-full bg-slate-700 h-2 rounded mt-2">
                          <div style={{width: `${Math.min(100,p.progress||0)}%`}} className="bg-cyan-500 h-2 rounded"></div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
