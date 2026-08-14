import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Calendar, MapPin, CheckCircle, Clock, XCircle, ArrowLeft, Heart, Shield, Award } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const createCustomMarker = (status) => {
  let color = 'bg-emerald-500 ring-emerald-200';
  if (status === 'PENDING_VERIFICATION') color = 'bg-amber-500 ring-amber-200';
  if (status === 'REJECTED') color = 'bg-rose-500 ring-rose-200';

  return L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full ${color} text-white border-2 border-white shadow-md ring-4"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-13.8 2.9"/><path d="M9 22v-4h4"/></svg></div>`,
    className: 'custom-tree-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const TreeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await api.trees.details(id);
        setTree(data);
      } catch (err) {
        setError(err.message || 'Tree details not found');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex-grow max-w-md mx-auto flex flex-col items-center justify-center p-8 space-y-4">
        <XCircle className="h-16 w-16 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-800">Details Error</h2>
        <p className="text-sm text-slate-500 text-center">{error || 'Tree details page could not load.'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // Determine if details are public or private (private coordinates are obfuscated on backend)
  const isOwnerOrAdmin = user && (user.role === 'ADMIN' || (tree.user && tree.user._id === user._id));

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to list
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Picture and Status Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="h-72 bg-slate-100 relative">
              <img
                src={getImageUrl(tree.photoUrl)}
                alt={tree.species}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-5 shadow-sm border ${
                    tree.status === 'VERIFIED'
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : tree.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-500 border-amber-400 text-white'
                      : 'bg-rose-500 border-rose-400 text-white'
                  }`}
                >
                  {tree.status === 'VERIFIED' ? 'Verified' : tree.status === 'PENDING_VERIFICATION' ? 'Pending Verification' : 'Rejected'}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tree ID</span>
                <h2 className="font-mono text-2xl font-black text-slate-800 mt-0.5">{tree.treeId}</h2>
              </div>

              <div className="border-t border-slate-50 pt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400 text-xs">Submitted on</span>
                  <span className="font-bold">{new Date(tree.createdAt).toLocaleDateString()}</span>
                </div>
                {tree.status === 'VERIFIED' && tree.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 text-xs">Verified on</span>
                    <span className="font-bold text-emerald-600">{new Date(tree.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {tree.status === 'REJECTED' && tree.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 text-xs">Reviewed on</span>
                    <span className="font-bold text-rose-600">{new Date(tree.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details Box (only visible to owner or admin) */}
          {tree.user && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Planted By</h3>
              <div className="flex items-center space-x-3">
                {tree.user.profileImage ? (
                  <img
                    src={getImageUrl(tree.user.profileImage)}
                    alt={tree.user.name}
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-forest-50 flex items-center justify-center border text-forest-700 font-extrabold">
                    {tree.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{tree.user.name}</h4>
                  <p className="text-xs text-slate-500">District: {tree.user.district}</p>
                </div>
              </div>
              {isOwnerOrAdmin && (
                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <p>Email: {tree.user.email}</p>
                  <p>Phone: {tree.user.phone}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Tree properties, location map, survival logging */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Properties Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                {tree.treeType} Species
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{tree.species}</h2>
            </div>

            {tree.description && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes & Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{tree.description}</p>
              </div>
            )}

            {/* Verification decision/reason block */}
            {tree.status === 'REJECTED' && tree.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> Rejection Reason
                </h4>
                <p className="text-sm text-rose-900 font-bold">{tree.rejectionReason}</p>
                {tree.rejectionNotes && <p className="text-xs text-rose-700 italic">Notes: {tree.rejectionNotes}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Planting Date</span>
                  <span className="text-sm font-semibold text-slate-800">{new Date(tree.plantingDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Planting Site</span>
                  <span className="text-sm font-semibold text-slate-800">{tree.district} ({tree.area})</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                    Coords: {tree.latitude?.toFixed(5)}, {tree.longitude?.toFixed(5)}
                    {!isOwnerOrAdmin && ' (Obfuscated for privacy)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placement Card */}
          {tree.latitude && tree.longitude && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Coordinates Map Position</h3>
              <div className="h-[250px] rounded-2xl overflow-hidden border">
                <MapContainer center={[tree.latitude, tree.longitude]} zoom={14} className="w-full h-full">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[tree.latitude, tree.longitude]} icon={createCustomMarker(tree.status)}>
                    <Popup>
                      <div className="text-xs font-semibold">
                        <p className="font-bold">{tree.species}</p>
                        <p className="font-mono text-[9px] text-slate-500">{tree.treeId}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Growth/Survival History placeholder section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                <span>Growth & Survival History</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                Phase 2 Coming Soon
              </span>
            </div>
            <div className="text-center py-6 text-xs text-slate-400">
              <Award className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              Survival verifications and growth logging will allow tracking of trees confirmed alive over 6, 12, and 24 month intervals.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TreeDetails;
