'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  Calendar, MapPin, Clock, Users, Plus, Trash2, Edit2, Sparkles, Check, 
  QrCode, AlertTriangle, Search, CheckCircle2, UserPlus, Info
} from 'lucide-react';
import axios from 'axios';

export default function EventManagement() {
  const { user, token } = useAuth();
  
  const [events, setEvents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms & Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [matchingVolunteers, setMatchingVolunteers] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  
  const [checkInVolunteerId, setCheckInVolunteerId] = useState('');
  const [checkInResult, setCheckInResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600'
  });

  const API_URL = 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const evRes = await axios.get(`${API_URL}/events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(evRes.data);

      if (user?.role === 'admin') {
        const volRes = await axios.get(`${API_URL}/volunteers`, { headers: { Authorization: `Bearer ${token}` } });
        setVolunteers(volRes.data.filter((v: any) => v.status === 'approved'));
      }
    } catch (err) {
      console.error('Error fetching event listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/events`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleRegister = async (id: string) => {
    try {
      const res = await axios.post(`${API_URL}/events/${id}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await axios.post(`${API_URL}/events/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  // Open AI matching score matching modal
  const openMatchingModal = async (ev: any) => {
    setSelectedEvent(ev);
    setShowMatchingModal(true);
    setMatchingLoading(true);
    try {
      const res = await axios.get(`${API_URL}/volunteers/matching/${ev.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatchingVolunteers(res.data);
    } catch (err) {
      console.error('AI Matching error:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  // Open QR Attendance check-in modal
  const openQRCheckinModal = (ev: any) => {
    setSelectedEvent(ev);
    setCheckInVolunteerId('');
    setCheckInResult(null);
    setShowQRModal(true);
  };

  const handleQRCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInResult(null);
    try {
      const res = await axios.post(`${API_URL}/events/${selectedEvent.id}/checkin`, {
        volunteerId: checkInVolunteerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckInResult({ success: true, message: res.data.message });
      fetchData();
    } catch (error: any) {
      setCheckInResult({ 
        success: false, 
        message: error.response?.data?.message || 'Verification / Check-in failed.' 
      });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">NGO events & campaigns</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Join action drives, register attendance, and check semantic volunteer match rankings.</p>
          </div>

          {isAdmin && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          )}
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No events scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const dateStr = new Date(ev.date).toLocaleDateString();
              const isVolunteerJoined = ev.volunteers?.some((v: any) => v.id === user?.volunteerId);
              
              return (
                <div key={ev.id} className="bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <img 
                      src={ev.imageUrl || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600"} 
                      alt={ev.title}
                      className="h-44 w-full object-cover"
                    />
                    
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{ev.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-orange-500" />
                          <span>{ev.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-teal-500" />
                          <span>Registered: {ev.volunteers?.length || 0} / {ev.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom actions panel */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/50 flex gap-2">
                    {isAdmin ? (
                      <>
                        <button 
                          onClick={() => openMatchingModal(ev)}
                          className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Matches
                        </button>
                        <button 
                          onClick={() => openQRCheckinModal(ev)}
                          className="flex-1 py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <QrCode className="h-3 w-3" />
                          QR Scan
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      isVolunteerJoined ? (
                        <button 
                          onClick={() => handleCancel(ev.id)}
                          className="w-full py-2 border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-500/5 rounded-lg text-xs font-semibold"
                        >
                          Cancel Registration
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRegister(ev.id)}
                          disabled={ev.volunteers?.length >= ev.capacity}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          {ev.volunteers?.length >= ev.capacity ? 'Full Capacity' : 'Register for Event'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* QR ATTENDANCE SCAN CHECK-IN MODAL (Simulated Check-In) */}
      {showQRModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold mb-2 flex items-center gap-1.5">
              <QrCode className="h-5 w-5 text-teal-500" />
              <span>Simulated QR Scanner check-in</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Select a volunteer from the event roster to scan and check-in.</p>

            <form onSubmit={handleQRCheckIn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2">Registered Volunteer</label>
                <select 
                  value={checkInVolunteerId}
                  onChange={(e) => setCheckInVolunteerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                >
                  <option value="">Select Volunteer...</option>
                  {selectedEvent.volunteers?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.user?.name || 'Unknown'}</option>
                  ))}
                </select>
              </div>

              {checkInResult && (
                <div className={`p-3 rounded-lg text-[11px] flex items-center gap-2 border ${
                  checkInResult.success 
                    ? 'bg-green-500/10 border-green-500/25 text-green-500' 
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-500'
                }`}>
                  {checkInResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span>{checkInResult.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  disabled={!checkInVolunteerId}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold"
                >
                  Check In (Mark Attended)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI VOLUNTEER MATCHING SCORES MODAL */}
      {showMatchingModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold mb-2 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>AI volunteer matchmaking suggestions</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Volunteers ranked by compatibility scores matching event title, tags, description and location.</p>

            {matchingLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
              </div>
            ) : matchingVolunteers.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No matched volunteers found. Check volunteer skills profiles.
              </div>
            ) : (
              <div className="space-y-3">
                {matchingVolunteers.map((vol) => (
                  <div key={vol.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={vol.profileImage || "https://api.dicebear.com/7.x/bottts/svg?seed=Avatar"} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold">{vol.name}</h4>
                        <span className="text-[10px] text-slate-400">Skills: {vol.skills}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-500 block">{vol.matchPercentage}% Match</span>
                      <span className="text-[9px] text-slate-400">Matched: {vol.matchedKeywords.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button 
                onClick={() => setShowMatchingModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Close Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold mb-4">Create New Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Event Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Beach Cleanup Drive"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe the campaign goals and expectations..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs h-24 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Time</label>
                  <input 
                    type="text" 
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:00 AM - 01:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Versova Beach, Mumbai"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Campaign Image URL</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
