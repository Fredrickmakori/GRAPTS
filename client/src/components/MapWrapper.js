// src/components/MapWrapper.js
import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const DEFAULT_CENTER = [-1.286389, 36.817223]; // Nairobi

const MapWrapper = ({ markers = [], height = 420, zoom = 7 }) => {
  const center =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER;

  return (
    <div
      style={{ height }}
      className="relative rounded-xl overflow-hidden neon-border"
    >
      {/* The Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
      >
        <TileLayer
          attribution="Kenya Map © OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-brand-neon">{m.title}</div>
                <div className="text-xs mt-1">{m.subtitle}</div>

                {/* 5 W’s Panel */}
                <div className="mt-3 space-y-0.5 text-xs">
                  <div>
                    <strong>Who:</strong> {m.who || "N/A"}
                  </div>
                  <div>
                    <strong>What:</strong> {m.what || "N/A"}
                  </div>
                  <div>
                    <strong>Where:</strong> {m.where || "N/A"}
                  </div>
                  <div>
                    <strong>When:</strong> {m.when || "N/A"}
                  </div>
                  <div>
                    <strong>Why:</strong> {m.why || "N/A"}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay Label */}
      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded text-xs text-brand-neon border border-cyan-500/40">
        Kenya Project Map
      </div>
    </div>
  );
};

export default MapWrapper;
