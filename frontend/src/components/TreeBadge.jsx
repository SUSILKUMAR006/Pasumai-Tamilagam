import React from 'react';
import { Sprout } from 'lucide-react';
import { getBadgeForCount, getNextBadge } from '../utils/badges';

// Displays the badge earned for a given verified-tree count, plus progress to the next tier
const TreeBadge = ({ count = 0 }) => {
  const badge = getBadgeForCount(count);
  const next = getNextBadge(count);
  const progressPct = next ? Math.min(100, Math.round((count / next.threshold) * 100)) : 100;

  const Icon = badge?.icon || Sprout;

  return (
    <div className={`w-full rounded-2xl border p-4 ${badge ? `${badge.bg} ${badge.border}` : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-xl bg-white shadow-sm ${badge?.color || 'text-slate-300'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className={`text-sm font-extrabold ${badge?.color || 'text-slate-400'}`}>
            {badge ? badge.name : 'No Badge Yet'}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {badge ? `Unlocked at ${badge.threshold}+ verified trees` : 'Plant 10 trees to earn your first badge'}
          </div>
        </div>
      </div>

      {next && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
            <span>{count} / {next.threshold} to {next.name}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-400 to-emerald-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeBadge;
