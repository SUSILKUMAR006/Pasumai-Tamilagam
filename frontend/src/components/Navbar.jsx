import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Menu, X, User as UserIcon, LogOut, LayoutDashboard, PlusCircle, Map, Trophy, Languages } from 'lucide-react';
import logo from '../assets/logo2.png';
import { getImageUrl } from '../utils/imageUrl';
const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'border-forest-500 text-forest-600 font-semibold'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
    }`;

  const mobileNavLinkClass = (path) =>
    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
      isActive(path)
        ? 'bg-forest-50 border-forest-500 text-forest-700 font-semibold'
        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
    }`;

  const LanguageToggle = ({ className = '' }) => (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors ${className}`}
      title={language === 'en' ? 'தமிழில் காண்க' : 'View in English'}
    >
      <Languages className="h-3.5 w-3.5 text-forest-600" />
      <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
    </button>
  );

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand Section */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 text-forest-700">
            {/* <Leaf className="h-7 w-7 text-forest-500 stroke-[2.5]" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-forest-700 to-emerald-600 bg-clip-text text-transparent">
                Pasumai Kappom
              </span> */}
              <img src={logo} alt="" className='h-16 w-auto object-contain'/>
            </Link>
            {/* Desktop Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link to="/" className={navLinkClass('/')}>{t('nav.home')}</Link>
              <Link to="/map" className={navLinkClass('/map')}>{t('nav.treeMap')}</Link>
              <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>{t('nav.leaderboard')}</Link>

              {isAuthenticated && !isAdmin && (
                <>
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>{t('nav.dashboard')}</Link>
                  <Link to="/register-tree" className={navLinkClass('/register-tree')}>
                    <PlusCircle className="h-4 w-4 mr-1 text-forest-500" />
                    {t('nav.plantTree')}
                  </Link>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-1 text-emerald-500" />
                  {t('nav.adminConsole')}
                </Link>
              )}
            </div>
          </div>

          {/* User Profile / Auth buttons */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <LanguageToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 group">
                  {user?.profileImage ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-forest-300 group-hover:border-forest-500 transition-colors"
                      src={getImageUrl(user.profileImage)}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center border border-forest-200 group-hover:border-forest-300">
                      <UserIcon className="h-4 w-4 text-forest-600" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-forest-600 transition-colors">
                    {user?.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm focus:outline-none transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-forest-600 transition-colors px-3 py-2"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-forest-600 hover:bg-forest-700 shadow-sm transition-all duration-150 active:scale-[0.98]"
                >
                  {t('nav.registerTree')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 sm:hidden">
            <LanguageToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="sm:hidden bg-white/95 border-b border-slate-100">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/')}>{t('nav.home')}</Link>
            <Link to="/map" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/map')}>{t('nav.treeMap')}</Link>
            <Link to="/leaderboard" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/leaderboard')}>{t('nav.leaderboard')}</Link>

            {isAuthenticated && !isAdmin && (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/dashboard')}>{t('nav.dashboard')}</Link>
                <Link to="/register-tree" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/register-tree')}>{t('nav.plantTree')}</Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/admin/dashboard')}>{t('nav.adminConsole')}</Link>
            )}
          </div>

          <div className="pt-4 pb-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center space-x-3">
                  {user?.profileImage ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={getImageUrl(user.profileImage)}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-forest-600" />
                    </div>
                  )}
                  <div>
                    <div className="text-base font-semibold text-slate-800">{user?.name}</div>
                    <div className="text-sm font-medium text-slate-500">{user?.email}</div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white"
                  >
                    {t('nav.viewProfile')}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-forest-600"
                >
                  {t('nav.registerTree')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
