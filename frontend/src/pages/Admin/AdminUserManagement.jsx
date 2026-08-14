import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Users, ShieldAlert, Lock, Unlock, Mail, MapPin, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadUsersList = async () => {
    setLoading(true);
    try {
      const list = await api.admin.users();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const handleToggleBlock = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const message = `Are you sure you want to change user status to ${nextStatus}?`;
    if (!window.confirm(message)) return;

    setSubmitting(true);
    try {
      await api.admin.toggleUser(userId, nextStatus);
      await loadUsersList(); // Reload list to reflect changes
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">User Account Management</h1>
          <p className="text-sm text-slate-500 mt-1">Audit platform participants, monitor registration statistics, and toggle user blocks</p>
        </div>

        {/* Users list table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">No registered user accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">District</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4 text-center">Trees Registered</th>
                    <th className="px-6 py-4 text-center">Verified Trees</th>
                    <th className="px-6 py-4">Signed Up</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.map((participant) => (
                    <tr key={participant._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {participant.profileImage ? (
                            <img
                              src={getImageUrl(participant.profileImage)}
                              alt={participant.name}
                              className="h-8 w-8 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-600">
                              {participant.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-slate-800 text-sm">{participant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500 flex items-center space-x-1 mt-2.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{participant.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{participant.district}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500">{participant.phone}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-800 text-sm">
                        {participant.treesRegistered}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-emerald-600 text-sm">
                        {participant.verifiedTrees}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {new Date(participant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-5 ${
                            participant.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {participant.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleBlock(participant._id, participant.status)}
                          disabled={submitting}
                          className={`inline-flex items-center px-2 py-1.5 border rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer ${
                            participant.status === 'ACTIVE'
                              ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                              : 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          }`}
                        >
                          {participant.status === 'ACTIVE' ? (
                            <>
                              <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              Block
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 mr-1 text-rose-500" />
                              Unblock
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
