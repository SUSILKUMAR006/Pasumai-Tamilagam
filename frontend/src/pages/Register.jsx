import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Leaf, UserPlus, Mail, Lock, Phone, User, MapPin, AlertCircle } from 'lucide-react';
import logo from '../assets/logo2.png';
const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    district: '',
  });
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const list = await api.public.districts();
        setDistricts(list);
      } catch (err) {
        console.error('Failed to load districts list:', err);
      }
    };
    fetchDistricts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.district) {
      setError(t('register.errorSelectDistrict'));
      return;
    }

    setSubmitting(true);
    setWakingUp(false);
    // Render's free tier spins the backend down after idling; the first
    // request after that can take 30-60s+ to cold-start. Surface a hint
    // if the request is taking noticeably longer than a normal signup.
    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('register.errorDefault'));
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
            {/* <Leaf className="h-8 w-8 stroke-[2.5]" /> */}
            <img src={logo} alt="" className='h-20 w-auto object-contain' />

          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('register.createAccount')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('register.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-red-700">{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('register.fullName')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm"
                placeholder="Susil Kumar"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('register.email')}
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
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm"
                placeholder="susil@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('register.phone')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('register.district')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <select
                id="district"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-2xl text-slate-800 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm"
              >
                <option value="">{t('register.selectDistrict')}</option>
                {districts.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('register.password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 focus:outline-none disabled:bg-slate-300 transition-colors cursor-pointer"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('register.submit')}
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
          {t('register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-bold text-forest-600 hover:text-forest-700 transition-colors">
            {t('register.loginHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
