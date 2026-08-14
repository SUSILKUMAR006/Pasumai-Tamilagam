import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Create custom DOM markers using Leaflet's divIcon with Tailwind classes.
// Avoids icon asset loading bugs in Vite bundling while offering premium aesthetics.
const createCustomMarker = (status) => {
  let color = 'bg-emerald-500 ring-emerald-200';
  if (status === 'PENDING_VERIFICATION') {
    color = 'bg-amber-500 ring-amber-200';
  } else if (status === 'REJECTED') {
    color = 'bg-rose-500 ring-rose-200';
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${color} text-white border-2 border-white shadow-md ring-4 transition-all duration-300 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-13.8 2.9"/><path d="M9 22v-4h4"/></svg>
        <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${color} ring-1 ring-white"></span>
      </div>
    `,
    className: 'custom-tree-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const TreeMarkerMap = ({ trees = [], center = [11.1271, 78.6569], zoom = 7, isAdminView = false }) => {
  return (
    <div className="w-full h-full min-h-[450px] shadow-inner border border-slate-200 rounded-2xl overflow-hidden relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full min-h-[450px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {trees.map((tree) => {
          if (!tree.latitude || !tree.longitude) return null;
          
          return (
            <Marker
              key={tree._id}
              position={[tree.latitude, tree.longitude]}
              icon={createCustomMarker(tree.status)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-2">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-mono text-xs font-bold text-slate-500">{tree.treeId}</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-4 ${
                        tree.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tree.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {tree.status === 'VERIFIED'
                        ? 'Verified'
                        : tree.status === 'PENDING_VERIFICATION'
                        ? 'Pending'
                        : 'Rejected'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{tree.species}</h3>
                    <p className="text-[11px] text-slate-500">Category: {tree.treeType || 'N/A'}</p>
                    <p className="text-[11px] text-slate-500">District: {tree.district}</p>
                    <p className="text-[11px] text-slate-500">Planting Date: {new Date(tree.plantingDate).toLocaleDateString()}</p>
                  </div>
                  <div className="pt-1">
                    <Link
                      to={isAdminView ? `/admin/trees` : `/tree/${tree._id}`}
                      className="block text-center text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 px-2 py-1 rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TreeMarkerMap;
