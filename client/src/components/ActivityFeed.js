// src/components/ActivityFeed.js
import React from "react";

const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="glass-card p-5 rounded-xl neon-border">
      <h3 className="font-semibold text-white mb-4">Recent Activity</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-300">No recent activity.</p>
      ) : (
        <ul className="space-y-4 relative">
          {activities.map((a, i) => (
            <li key={a.id} className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-cyan-400 shadow-glow" />

              <div className="text-sm text-white">{a.message}</div>
              <div className="text-xs text-slate-400">{a.user}</div>
              <div className="text-xs text-slate-500">
                {new Date(a.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
