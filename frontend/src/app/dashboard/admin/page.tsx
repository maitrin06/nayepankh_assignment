'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  Users, CheckCircle2, AlertCircle, Calendar, Clock, ArrowRight, ShieldAlert,
  Settings, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import axios from 'axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const { token } = useAuth();
  
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      if (!token) return;
      
      const [volRes, evRes, logRes] = await Promise.all([
        axios.get(`${API_URL}/volunteers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/events`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/activity-logs`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setVolunteers(volRes.data);
      setEvents(evRes.data);
      setLogs(logRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  // Calculate metrics
  const totalVolunteers = volunteers.length;
  const approvedVolunteers = volunteers.filter(v => v.status === 'approved').length;
  const pendingVolunteers = volunteers.filter(v => v.status === 'pending').length;
  const totalEvents = events.length;
  const totalHours = volunteers.reduce((acc, curr) => acc + curr.hoursCompleted, 0);

  // Chart 1: Registration growth (mock database months)
  const growthData = [
    { name: 'Jan', volunteers: 2 },
    { name: 'Feb', volunteers: 5 },
    { name: 'Mar', volunteers: 12 },
    { name: 'Apr', volunteers: 20 },
    { name: 'May', volunteers: 35 },
    { name: 'Jun', volunteers: totalVolunteers },
  ];

  // Chart 2: Skill distribution
  const skillCounts: any = {};
  volunteers.forEach(v => {
    if (v.skills) {
      v.skills.split(',').forEach((s: string) => {
        const trimmed = s.trim();
        if (trimmed) {
          skillCounts[trimmed] = (skillCounts[trimmed] || 0) + 1;
        }
      });
    }
  });

  const skillData = Object.keys(skillCounts).map(key => ({
    name: key,
    count: skillCounts[key]
  })).slice(0, 5); // Limit to top 5

  // Default skills fallback if empty
  if (skillData.length === 0) {
    skillData.push(
      { name: 'First Aid', count: 4 },
      { name: 'Teaching', count: 3 },
      { name: 'Logistics', count: 5 },
      { name: 'Coding', count: 2 },
      { name: 'Coordination', count: 6 }
    );
  }

  // Chart 3: Gender breakdown
  const genderCounts: any = { Male: 0, Female: 0, Other: 0 };
  volunteers.forEach(v => {
    if (v.gender) {
      genderCounts[v.gender] = (genderCounts[v.gender] || 0) + 1;
    }
  });

  const genderData = [
    { name: 'Male', value: genderCounts.Male || 2 },
    { name: 'Female', value: genderCounts.Female || 1 },
    { name: 'Other', value: genderCounts.Other || 0 }
  ];

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  return (
    <DashboardShell>
      <div className="space-y-8">
        
        {/* Header Title block */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">Admin dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track registration analytics, approve campaigns, and monitor audit trails.</p>
          </div>

          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync Data</span>
          </button>
        </div>

        {/* Dash Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="p-5 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Volunteers</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{totalVolunteers}</h3>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Approved</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{approvedVolunteers}</h3>
            </div>
          </div>

          <Link href="/volunteers?filter=pending" className="p-5 bg-white dark:bg-[#0d1321] hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition-all rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{pendingVolunteers}</h3>
            </div>
          </Link>

          <div className="p-5 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{totalEvents}</h3>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impact Hours</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{totalHours} hrs</h3>
            </div>
          </div>

        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Growth & Registration trend (LineChart) */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold mb-4">Registration growth trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Line type="monotone" dataKey="volunteers" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender Distribution (PieChart) */}
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold mb-4">Gender distribution</h3>
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs mt-4">
                {genderData.map((d, index) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-slate-400">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Skill Distribution (BarChart) */}
          <div className="lg:col-span-1 p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold mb-4">Top volunteer skills</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Audit log trails */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold mb-4">System activity logs</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No activity logs recorded.
                </div>
              ) : (
                logs.map((log) => {
                  const logTime = new Date(log.timestamp).toLocaleTimeString();
                  const logDate = new Date(log.timestamp).toLocaleDateString();
                  return (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-amber-500 mr-2">{logTime}</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {log.action} → {log.details}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {logDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
