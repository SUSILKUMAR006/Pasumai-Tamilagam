import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Leaf, Clock, CheckCircle, XCircle, Users, MapPin, Search } from 'lucide-react';

// Register ChartJS modules globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await api.admin.dashboard();
        setData(dashboardStats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  const { summary, charts } = data || {};

  // 1. Chart configurations: Trees by District
  const districtChartData = {
    labels: charts?.treesByDistrict?.map((d) => d._id || 'Unknown') || [],
    datasets: [
      {
        label: 'Trees Registered',
        data: charts?.treesByDistrict?.map((d) => d.count) || [],
        backgroundColor: 'rgba(56, 181, 102, 0.75)',
        borderColor: 'rgba(56, 181, 102, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // 2. Chart configurations: Monthly registration
  const monthlyChartData = {
    labels: charts?.treesByMonth?.map((m) => `${m._id.month}/${m._id.year}`) || [],
    datasets: [
      {
        label: 'Trees Planted',
        data: charts?.treesByMonth?.map((m) => m.count) || [],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.35,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  // 3. Chart configurations: Verification distribution
  const verificationChartData = {
    labels: ['Verified', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [summary?.verifiedTrees, summary?.pendingVerification, summary?.rejectedTrees],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(245, 158, 11, 0.8)', // Yellow
          'rgba(239, 68, 68, 0.8)',  // Red
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Review state-wide summaries, system stats, and validation distributions</p>
        </div>

        {/* Dashboard numerical blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-800">{summary?.totalTrees || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-amber-600">{summary?.pendingVerification || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-emerald-600">{summary?.verifiedTrees || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Trees</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-800">{summary?.totalUsers || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            </div>
          </div>

        </div>

        {/* Charts Segment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Verification Doughnut */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 mb-6 text-left w-full border-b pb-2">Verification Distribution</h3>
            <div className="w-52 h-52 flex items-center justify-center">
              <Doughnut
                data={verificationChartData}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                }}
              />
            </div>
            <div className="w-full mt-6 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>Verified</span>
                <span>{summary?.verifiedTrees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>Pending Review</span>
                <span>{summary?.pendingVerification}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>Rejected</span>
                <span>{summary?.rejectedTrees}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Line graph of monthly registry */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Monthly Planting Registrations</h3>
            <div className="h-64">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* District bar chart (Spans all columns) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Top Districts by Tree Registry</h3>
            <div className="h-72">
              <Bar
                data={districtChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
