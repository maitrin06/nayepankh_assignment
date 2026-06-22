'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { motion } from 'framer-motion';
import { 
  Award, Clock, CheckSquare, Calendar, ChevronRight, FileText, Download, 
  MapPin, UserCheck, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

export default function VolunteerDashboard() {
  const { user, token } = useAuth();
  
  // Dashboard details state
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ success: true, message: '' });

  const API_URL = 'http://localhost:5000/api';

  const fetchDashboardData = async () => {
    try {
      if (!user?.volunteerId || !token) return;
      const res = await axios.get(`${API_URL}/volunteer/${user.volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching volunteer dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, token]);

  const handleRegisterEvent = async (eventId: string) => {
    setActionMessage({ success: true, message: '' });
    try {
      const res = await axios.post(`${API_URL}/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMessage({ success: true, message: res.data.message });
      fetchDashboardData();
    } catch (error: any) {
      setActionMessage({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to register for event.' 
      });
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    setActionMessage({ success: true, message: '' });
    try {
      const res = await axios.post(`${API_URL}/events/${eventId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMessage({ success: true, message: res.data.message });
      fetchDashboardData();
    } catch (error: any) {
      setActionMessage({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to cancel event registration.' 
      });
    }
  };

  const handleDownloadCertificate = async (certId: string, eventName: string) => {
    try {
      const response = await axios.get(`${API_URL}/reports/certificate/${certId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const cleanName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `certificate_${cleanName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate:', error);
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

  if (!profile) {
    return (
      <DashboardShell>
        <div className="p-8 text-center bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile Missing</h2>
          <p className="text-sm text-slate-400">Could not find details for this volunteer profile.</p>
        </div>
      </DashboardShell>
    );
  }

  // Calculate stats
  const completedTasks = profile.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
  const pendingTasks = profile.tasks?.filter((t: any) => t.status !== 'Completed').length || 0;
  const registeredEvents = profile.events || [];
  const hoursCompleted = profile.hoursCompleted || 0;

  // Determine achievement badges
  const badges = [
    { 
      name: 'Community Novice', 
      desc: 'Registered and ready to serve', 
      unlocked: true,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      name: 'Top Volunteer', 
      desc: 'Completed 20+ hours of service', 
      unlocked: hoursCompleted >= 20,
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      name: '50 Hours Badge', 
      desc: 'Completed 50+ hours of service', 
      unlocked: hoursCompleted >= 50,
      color: 'from-amber-500 to-orange-500'
    },
    { 
      name: 'Community Hero', 
      desc: 'Unlocked after major contributions', 
      unlocked: hoursCompleted >= 50,
      color: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 rounded-3xl border border-amber-500/10 relative overflow-hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-slate-900 dark:text-slate-50">
              Welcome, {profile.user.name}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {profile.status === 'approved' 
                ? 'Your volunteer application is approved. Go ahead and join social activities!'
                : 'Your profile application is currently pending admin review.'
              }
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <UserCheck className={`h-4 w-4 ${profile.status === 'approved' ? 'text-green-500' : 'text-amber-500'}`} />
            <span className="capitalize">Status: {profile.status}</span>
          </div>
        </div>

        {/* Global Action Messages alert */}
        {actionMessage.message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            actionMessage.success 
              ? 'bg-green-500/5 border-green-500/20 text-green-500' 
              : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
          }`}>
            <span>{actionMessage.message}</span>
          </div>
        )}

        {/* KPI Stats Block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Earned</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{hoursCompleted} hours</h3>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Complete</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{completedTasks} completed</h3>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined Events</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{registeredEvents.length} events</h3>
            </div>
          </div>
        </div>

        {/* Badges and certificates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Achievements Badges */}
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span>Achievement Badges</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                    badge.unlocked 
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-100 scale-100' 
                      : 'border-slate-100 dark:border-slate-900 bg-slate-100/30 dark:bg-slate-950/20 opacity-40'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-r ${badge.color} mb-3 shadow-md`}>
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold mb-1">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic certificates */}
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span>Participation Certificates</span>
            </h3>

            {profile.certificates?.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Join events and check-in via QR Code to auto-generate certificates.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {profile.certificates?.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="overflow-hidden mr-2">
                      <h4 className="text-xs font-bold truncate">{c.eventName}</h4>
                      <p className="text-[10px] text-slate-400">Hours: {c.hoursCompleted} • Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
                    </div>

                    <button 
                      onClick={() => handleDownloadCertificate(c.id, c.eventName)}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Registered Events list */}
        <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Your Registered Events</h3>

          {registeredEvents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              You haven't signed up for any events yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Event Name</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {registeredEvents.map((ev: any) => (
                    <tr key={ev.id} className="text-slate-600 dark:text-slate-300">
                      <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">{ev.title}</td>
                      <td className="py-4">
                        {new Date(ev.date).toLocaleDateString()}<br />
                        <span className="text-[10px] text-slate-400">{ev.time}</span>
                      </td>
                      <td className="py-4 max-w-xs truncate">{ev.location}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleCancelRegistration(ev.id)}
                          className="px-3 py-1.5 border border-rose-200 dark:border-rose-800/50 text-rose-500 hover:bg-rose-500/5 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
