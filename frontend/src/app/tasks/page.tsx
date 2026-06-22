'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  Plus, CheckSquare, Clock, Calendar, User, CheckCircle2, ChevronRight, 
  Trash2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

export default function TaskAssignment() {
  const { user, token } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedVolunteerId: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      if (!token) return;
      setLoading(true);

      const taskRes = await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(taskRes.data);

      if (user?.role === 'admin') {
        const volRes = await axios.get(`${API_URL}/volunteers`, { headers: { Authorization: `Bearer ${token}` } });
        setVolunteers(volRes.data.filter((v: any) => v.status === 'approved'));
      }
    } catch (err) {
      console.error('Error fetching tasks list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        assignedVolunteerId: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">NGO task board</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Delegate tasks to volunteers, track completions, and update status logs.</p>
          </div>

          {isAdmin && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>

        {/* Tasks grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No tasks assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const deadlineStr = new Date(task.deadline).toLocaleDateString();
              const isPending = task.status === 'Pending';
              const isInProgress = task.status === 'In Progress';
              const isCompleted = task.status === 'Completed';

              return (
                <div key={task.id} className="bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between h-56">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isCompleted 
                          ? 'bg-green-500/10 text-green-500' 
                          : isInProgress 
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {task.status}
                      </span>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {deadlineStr}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 line-clamp-1">{task.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Task footer layout */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    
                    {/* Assignee view */}
                    {isAdmin && task.assignedVolunteer ? (
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                          {task.assignedVolunteer.user?.name || 'Unknown'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Status updates trigger hours</span>
                      </div>
                    )}

                    {/* Progress Control buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {!isCompleted && (
                        <>
                          {/* Volunteer actions */}
                          {!isAdmin && isPending && (
                            <button 
                              onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                              className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              In Progress
                            </button>
                          )}

                          {/* Admin actions */}
                          {isAdmin && (
                            <>
                              {isPending && (
                                <button 
                                  onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                  className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all mr-1"
                                >
                                  In Progress
                                </button>
                              )}
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'Completed')}
                                className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition-all"
                              >
                                Complete
                              </button>
                            </>
                          )}
                        </>
                      )}
                      
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Finished</span>
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold mb-4">Assign New Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Draft beach cleanup spreadsheets"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Instructions / Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide checklist items, delivery expectations..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Deadline Date</label>
                <input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2">Assign Approved Volunteer</label>
                <select 
                  value={formData.assignedVolunteerId}
                  onChange={(e) => setFormData({ ...formData, assignedVolunteerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-xs"
                  required
                >
                  <option value="">Select Volunteer...</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>{v.user.name} ({v.skills})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
