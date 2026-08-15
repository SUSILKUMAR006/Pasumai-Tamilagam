import React from 'react';
import { Leaf } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <Leaf className="h-6 w-6 text-forest-400" />
              <span>Pasumai Kappom</span>
            </div>
            <p className="text-sm text-slate-400">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-forest-400 transition-colors">{t('footer.home')}</a></li>
              <li><a href="/map" className="hover:text-forest-400 transition-colors">{t('footer.publicMap')}</a></li>
              <li><a href="/leaderboard" className="hover:text-forest-400 transition-colors">{t('footer.leaderboard')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.forests.tn.gov.in/" target="_blank" rel="noreferrer" className="hover:text-forest-400 transition-colors">{t('footer.forestDept')}</a></li>
              <li><a href="#" className="hover:text-forest-400 transition-colors">{t('footer.plantingGuidelines')}</a></li>
              <li><a href="#" className="hover:text-forest-400 transition-colors">{t('footer.speciesCatalog')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">{t('footer.stateContact')}</h3>
            <p className="text-sm text-slate-400">
              Tamil Nadu State Forest Department,<br />
              Panagal Building, Saidapet,<br />
              Chennai - 600 015.<br />
              Email: info@treemission.tn.gov.in
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Pasumai Kappom. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
