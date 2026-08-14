import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { BarChart3, TrendingUp, HelpCircle, AlertCircle, CheckCircle, PieChart } from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.admin.analytics();
        setAnalytics(res);
      } catch (err) {
        console.error('Failed to load analytics dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  const { verificationRates, districtAnalytics, speciesAnalytics, monthlyAnalytics } = analytics || {};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Console Page container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">State Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Review validation percentages, district-wise trends, and species distributions</p>
        </div>

        {/* Verification rates blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
          <div className="md:col-span-4 border-b pb-2 mb-2 font-bold text-slate-800 text-sm flex items-center space-x-1.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Verification Status Ratios</span>
          </div>

          <div className="text-center p-4 bg-emerald-50 text-emerald-800 rounded-2xl">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
            <span className="block text-2xl font-black">{verificationRates?.verifiedPercent}%</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved Rate</span>
          </div>

          <div className="text-center p-4 bg-amber-50 text-amber-800 rounded-2xl">
            <HelpCircle className="h-6 w-6 mx-auto mb-2 text-amber-600" />
            <span className="block text-2xl font-black">{verificationRates?.pendingPercent}%</span>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Rate</span>
          </div>

          <div className="text-center p-4 bg-rose-50 text-rose-800 rounded-2xl">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <span className="block text-2xl font-black">{verificationRates?.rejectedPercent}%</span>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rejection Rate</span>
          </div>

          <div className="text-center p-4 bg-slate-50 text-slate-800 rounded-2xl flex flex-col justify-center">
            <span className="block text-3xl font-black text-slate-900">{verificationRates?.total}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
          </div>
        </div>

        {/* Analytics tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* District breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Tree Counts by District</h3>
            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-slate-50 pr-2">
              {districtAnalytics?.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No district registry data available.</div>
              ) : (
                districtAnalytics?.map((dist) => (
                  <div key={dist._id} className="flex justify-between items-center py-2.5">
                    <span className="font-bold text-slate-700 text-xs">{dist._id || 'Unknown'}</span>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="block font-black text-slate-800 text-xs">{dist.count} total</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{dist.verified} verified</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Species breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Popularity by Tree Species</h3>
            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-slate-50 pr-2">
              {speciesAnalytics?.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No species registry data available.</div>
              ) : (
                speciesAnalytics?.map((sp) => (
                  <div key={sp._id} className="flex justify-between items-center py-2.5">
                    <span className="font-bold text-slate-700 text-xs">{sp._id}</span>
                    <div className="text-right">
                      <span className="block font-black text-slate-800 text-xs">{sp.count} planted</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{sp.verified} verified</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly progression timeline (Spans 2 columns) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md md:col-span-2 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Planting Timeline (Last 12 Months)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Month / Year</th>
                    <th className="px-6 py-3 text-center">Trees Submitted</th>
                    <th className="px-6 py-3 text-center">Trees Verified</th>
                    <th className="px-6 py-3 text-center">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {monthlyAnalytics?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400">No monthly data logged.</td>
                    </tr>
                  ) : (
                    monthlyAnalytics?.map((m) => {
                      const rate = m.total > 0 ? ((m.verified / m.total) * 100).toFixed(0) : 0;
                      return (
                        <tr key={`${m._id.month}-${m._id.year}`} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-semibold">{m._id.month} / {m._id.year}</td>
                          <td className="px-6 py-3 text-center font-bold">{m.total}</td>
                          <td className="px-6 py-3 text-center font-bold text-emerald-600">{m.verified}</td>
                          <td className="px-6 py-3 text-center font-black text-slate-800">{rate}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
