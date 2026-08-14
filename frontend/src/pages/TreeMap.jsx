import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TreeMarkerMap from '../components/TreeMarkerMap';
import { useLanguage } from '../context/LanguageContext';
import { Filter, Calendar, MapPin, Search } from 'lucide-react';

const TreeMap = () => {
  const { t } = useLanguage();
  const [trees, setTrees] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    district: '',
    species: '',
    treeType: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const list = await api.public.districts();
        setDistricts(list);

        const specList = await api.public.species();
        setSpeciesList(specList);
      } catch (err) {
        console.error('Failed to load map filters metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  const loadMapTrees = async () => {
    setLoading(true);
    try {
      const filteredTrees = await api.public.treeMap(filters);
      setTrees(filteredTrees);
    } catch (err) {
      console.error('Failed to load map tree markers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapTrees();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      district: '',
      species: '',
      treeType: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 flex flex-col">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('treeMap.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('treeMap.subtitle')}</p>
      </div>

      {/* Filters Segment */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg space-y-4 shrink-0">
        <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm border-b pb-2">
          <Filter className="h-4 w-4 text-forest-500" />
          <span>{t('treeMap.filters')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* District Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('treeMap.district')}</label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-forest-500"
            >
              <option value="">{t('treeMap.allDistricts')}</option>
              {districts.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Species Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('treeMap.species')}</label>
            <select
              name="species"
              value={filters.species}
              onChange={handleFilterChange}
              className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-forest-500"
            >
              <option value="">{t('treeMap.allSpecies')}</option>
              {speciesList.map((sp) => (
                <option key={sp._id} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tree Type Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('treeMap.treeType')}</label>
            <select
              name="treeType"
              value={filters.treeType}
              onChange={handleFilterChange}
              className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-forest-500"
            >
              <option value="">{t('treeMap.allTypes')}</option>
              <option value="Native">Native</option>
              <option value="Fruit">Fruit</option>
              <option value="Shade">Shade</option>
              <option value="Timber">Timber</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('treeMap.fromDate')}</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="block w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* End Date */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex-grow">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('treeMap.toDate')}</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-forest-500"
              />
            </div>
            <button
              onClick={handleResetFilters}
              type="button"
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 bg-white shadow-sm transition-colors"
            >
              {t('treeMap.reset')}
            </button>
          </div>
        </div>
      </div>

      {/* Map display */}
      <div className="flex-1 min-h-[450px] relative rounded-3xl overflow-hidden shadow-xl border border-slate-100">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
          </div>
        )}
        <TreeMarkerMap trees={trees} />
      </div>
    </div>
  );
};

export default TreeMap;
