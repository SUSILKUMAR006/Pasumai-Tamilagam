import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Leaf, MapPin, Camera, CheckCircle, ArrowRight, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

const RegisterTree = () => {
  const [step, setStep] = useState(1);
  const [speciesList, setSpeciesList] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    species: '',
    treeType: 'Native',
    plantingDate: new Date().toISOString().split('T')[0],
    description: '',
    latitude: '',
    longitude: '',
    district: '',
    area: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const speciesData = await api.public.species();
        setSpeciesList(speciesData);

        const districtData = await api.public.districts();
        setDistricts(districtData);
      } catch (err) {
        console.error('Failed to load form metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be under 5MB');
        return;
      }
      setError('');
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getGpsLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setError('');
    setFetchingGps(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setFetchingGps(false);
      },
      (err) => {
        console.error('GPS error:', err);
        setError('Failed to retrieve exact GPS. Please enter coordinates manually.');
        setFetchingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nextStep = () => {
    setError('');
    // Validations
    if (step === 1) {
      if (!form.species || !form.treeType || !form.plantingDate) {
        setError('Please enter all required tree details');
        return;
      }
    } else if (step === 2) {
      if (!form.latitude || !form.longitude || !form.district || !form.area) {
        setError('Please enter planting location details & GPS coordinates');
        return;
      }
    } else if (step === 3) {
      if (!photo) {
        setError('A tree photograph is required');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('species', form.species);
    formData.append('treeType', form.treeType);
    formData.append('plantingDate', form.plantingDate);
    formData.append('description', form.description);
    formData.append('latitude', form.latitude);
    formData.append('longitude', form.longitude);
    formData.append('district', form.district);
    formData.append('area', form.area);
    formData.append('photo', photo);

    try {
      const res = await api.trees.register(formData);
      setSuccessInfo(res.tree);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successInfo) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Tree Registered Successfully!</h2>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Tree ID</p>
            <p className="font-mono text-2xl font-black text-forest-700">{successInfo.treeId}</p>
          </div>

          <p className="text-sm text-slate-500">
            Your tree has been submitted and is waiting for verification. You can track its approval status in your dashboard.
          </p>

          <div className="pt-4 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-md transition-colors"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => {
                setForm({
                  species: '',
                  treeType: 'Native',
                  plantingDate: new Date().toISOString().split('T')[0],
                  description: '',
                  latitude: '',
                  longitude: '',
                  district: '',
                  area: '',
                });
                setPhoto(null);
                setPhotoPreview('');
                setSuccessInfo(null);
                setStep(1);
              }}
              className="w-full py-3 px-4 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Plant Another Tree
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Step Progress indicators */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register My Planted Tree</h1>
          <p className="text-sm text-slate-500 mt-1">Help grow Tamil Nadu's green cover. Track your planting in 4 easy steps.</p>
        </div>

        {/* Wizard Steps */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold leading-5 shadow-sm border transition-all duration-300 ${
                  step === num
                    ? 'bg-forest-600 border-forest-600 text-white font-extrabold scale-110'
                    : step > num
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {num}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider hidden sm:inline">
                  {num === 1 ? 'Details' : num === 2 ? 'Location' : num === 3 ? 'Photo' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-red-700">{error}</span>
        </div>
      )}

      {/* Form content cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
        
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-forest-500" />
              <span>Step 1: Tree Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tree Species *</label>
                <select
                  name="species"
                  value={form.species}
                  onChange={handleChange}
                  required
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-forest-500"
                >
                  <option value="">Select Tree Species</option>
                  {speciesList.map((sp) => (
                    <option key={sp._id} value={sp.name}>
                      {sp.name} ({sp.tamilName})
                    </option>
                  ))}
                  <option value="Other">Other Species</option>
                </select>
              </div>

              {form.species === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Enter Species Name *</label>
                  <input
                    type="text"
                    name="customSpecies"
                    placeholder="e.g. Neem (Vembu)"
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    required
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tree Type *</label>
                <select
                  name="treeType"
                  value={form.treeType}
                  onChange={handleChange}
                  required
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-forest-500"
                >
                  <option value="Native">Native</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Shade">Shade</option>
                  <option value="Timber">Timber</option>
                  <option value="Other">Other Type</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Planting Date *</label>
                <input
                  type="date"
                  name="plantingDate"
                  value={form.plantingDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                  placeholder="Tell us about the tree health, protection fences used, or planting ceremony details..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-sky-500" />
              <span>Step 2: Planting Location</span>
            </h2>

            <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Use GPS Location</h3>
                <p className="text-xs text-slate-500">Retrieve exact coordinates from your mobile camera or GPS sensor on-site</p>
              </div>
              <button
                type="button"
                onClick={getGpsLocation}
                disabled={fetchingGps}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition-colors shrink-0 disabled:bg-slate-300"
              >
                {fetchingGps ? 'Retrieving...' : 'Fetch Current GPS'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Latitude Coordinate *</label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 13.0827"
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Longitude Coordinate *</label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 80.2707"
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">District *</label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-forest-500"
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Area / Locality *</label>
                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Saidapet, Panagal Park"
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-forest-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photo */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Camera className="h-5 w-5 text-indigo-500" />
              <span>Step 3: Tree Photograph</span>
            </h2>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-forest-400 transition-colors">
              {photoPreview ? (
                <div className="space-y-4 text-center">
                  <img src={photoPreview} alt="Tree Preview" className="h-52 w-auto object-cover rounded-xl shadow-md border" />
                  <div>
                    <label className="inline-flex justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-sm">
                      Retake Photo
                      <input type="file" onChange={handlePhotoChange} accept="image/*" capture="environment" className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-400">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Take a live photo of the planted tree</p>
                    <p className="text-xs text-slate-400 mt-1">On mobile, this opens your camera directly — gallery uploads aren't accepted to keep submissions authentic. JPG, PNG, WEBP. Size limit 5MB.</p>
                  </div>
                  <div>
                    <label className="inline-flex justify-center px-4 py-2 border border-transparent rounded-xl text-xs font-bold text-white bg-forest-600 hover:bg-forest-700 cursor-pointer shadow">
                      Open Camera
                      <input type="file" onChange={handlePhotoChange} accept="image/*" capture="environment" className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>Step 4: Review & Submit Registry</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Tree Species</span>
                  <span className="font-bold text-slate-800">{form.species}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Tree Type</span>
                  <span className="font-semibold text-slate-800">{form.treeType}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Planting Date</span>
                  <span className="font-semibold text-slate-800">{new Date(form.plantingDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Location coordinates</span>
                  <span className="font-mono text-xs text-slate-800">{form.latitude}, {form.longitude}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">District & Locality</span>
                  <span className="font-semibold text-slate-800">{form.district} ({form.area})</span>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end justify-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Selected Photo</span>
                <img src={photoPreview} alt="Ready to upload" className="h-44 w-auto object-cover rounded-xl border shadow-md" />
              </div>
            </div>
          </div>
        )}

        {/* Form controls navigation */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          ) : (
            <div></div> // empty div for layout alignment
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 shadow-md transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors cursor-pointer disabled:bg-slate-300"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Tree
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterTree;
