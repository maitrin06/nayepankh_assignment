'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  Search, Filter, Check, X, Edit2, Trash2, Mail, Phone, MapPin, 
  ChevronRight, Award, GraduationCap, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function VolunteerManagement() {
  const { token } = useAuth();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Editing modal state
  const [selectedVol, setSelectedVol] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    location: '',
    skills: '',
    interests: '',
    availability: '',
    hoursCompleted: 0
  });

  const API_URL = 'http://localhost:5000/api';

  const fetchVolunteers = async () => {
    try {
      if (!token) return;
      setLoading(true);
      
      // Build query string
      let query = '?';
      if (searchTerm) query += `search=${searchTerm}&`;
      if (statusFilter) query += `status=${statusFilter}&`;
      if (skillFilter) query += `skills=${skillFilter}&`;
      if (locationFilter) query += `location=${locationFilter}&`;

      const res = await axios.get(`${API_URL}/volunteers${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(res.data);
    } catch (err) {
      console.error('Error fetching volunteers list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [token, searchTerm, statusFilter, skillFilter, locationFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/volunteer/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVolunteers();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this volunteer? This action is permanent.')) return;
    try {
      await axios.delete(`${API_URL}/volunteer/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVolunteers();
    } catch (err) {
      console.error('Error deleting volunteer:', err);
    }
  };

  const openEditModal = (vol: any) => {
    setSelectedVol(vol);
    setEditFormData({
      name: vol.user.name,
      phone: vol.user.phone || '',
      age: vol.age ? String(vol.age) : '',
      gender: vol.gender || 'Male',
      location: vol.location || '',
      skills: vol.skills || '',
      interests: vol.interests || '',
      availability: vol.availability || '',
      hoursCompleted: vol.hoursCompleted || 0
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/volunteer/${selectedVol.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchVolunteers();
    } catch (err) {
      console.error('Error saving edits:', err);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Volunteer directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review pending registrations, coordinate assignments, and modify schedules.</p>
        </div>

        {/* Search & Filter tools */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
            />
          </div>

          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Filter by Skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
            />
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Filter by Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
            />
          </div>

        </div>

        {/* Directory table */}
        <div className="bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No volunteers matched the query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-900/10">
                    <th className="p-4">Volunteer</th>
                    <th className="p-4">Preferences & location</th>
                    <th className="p-4">Skills & Hours</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={vol.user.profileImage || "https://api.dicebear.com/7.x/bottts/svg?seed=Avatar"}
                            alt={vol.user.name}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{vol.user.name}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {vol.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="flex items-center gap-1 text-[11px] mb-1 font-medium text-slate-700 dark:text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-400" /> {vol.location || 'N/A'}
                        </span>
                        <span className="block text-[10px] text-slate-400">Avail: {vol.availability}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs mb-1">
                          {vol.skills ? vol.skills.split(',').map((s: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px]">
                              {s.trim()}
                            </span>
                          )) : <span className="text-slate-400 italic">None</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{vol.hoursCompleted} hours completed</span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          vol.status === 'approved' 
                            ? 'bg-green-500/10 text-green-500' 
                            : vol.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {vol.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {vol.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(vol.id, 'approved')}
                                title="Approve"
                                className="p-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(vol.id, 'rejected')}
                                title="Reject"
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => openEditModal(vol)}
                            title="Edit"
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(vol.id)}
                            title="Delete"
                            className="p-1.5 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Editing Dialog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold mb-4">Edit Volunteer Details</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Gender</label>
                  <select 
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Hours Completed</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editFormData.hoursCompleted}
                    onChange={(e) => setEditFormData({ ...editFormData, hoursCompleted: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Location</label>
                <input 
                  type="text" 
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Skills (commas)</label>
                <input 
                  type="text" 
                  value={editFormData.skills}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Interests (commas)</label>
                <input 
                  type="text" 
                  value={editFormData.interests}
                  onChange={(e) => setEditFormData({ ...editFormData, interests: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Availability Schedule</label>
                <input 
                  type="text" 
                  value={editFormData.availability}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
