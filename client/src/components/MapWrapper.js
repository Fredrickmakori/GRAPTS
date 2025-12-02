import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const DEFAULT_CENTER = [-1.286389, 36.817223]; // Nairobi

const MapWrapper = ({ markers = [], height = 400, zoom = 8 }) => {
  const center =
    markers.length > 0
      ? [
          markers[0].lat || DEFAULT_CENTER[0],
          markers[0].lng || DEFAULT_CENTER[1],
        ]
      : DEFAULT_CENTER;

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id || `${m.lat}-${m.lng}`}
            position={[m.lat || DEFAULT_CENTER[0], m.lng || DEFAULT_CENTER[1]]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{m.title}</div>
                <div className="text-xs text-slate-600">{m.subtitle}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapWrapper;
