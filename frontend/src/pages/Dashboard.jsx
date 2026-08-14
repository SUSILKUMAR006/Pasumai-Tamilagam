import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Leaf, Eye, CheckCircle, Clock, XCircle, PlusCircle, Calendar, MapPin } from 'lucide-react';
import TreeBadge from '../components/TreeBadge';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchMyTrees = async () => {
      try {
        const data = await api.trees.myTrees();
        setTrees(data);

        // Calculate statistics locally from the fetched trees list
        const total = data.length;
        const verified = data.filter((t) => t.status === 'VERIFIED').length;
        const pending = data.filter((t) => t.status === 'PENDING_VERIFICATION').length;
        const rejected = data.filter((t) => t.status === 'REJECTED').length;

        setStats({ total, verified, pending, rejected });
      } catch (err) {
        console.error('Failed to load my trees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTrees();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard title header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Link
          to="/register-tree"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow transition-colors active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('dashboard.plantNewTree')}
        </Link>
      </div>

      {/* Badge progress */}
      <TreeBadge count={stats.verified} />

      {/* Grid of micro-stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-800">{stats.total}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.totalRegistered')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-emerald-600">{stats.verified}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.verifiedTrees')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-amber-600">{stats.pending}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.pendingReview')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-rose-600">{stats.rejected}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.rejectedSubmissions')}</span>
          </div>
        </div>
      </div>

      {/* Main registered trees list table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-800">{t('dashboard.inventoryTitle')}</h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
            {trees.length} {t('dashboard.records')}
          </span>
        </div>

        {trees.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300">
              <Leaf className="h-10 w-10" />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="font-bold text-slate-700 text-sm">{t('dashboard.noTreesTitle')}</h3>
              <p className="text-xs text-slate-400 mt-1">{t('dashboard.noTreesDesc')}</p>
            </div>
            <div>
              <Link
                to="/register-tree"
                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-forest-600 hover:bg-forest-700 shadow"
              >
                {t('dashboard.registerFirstTree')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('dashboard.colTreeId')}</th>
                  <th className="px-6 py-4">{t('dashboard.colSpecies')}</th>
                  <th className="px-6 py-4">{t('dashboard.colDistrict')}</th>
                  <th className="px-6 py-4">{t('dashboard.colDate')}</th>
                  <th className="px-6 py-4">{t('dashboard.colStatus')}</th>
                  <th className="px-6 py-4 text-center">{t('dashboard.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {trees.map((tree) => (
                  <tr key={tree._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      {tree.treeId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{tree.species}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tree.treeType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{tree.district}</span>
                        <span className="text-slate-400">({tree.area})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(tree.plantingDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-5 ${
                          tree.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tree.status === 'PENDING_VERIFICATION'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tree.status === 'VERIFIED'
                          ? t('dashboard.statusVerified')
                          : tree.status === 'PENDING_VERIFICATION'
                          ? t('dashboard.statusPending')
                          : t('dashboard.statusRejected')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/tree/${tree._id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {t('dashboard.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
