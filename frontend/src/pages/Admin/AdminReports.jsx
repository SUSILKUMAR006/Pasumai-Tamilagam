import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { FileSpreadsheet, Download, Filter, HelpCircle } from 'lucide-react';

const AdminReports = () => {
  const [districts, setDistricts] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    district: '',
    species: '',
    status: '',
    reportType: 'General',
  });

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const dists = await api.public.districts();
        setDistricts(dests);

        const specs = await api.public.species();
        setSpeciesList(specs);
      } catch (err) {
        console.error('Failed to load metadata for reports:', err);
      }
    };
    loadMetadata();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const csvText = await api.admin.getReportCsv(filters);
      
      // Create a Blob from the CSV text and trigger client-side download
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `TN_Tree_Mission_Report_${filters.reportType}_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download report:', err);
      alert(err.message || 'Failed to generate report file');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">System Reports Export</h1>
          <p className="text-sm text-slate-500 mt-1">Configure filtering parameters and generate downloadable CSV files of registered tree databases</p>
        </div>

        {/* Generate Report Workspace */}
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-slate-800 font-bold border-b pb-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <span>Generate CSV Report</span>
          </div>

          <div className="space-y-4">
            {/* Report Type selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Category *</label>
              <select
                name="reportType"
                value={filters.reportType}
                onChange={handleInputChange}
                className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest-500"
              >
                <option value="General">General Tree Submissions Report</option>
                <option value="Monthly">Monthly Planting Progression Report</option>
                <option value="DistrictWise">District-wise Planting Summary</option>
                <option value="SpeciesWise">Tree Species Diversity Summary</option>
                <option value="Verification">Verification & Review Decision Logs</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">District</label>
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
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Species</label>
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

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Status</label>
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
            </div>

            <div className="bg-slate-50 border p-4 rounded-2xl flex items-start space-x-2 text-xs text-slate-500 pt-3">
              <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span>CSV downloads include user details (name, email, phone), exact planting dates, geographic coordinates, and approval logs. These reports are compatible with Excel and Google Sheets.</span>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={generating}
                className="inline-flex items-center px-5 py-3 border border-transparent rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-md disabled:bg-slate-300 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {generating ? 'Exporting report CSV...' : 'Generate & Download CSV'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
