import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import TreeMarkerMap from '../../components/TreeMarkerMap';
import { Filter, Map } from 'lucide-react';

const AdminMap = () => {
  const [trees, setTrees] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    district: '',
    species: '',
    status: '',
  });

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const dists = await api.public.districts();
        setDistricts(dists);

        const specs = await api.public.species();
        setSpeciesList(specs);
      } catch (err) {
        console.error('Failed to load map filters:', err);
      }
    };
    loadMetadata();
  }, []);

  const loadAdminMapTrees = async () => {
    setLoading(true);
    try {
      // Request up to 1000 tree coordinates to show on map
      const response = await api.admin.allTrees({
        limit: 1000,
        ...filters,
      });
      setTrees(response.trees);
    } catch (err) {
      console.error('Failed to fetch admin map records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMapTrees();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({
      district: '',
      species: '',
      status: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 flex flex-col h-screen overflow-hidden">
        <div className="shrink-0 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">State Map Inspector</h1>
            <p className="text-sm text-slate-500 mt-1">Audit geographic positions of all tree plantings categorized by approval statuses</p>
          </div>
          <span className="px-3 py-1 bg-slate-200 text-slate-700 font-extrabold rounded-full text-xs">
            {trees.length} Markers Shown
          </span>
        </div>

        {/* Filter controls */}
        <div className="shrink-0 bg-white p-6 rounded-3xl border border-slate-100 shadow space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm border-b pb-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            <span>Map Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">District</label>
              <select
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
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
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Species</label>
              <select
                name="species"
                value={filters.species}
                onChange={handleFilterChange}
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

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Verification Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 border rounded-xl text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="flex-grow min-h-[350px] relative rounded-3xl overflow-hidden border shadow-inner">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
            </div>
          )}
          <TreeMarkerMap trees={trees} isAdminView={true} />
        </div>
      </main>
    </div>
  );
};

export default AdminMap;
