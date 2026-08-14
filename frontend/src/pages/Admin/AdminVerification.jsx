import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CheckCircle, XCircle, AlertCircle, MapPin, Calendar, User, Info, Check, X } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const createCustomMarker = () => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white border-2 border-white shadow ring-4 ring-amber-100"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-13.8 2.9"/><path d="M9 22v-4h4"/></svg></div>`,
    className: 'custom-tree-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const AdminVerification = () => {
  const [pendingTrees, setPendingTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Rejection Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectForm, setRejectForm] = useState({
    rejectionReason: 'Invalid photo',
    notes: '',
  });

  const loadPendingQueue = async () => {
    setLoading(true);
    try {
      const queue = await api.admin.pendingTrees();
      setPendingTrees(queue);
      if (queue.length > 0) {
        setSelectedTree(queue[0]); // Select first item as default workspace item
      } else {
        setSelectedTree(null);
      }
    } catch (err) {
      console.error('Failed to load pending trees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const handleApprove = async () => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      await api.admin.approveTree(selectedTree._id, 'Approved via admin queue');
      setStatusMessage('Tree approved successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      await loadPendingQueue();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRejectModal = () => {
    setRejectForm({ rejectionReason: 'Invalid photo', notes: '' });
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTree) return;
    setSubmitting(true);
    setShowRejectModal(false);
    try {
      await api.admin.rejectTree(selectedTree._id, rejectForm.rejectionReason, rejectForm.notes);
      setStatusMessage('Tree rejected successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      await loadPendingQueue();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-6 flex flex-col h-screen overflow-hidden">
        <div className="shrink-0 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tree Verification Queue</h1>
            <p className="text-sm text-slate-500 mt-1">Review tree submissions and approve/reject based on photos and GPS authenticity</p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-full text-xs">
            {pendingTrees.length} Pending
          </span>
        </div>

        {statusMessage && (
          <div className="shrink-0 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-800">{statusMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
          </div>
        ) : pendingTrees.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800">Queue is Clear!</h2>
            <p className="text-sm text-slate-500">There are no pending tree registrations requiring review.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
            
            {/* Left Column: Pending Queue List (Width-1/3) */}
            <div className="lg:w-1/3 bg-white rounded-3xl border border-slate-100 shadow flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50 font-bold text-slate-700 text-sm">
                Pending Submissions
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {pendingTrees.map((tree) => (
                  <div
                    key={tree._id}
                    onClick={() => setSelectedTree(tree)}
                    className={`p-4 cursor-pointer hover:bg-slate-50/80 transition-colors flex space-x-3 items-center ${
                      selectedTree?._id === tree._id ? 'bg-forest-50 border-r-4 border-forest-500' : ''
                    }`}
                  >
                    <img
                      src={getImageUrl(tree.photoUrl)}
                      alt={tree.species}
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                    <div className="flex-grow">
                      <div className="font-bold text-slate-800 text-xs">{tree.species}</div>
                      <div className="font-mono text-[9px] text-slate-400 font-bold mt-0.5">{tree.treeId}</div>
                      <div className="text-[10px] text-slate-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-0.5" />
                        {tree.district}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Selected Tree Workspace (Width-2/3) */}
            {selectedTree && (
              <div className="lg:w-2/3 bg-white rounded-3xl border border-slate-100 shadow flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50/50 flex justify-between items-center shrink-0">
                  <span className="font-mono text-sm font-extrabold text-slate-500">Workspace Item: {selectedTree.treeId}</span>
                  {selectedTree.rejectionNotes && selectedTree.rejectionNotes.includes('Warning') && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                      Duplicate Suspect
                    </span>
                  )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Photo and Map placement row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planting Photo</h4>
                      <div className="h-56 rounded-2xl overflow-hidden border">
                        <img
                          src={getImageUrl(selectedTree.photoUrl)}
                          alt={selectedTree.species}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">GPS Coordinates Map</h4>
                      <div className="h-56 rounded-2xl overflow-hidden border">
                        <MapContainer
                          center={[selectedTree.latitude, selectedTree.longitude]}
                          zoom={13}
                          className="w-full h-full"
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[selectedTree.latitude, selectedTree.longitude]}
                            icon={createCustomMarker()}
                          />
                        </MapContainer>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Species</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedTree.species}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{selectedTree.treeType}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Location</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedTree.district}</span>
                      <span className="block text-[10px] text-slate-500 font-semibold">{selectedTree.area}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planting Date</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {new Date(selectedTree.plantingDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="sm:col-span-3 border-t pt-4 space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participant Submitter</span>
                      <div className="flex items-center space-x-2 text-xs">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-slate-700">{selectedTree.user?.name}</span>
                        <span className="text-slate-400">|</span>
                        <span>{selectedTree.user?.phone}</span>
                        <span className="text-slate-400">|</span>
                        <span>{selectedTree.user?.email}</span>
                      </div>
                    </div>

                    {selectedTree.rejectionNotes && (
                      <div className="sm:col-span-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-xs text-rose-800 font-semibold">
                        <Info className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                        <span>{selectedTree.rejectionNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approve/Reject control block at bottom */}
                <div className="p-4 border-t bg-slate-50/50 flex justify-end space-x-3 shrink-0">
                  <button
                    onClick={handleOpenRejectModal}
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-xl text-rose-600 bg-white hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Submission
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Tree
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Rejection Reasons Popup Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Tree Submission</h3>
              <p className="text-xs text-slate-500 mt-1">Please select the reason for rejecting this registry application.</p>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rejection Reason *</label>
                <select
                  value={rejectForm.rejectionReason}
                  onChange={(e) => setRejectForm({ ...rejectForm, rejectionReason: e.target.value })}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest-500"
                >
                  <option value="Invalid photo">Invalid photo</option>
                  <option value="Duplicate submission">Duplicate submission</option>
                  <option value="Incorrect information">Incorrect information</option>
                  <option value="Incorrect location">Incorrect location</option>
                  <option value="Tree not visible">Tree not visible</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reviewer Notes (Optional)</label>
                <textarea
                  value={rejectForm.notes}
                  onChange={(e) => setRejectForm({ ...rejectForm, notes: e.target.value })}
                  rows="3"
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                  placeholder="Explain details of rejection (will be visible to user)..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
