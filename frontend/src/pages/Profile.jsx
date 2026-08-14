import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Phone, MapPin, Award, Calendar, Upload, Shield, CheckCircle } from 'lucide-react';
import TreeBadge from '../components/TreeBadge';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    password: '',
  });
  const [districts, setDistricts] = useState([]);
  const [profileFile, setProfileFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        district: user.district || '',
        password: '',
      });
      if (user.profileImage) {
        setImagePreview(getImageUrl(user.profileImage));
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const list = await api.public.districts();
        setDistricts(list);
      } catch (err) {
        console.error('Failed to load districts:', err);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setSaving(true);

    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('email', formData.email);
    uploadData.append('phone', formData.phone);
    uploadData.append('district', formData.district);
    if (formData.password) {
      uploadData.append('password', formData.password);
    }
    if (profileFile) {
      uploadData.append('profileImage', profileFile);
    }

    try {
      await updateProfile(uploadData);
      setStatusMessage({ type: 'success', text: t('profile.updateSuccess') });
      // Reset password field
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('profile.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Stats & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-forest-100 bg-slate-50 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-2 rounded-full bg-forest-600 text-white cursor-pointer hover:bg-forest-700 shadow-md transition-colors">
                <Upload className="h-4 w-4" />
                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
              </label>
            </div>

            <div className="flex items-center space-x-1.5 justify-center mb-1">
              <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
              {user?.role === 'ADMIN' && (
                <span className="p-0.5 rounded-full bg-emerald-500 text-white text-[10px]" title="Administrator">
                  <Shield className="h-3.5 w-3.5 fill-current" />
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium mb-6">{user?.email}</p>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
              <div className="text-center p-3 rounded-2xl bg-slate-50">
                <span className="block text-2xl font-black text-slate-800">{user?.treesRegistered || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('profile.registered')}</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-emerald-50 text-emerald-800">
                <span className="block text-2xl font-black">{user?.verifiedTrees || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t('profile.verified')}</span>
              </div>
            </div>

            <div className="w-full pt-6">
              <TreeBadge count={user?.verifiedTrees || 0} />
            </div>
          </div>
        </div>

        {/* Right Card: Editor Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('profile.accountSettings')}</h3>

            {statusMessage.text && (
              <div className={`p-4 rounded-xl flex items-start space-x-2 mb-6 ${
                statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
              }`}>
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('profile.fullName')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('profile.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('profile.phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('profile.district')}</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500 bg-white"
                  >
                    <option value="">{t('register.selectDistrict')}</option>
                    {districts.map((d) => (
                      <option key={d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-md transition-colors cursor-pointer"
                >
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
