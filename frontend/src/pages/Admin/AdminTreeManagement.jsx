import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, Filter, Calendar, MapPin, Eye, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminTreeManagement = () => {
  const [trees, setTrees] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  
  // Pagination & Fetch state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [filters, setFilters] = useState({
    treeIdSearch: '',
    userSearch: '',
    district: '',
    species: '',
    status: '',
  });

  const loadMetadata = async () => {
    try {
      const dists = await api.public.districts();
      setDistricts(dists);

      const specs = await api.public.species();
      setSpeciesList(specs);
    } catch (err) {
      console.error('Failed to load filters metadata:', err);
    }
  };

  const loadTrees = async () => {
    setLoading(true);
    try {
      const response = await api.admin.allTrees({
        page,
        limit: 10,
        ...filters,
      });
      setTrees(response.trees);
      setTotalPages(response.pages);
      setTotalRecords(response.total);
    } catch (err) {
      console.error('Failed to fetch tree management logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadTrees();
  }, [page, filters]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page on change
  };

  const handleReset = () => {
    setFilters({
      treeIdSearch: '',
      userSearch: '',
      district: '',
      species: '',
      status: '',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Tree Registry Logs</h1>
            <p className="text-sm text-slate-500 mt-1">Search, audit, and inspect all tree records uploaded to the database</p>
          </div>
          <span className="px-3 py-1 bg-slate-200 text-slate-700 font-extrabold rounded-full text-xs">
            {totalRecords} Total Trees
          </span>
        </div>

        {/* Searching and filtering options bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm border-b pb-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            <span>Search Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tree ID</label>
              <input
                type="text"
                name="treeIdSearch"
                value={filters.treeIdSearch}
                onChange={handleInputChange}
                placeholder="e.g. TN-TREE-000001"
                className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Submitter Name</label>
              <input
                type="text"
                name="userSearch"
                value={filters.userSearch}
                onChange={handleInputChange}
                placeholder="e.g. Susil"
                className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
              <select
                name="district"
                value={filters.district}
                onChange={handleInputChange}
                className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Species</label>
              <select
                name="species"
                value={filters.species}
                onChange={handleInputChange}
                className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
              >
                <option value="">All Species</option>
                {speciesList.map((sp) => (
                  <option key={sp._id} value={sp.name}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex-grow">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING_VERIFICATION">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2.5 border rounded-xl text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tree List Table Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600"></div>
            </div>
          ) : trees.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">No tree records match search parameters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Tree ID</th>
                    <th className="px-6 py-4">Species</th>
                    <th className="px-6 py-4">District (Area)</th>
                    <th className="px-6 py-4">Submitter</th>
                    <th className="px-6 py-4">Planting Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {trees.map((tree) => (
                    <tr key={tree._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{tree.treeId}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{tree.species}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tree.treeType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{tree.district}</div>
                        <div className="text-[10px] text-slate-400">{tree.area}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {tree.user?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">
                        {new Date(tree.plantingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-5 ${
                            tree.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tree.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {tree.status === 'VERIFIED' ? 'Verified' : tree.status === 'PENDING_VERIFICATION' ? 'Pending' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/tree/${tree._id}`}
                          className="inline-flex items-center px-2 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls bar */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTreeManagement;
