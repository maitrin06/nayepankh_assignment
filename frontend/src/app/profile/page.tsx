'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  User, Mail, Phone, MapPin, Award, BookOpen, Clock, Heart, 
  Save, CheckCircle2, ShieldAlert
} from 'lucide-react';
import axios from 'axios';

export default function ProfilePage() {
  const { user, token, updateProfile } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ success: true, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    age: '',
    gender: 'Male',
    address: '',
    occupation: '',
    skills: '',
    interests: '',
    availability: '',
    location: '',
    resumeUrl: ''
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !token) return;
        
        const res = await axios.get(`${API_URL}/volunteer/${user.volunteerId || user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data;
        setProfile(data);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          profileImage: data.user.profileImage || '',
          age: data.age ? String(data.age) : '',
          gender: data.gender || 'Male',
          address: data.address || '',
          occupation: data.occupation || '',
          skills: data.skills || '',
          interests: data.interests || '',
          availability: data.availability || '',
          location: data.location || '',
          resumeUrl: data.resumeUrl || ''
        });
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ success: true, message: '' });
    setIsSaving(true);
    
    const res = await updateProfile(formData);
    setIsSaving(false);
    if (res.success) {
      setSaveStatus({ success: true, message: 'Profile details saved successfully!' });
    } else {
      setSaveStatus({ success: false, message: res.error || 'Failed to save changes.' });
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Profile configurations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Modify your personal parameters, skills roster, location filters, and credentials.</p>
        </div>

        {/* Global Save Messages */}
        {saveStatus.message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            saveStatus.success 
              ? 'bg-green-500/5 border-green-500/20 text-green-500' 
              : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
          }`}>
            <span>{saveStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Profile Picture and info summary */}
          <div className="lg:col-span-1 p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4">
            <img 
              src={formData.profileImage || "https://api.dicebear.com/7.x/bottts/svg?seed=Avatar"} 
              alt={formData.name}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-amber-500/30"
            />

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{formData.name}</h3>
              <span className="text-xs text-slate-400 block">{profile?.user?.email}</span>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
              <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase">Choose Avatar</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Rahul', 'Priya', 'Amit', 'Karan', 'Nisha', 'Sanjay'
                ].map((name) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
                  const isSelected = formData.profileImage === url;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, profileImage: url })}
                      className={`relative p-1 rounded-lg border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <img src={url} alt={name} className="h-8 w-8 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Detailed Forms */}
          <div className="lg:col-span-2 p-6 md:p-8 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Personal parameters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Personal Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Residential Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs h-16 resize-none"
                />
              </div>
            </div>

            {/* Professional parameters */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Professional Info</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Occupation</label>
                  <input 
                    type="text" 
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Skills (commas)</label>
                  <input 
                    type="text" 
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Preferences parameters */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Volunteer Preferences & Uploads</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Interests / Focus Area (commas)</label>
                  <input 
                    type="text" 
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Availability Schedule</label>
                  <input 
                    type="text" 
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Preferred Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Resume Document URL</label>
                  <input 
                    type="text" 
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </div>

        </form>
      </div>
    </DashboardShell>
  );
}
