import React from "react";

const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-3">Activity Feed</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-slate-600">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <div className="text-xs text-slate-500">
                {new Date(a.timestamp).toLocaleString()}
              </div>
              <div>
                <div className="text-sm">{a.message}</div>
                <div className="text-xs text-slate-500">By: {a.user}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
