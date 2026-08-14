import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import TamilNaduTreeMap from '../components/TamilNaduTreeMap';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Leaf, Users, MapPin, Search, ClipboardCheck, ArrowRight, Activity } from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [mapTrees, setMapTrees] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, treeMapData, leaderboardData] = await Promise.all([
          api.public.statistics(),
          api.public.treeMap(),
          api.public.leaderboard(),
        ]);
        setStats(statsData);
        setMapTrees(treeMapData);
        // Take top 5 for preview on home
        setLeaderboard(leaderboardData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        {/* Soft blend into the white navbar above */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none"></div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-700/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-forest-700/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-forest-800/40 border border-forest-700/30 text-forest-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-soft">
            <Activity className="h-3.5 w-3.5" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            {t('home.heroTitle1')}<br />
            <span className="bg-gradient-to-r from-emerald-400 to-forest-400 bg-clip-text text-transparent">
              {t('home.heroTitle2')}
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <Link
              to="/register-tree"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-base font-bold text-forest-950 bg-gradient-to-r from-emerald-400 to-forest-400 hover:from-emerald-300 hover:to-forest-300 shadow-lg shadow-forest-950/50 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              {t('home.registerTree')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-base font-bold text-white bg-slate-800/60 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              {t('home.explorePublicMap')}
            </Link>
          </div>
        </div>
      </section>

      {/* Numerical Stats Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="p-4 text-center border-r border-slate-100 last:border-0">
            <div className="inline-flex p-2.5 rounded-2xl bg-forest-50 text-forest-600 mb-2">
              <Leaf className="h-6 w-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalTrees || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('home.statReported')}</p>
          </div>

          <div className="p-4 text-center border-r border-slate-100 last:border-0">
            <div className="inline-flex p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats?.verifiedTrees || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('home.statVerified')}</p>
          </div>

          <div className="p-4 text-center border-r border-slate-100 last:border-0 col-span-2 lg:col-span-1">
            <div className="inline-flex p-2.5 rounded-2xl bg-sky-50 text-sky-600 mb-2">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalParticipants || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('home.statParticipants')}</p>
          </div>

          <div className="p-4 text-center border-r border-slate-100 last:border-0">
            <div className="inline-flex p-2.5 rounded-2xl bg-amber-50 text-amber-600 mb-2">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalDistricts || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('home.statDistricts')}</p>
          </div>

          <div className="p-4 text-center last:border-0">
            <div className="inline-flex p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalTreeSpecies || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('home.statSpecies')}</p>
          </div>
        </div>
      </section>

      {/* Main interactive segment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map column (span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('home.mapTitle')}</h2>
              <p className="text-sm text-slate-500">{t('home.mapSubtitle')}</p>
            </div>
            <Link to="/map" className="text-sm font-semibold text-forest-600 hover:text-forest-700">
              {t('home.openFullMap')}
            </Link>
          </div>
          <div className="h-[450px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-100">
            <TamilNaduTreeMap trees={mapTrees} />
          </div>
        </div>

        {/* Leaderboard preview column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('home.topDistricts')}</h2>
              <p className="text-sm text-slate-500">{t('home.topDistrictsSubtitle')}</p>
            </div>
            <Link to="/leaderboard" className="text-sm font-semibold text-forest-600 hover:text-forest-700">
              {t('home.viewLeaderboard')}
            </Link>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-10 text-slate-400">{t('home.noVerifiedTrees')}</div>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={item.districtName} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {item.rank}
                    </span>
                    <span className="font-semibold text-slate-800">{item.districtName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-forest-700">{item.verifiedTrees}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t('home.trees')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How the platform works */}
      <section className="bg-slate-100/60 border-y border-slate-200/50 py-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">{t('home.howItWorks')}</h2>
            <p className="text-sm text-slate-500 mt-2">{t('home.howItWorksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative">
              <div className="absolute top-4 left-4 font-black text-slate-200 text-3xl">01</div>
              <div className="inline-flex p-3 bg-forest-50 text-forest-600 rounded-2xl mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{t('home.step1Title')}</h3>
              <p className="text-xs text-slate-500">{t('home.step1Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative">
              <div className="absolute top-4 left-4 font-black text-slate-200 text-3xl">02</div>
              <div className="inline-flex p-3 bg-sky-50 text-sky-600 rounded-2xl mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{t('home.step2Title')}</h3>
              <p className="text-xs text-slate-500">{t('home.step2Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative">
              <div className="absolute top-4 left-4 font-black text-slate-200 text-3xl">03</div>
              <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl mb-4">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{t('home.step3Title')}</h3>
              <p className="text-xs text-slate-500">{t('home.step3Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center relative">
              <div className="absolute top-4 left-4 font-black text-slate-200 text-3xl">04</div>
              <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{t('home.step4Title')}</h3>
              <p className="text-xs text-slate-500">{t('home.step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent verified trees list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{t('home.recentTitle')}</h2>
          <p className="text-sm text-slate-500">{t('home.recentSubtitle')}</p>
        </div>

        {stats?.recentVerifiedTrees?.length === 0 ? (
          <div className="bg-white rounded-3xl py-12 text-center border border-slate-100 text-slate-400">
            {t('home.noRecent')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {stats?.recentVerifiedTrees?.map((tree) => (
              <div key={tree._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={getImageUrl(tree.photoUrl)}
                    alt={tree.species}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[9px] font-bold">
                    VERIFIED
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{tree.species}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tree.treeId}</p>
                  </div>
                  <div className="mt-4 border-t border-slate-50 pt-2 flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold">{tree.district}</span>
                    <span>{new Date(tree.plantingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
