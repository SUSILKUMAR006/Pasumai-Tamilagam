import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Leaf, MapPin, Award } from 'lucide-react';

const Leaderboard = () => {
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.public.leaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load district leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  // Split into Top 3 and others
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-500 animate-pulse-soft">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('leaderboard.title')}</h1>
        <p className="text-sm text-slate-500">
          {t('leaderboard.subtitle')}
        </p>
      </div>

      {/* Top 3 podium styling */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-3xl mx-auto">
          {/* Rank 2 (left) */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg text-center md:h-52 flex flex-col justify-center space-y-4">
              <div className="flex justify-center">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-800 font-extrabold text-sm border-2 border-white shadow">2</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{topThree[1].districtName}</h3>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('leaderboard.secondPlace')}</div>
              </div>
              <div className="flex justify-center items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-800">{topThree[1].verifiedTrees}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('leaderboard.trees')}</span>
              </div>
            </div>
          )}

          {/* Rank 1 (center - higher) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white p-8 rounded-3xl border-2 border-amber-300 shadow-xl text-center md:h-64 flex flex-col justify-center space-y-4 relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <Trophy className="h-10 w-10 text-amber-500 fill-amber-300 drop-shadow" />
              </div>
              <div className="flex justify-center pt-2">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 text-white font-extrabold text-lg border-2 border-white shadow-md">1</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">{topThree[0].districtName}</h3>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">{t('leaderboard.stateChampion')}</div>
              </div>
              <div className="flex justify-center items-baseline space-x-1">
                <span className="text-3xl font-black text-amber-600">{topThree[0].verifiedTrees}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('leaderboard.trees')}</span>
              </div>
            </div>
          )}

          {/* Rank 3 (right) */}
          {topThree[2] && (
            <div className="order-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg text-center md:h-48 flex flex-col justify-center space-y-4">
              <div className="flex justify-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs border-2 border-white shadow">3</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{topThree[2].districtName}</h3>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('leaderboard.thirdPlace')}</div>
              </div>
              <div className="flex justify-center items-baseline space-x-1">
                <span className="text-xl font-black text-slate-800">{topThree[2].verifiedTrees}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('leaderboard.trees')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remaining list table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-3xl mx-auto">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">
          {t('leaderboard.rankingList')}
        </div>
        <div className="divide-y divide-slate-50">
          {remaining.length === 0 && topThree.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">{t('leaderboard.noStats')}</div>
          ) : (
            remaining.map((item) => (
              <div key={item.districtName} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-xs font-bold text-slate-400 w-6 text-center">
                    {item.rank}
                  </span>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{item.districtName}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-800 text-sm">{item.verifiedTrees}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('leaderboard.verified')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
