import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';
const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setWakingUp(false);
    // Render's free tier spins the backend down after idling; the first
    // request after that can take 30-60s+ to cold-start. Surface a hint
    // if the request is taking noticeably longer than a normal login.
    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || t('login.errorDefault'));
    } finally {
      clearTimeout(wakeTimer);
      setSubmitting(false);
      setWakingUp(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center">
          <div className="inline-flex p-3 rounded-2xl  text-forest-600 mb-4">
            <img src={logo} alt="" className='h-20 w-auto object-contain' />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('login.welcomeBack')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('login.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-red-700">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm transition-colors"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  {t('login.password')}
                </label>
                <Link to="#" className="text-xs font-semibold text-forest-600 hover:text-forest-700">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 focus:outline-none disabled:bg-slate-300 transition-colors cursor-pointer"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('login.signIn')}
                </>
              )}
            </button>
            {wakingUp && (
              <p className="mt-3 text-center text-xs font-semibold text-amber-600">
                {t('login.wakingUp')}
              </p>
            )}
          </div>
        </form>

        <div className="text-center text-sm text-slate-500">
          {t('login.newToPlatform')}{' '}
          <Link to="/register" className="font-bold text-forest-600 hover:text-forest-700 transition-colors">
            {t('login.registerHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
