// src/pages/CitizenPortal.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MapWrapper from "../components/MapWrapper";
import { ToastProvider, useToast } from "../components/Toast";
import { fetchPublicProjects } from "../services/api"; // implement to return public projects

export default function CitizenPortal() {
  return (
    <ToastProvider>
      <CitizenInner />
    </ToastProvider>
  );
}

function CitizenInner() {
  const [projects, setProjects] = useState([]);
  const { show } = useToast();

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
                markers={projects
                  .filter((p) => p.latitude && p.longitude)
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
                {projects.slice(0, 6).map((p) => (
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
              <button className="mt-3 px-3 py-2 bg-cyan-500 rounded text-black font-semibold">
                Report
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
