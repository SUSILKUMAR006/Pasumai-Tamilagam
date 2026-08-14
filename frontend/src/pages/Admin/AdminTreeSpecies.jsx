import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Settings2, Plus, Edit2, Trash2, CheckCircle, XCircle, Settings, Save, X } from 'lucide-react';

const AdminTreeSpecies = () => {
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({ name: '', tamilName: '', category: 'Native' });
  const [editForm, setEditForm] = useState({ name: '', tamilName: '', category: 'Native', active: true });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadSpecies = async () => {
    setLoading(true);
    try {
      const list = await api.admin.species.list();
      setSpeciesList(list);
    } catch (err) {
      console.error('Failed to load species catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.tamilName) return;

    setSubmitting(true);
    try {
      await api.admin.species.create(createForm);
      setCreateForm({ name: '', tamilName: '', category: 'Native' });
      setMessage('New species created successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadSpecies();
    } catch (err) {
      alert(err.message || 'Failed to create species');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (sp) => {
    setEditingId(sp._id);
    setEditForm({
      name: sp.name,
      tamilName: sp.tamilName,
      category: sp.category,
      active: sp.active,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.admin.species.update(id, editForm);
      setEditingId(null);
      setMessage('Species updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadSpecies();
    } catch (err) {
      alert(err.message || 'Failed to update species');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this species permanently? This might affect existing tree references.')) return;
    setSubmitting(true);
    try {
      await api.admin.species.delete(id);
      setMessage('Species deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadSpecies();
    } catch (err) {
      alert(err.message || 'Failed to delete species');
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Manage Tree Species</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active species, category classifications, and Tamil translation mappings</p>
        </div>

        {message && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold text-emerald-800">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Create Form (Width-1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Create New Species</span>
              </h3>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">English Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    placeholder="e.g. Red Sandalwood"
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tamil Name *</label>
                  <input
                    type="text"
                    value={createForm.tamilName}
                    onChange={(e) => setCreateForm({ ...createForm, tamilName: e.target.value })}
                    required
                    placeholder="e.g. செம்மரம் (Semmaram)"
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Classification *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    required
                    className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
                  >
                    <option value="Native">Native</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Shade">Shade</option>
                    <option value="Timber">Timber</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-md transition-colors cursor-pointer"
                  >
                    Create Species
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Species Catalog List (Width-2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50 font-bold text-slate-700 text-sm">
                Tree Species Catalog
              </div>

              {loading ? (
                <div className="p-20 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600"></div>
                </div>
              ) : speciesList.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm">No tree species cataloged.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">English Name</th>
                        <th className="px-6 py-4">Tamil Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {speciesList.map((sp) => (
                        <tr key={sp._id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Render Inline Editor if editingId === sp._id */}
                          {editingId === sp._id ? (
                            <>
                              <td className="px-6 py-2">
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="border rounded px-2 py-1 focus:outline-none w-full"
                                />
                              </td>
                              <td className="px-6 py-2">
                                <input
                                  type="text"
                                  value={editForm.tamilName}
                                  onChange={(e) => setEditForm({ ...editForm, tamilName: e.target.value })}
                                  className="border rounded px-2 py-1 focus:outline-none w-full"
                                />
                              </td>
                              <td className="px-6 py-2">
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                  className="border bg-white rounded px-2 py-1 focus:outline-none w-full"
                                >
                                  <option value="Native">Native</option>
                                  <option value="Fruit">Fruit</option>
                                  <option value="Shade">Shade</option>
                                  <option value="Timber">Timber</option>
                                  <option value="Other">Other</option>
                                </select>
                              </td>
                              <td className="px-6 py-2">
                                <select
                                  value={editForm.active ? 'true' : 'false'}
                                  onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                                  className="border bg-white rounded px-2 py-1 focus:outline-none w-full"
                                >
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </td>
                              <td className="px-6 py-2 text-center flex justify-center space-x-1.5">
                                <button
                                  onClick={(e) => handleEditSubmit(e, sp._id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="Save"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 font-bold text-slate-800">{sp.name}</td>
                              <td className="px-6 py-4 font-semibold text-slate-700">{sp.tamilName}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
                                  {sp.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                    sp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {sp.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center space-x-2">
                                <button
                                  onClick={() => handleStartEdit(sp)}
                                  className="inline-flex items-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 p-1 rounded"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sp._id)}
                                  className="inline-flex items-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminTreeSpecies;
