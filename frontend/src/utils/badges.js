import { Sprout, Award, Medal, ShieldCheck, Trophy, Crown } from 'lucide-react';

export const BADGE_TIERS = [
  { threshold: 10, name: 'Sapling Starter', icon: Sprout, color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-200' },
  { threshold: 25, name: 'Grove Builder', icon: Award, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  { threshold: 50, name: 'Forest Guardian', icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { threshold: 100, name: 'Green Champion', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { threshold: 200, name: 'Eco Warrior', icon: Trophy, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  { threshold: 500, name: 'Tree Mission Legend', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

// Highest tier the count qualifies for, or null if under the first threshold
export const getBadgeForCount = (count = 0) => {
  let earned = null;
  for (const tier of BADGE_TIERS) {
    if (count >= tier.threshold) earned = tier;
  }
  return earned;
};

// Next tier still to unlock, or null if all tiers are earned
export const getNextBadge = (count = 0) =>
  BADGE_TIERS.find((tier) => count < tier.threshold) || null;
