'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Phone, CheckCircle, ArrowRight, ArrowLeft, Globe, 
  MapPin, ShieldAlert, BookOpen, Clock, Heart, Award
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

import { Suspense } from 'react';

function AuthContent() {
  const { user, login, googleLogin, registerVolunteer, t } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot/Reset password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ success: false, message: '' });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState({ success: false, message: '' });

  // Registration Multi-step states
  const [step, setStep] = useState(1);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer',
    phone: '',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
    age: '',
    gender: 'Male',
    address: '',
    occupation: '',
    skills: '',
    interests: '',
    availability: 'Flexible',
    location: '',
    resumeUrl: 'https://volunteerhub.org/docs/mock_resume.pdf'
  });

  // Watch for tab parameters or reset tokens in URL query
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
    const token = searchParams.get('resetToken');
    if (token) {
      setResetToken(token);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/volunteer');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleGoogleMock = async () => {
    setLoginError('');
    const mockEmail = activeTab === 'login' ? 'rahul@volunteerhub.org' : 'newgoogle@volunteerhub.org';
    const mockName = activeTab === 'login' ? 'Rahul Sharma' : 'Google Volunteer';
    const result = await googleLogin(mockEmail, mockName);
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus({ success: false, message: '' });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
      setForgotStatus({ success: true, message: res.data.message });
    } catch (error: any) {
      setForgotStatus({ success: false, message: error.response?.data?.message || 'Request failed' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus({ success: false, message: '' });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token: resetToken, 
        newPassword 
      });
      setResetStatus({ success: true, message: res.data.message });
      setTimeout(() => {
        setResetToken(null);
        setActiveTab('login');
      }, 3000);
    } catch (error: any) {
      setResetStatus({ success: false, message: error.response?.data?.message || 'Reset failed' });
    }
  };

  const handleRegisterSubmit = async () => {
    setRegError('');
    const result = await registerVolunteer(formData);
    if (result.success) {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setActiveTab('login');
        setStep(1);
      }, 3000);
    } else {
      setRegError(result.error);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      setRegError('Please fill in Name, Email and Password.');
      return;
    }
    setRegError('');
    if (formData.role === 'admin') {
      // Admins bypass detailed volunteer profile steps
      handleRegisterSubmit();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setRegError('');
    setStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13] p-6 text-slate-900 dark:text-slate-100">
      
      {/* Reset Password Card Override */}
      {resetToken ? (
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-xs text-slate-400 mb-6">Enter a strong, secure new password for your account.</p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                  required
                />
              </div>
            </div>

            {resetStatus.message && (
              <p className={`text-xs ${resetStatus.success ? 'text-green-500' : 'text-rose-500'}`}>
                {resetStatus.message}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all"
            >
              Update Password
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
              VolunteerHub
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart Volunteer Registration & Management</p>
          </div>

          <div className="bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Tabs selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => { setActiveTab('login'); setRegError(''); }}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'login' 
                    ? 'border-amber-500 text-amber-500 bg-slate-50/50 dark:bg-slate-900/10' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {t('login')}
              </button>
              <button 
                onClick={() => { setActiveTab('register'); setRegError(''); }}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'register' 
                    ? 'border-amber-500 text-amber-500 bg-slate-50/50 dark:bg-slate-900/10' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {t('register')}
              </button>
            </div>

            <div className="p-6 md:p-8">
              
              {/* TAB 1: LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="volunteer@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-400">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-amber-500 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Logging in...' : t('login')}
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-wider uppercase">Or Continue With</span>
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  </div>

                  {/* Google OAuth Button */}
                  <button 
                    type="button" 
                    onClick={handleGoogleMock}
                    className="flex w-full items-center justify-center gap-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Globe className="h-4 w-4 text-amber-500" />
                    <span>Google Sign In</span>
                  </button>

                  <div className="text-center mt-6 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[11px] text-amber-500 leading-relaxed">
                    <strong>Demo Logins:</strong><br />
                    Admin: <code>admin@volunteerhub.org</code> / <code>admin123</code><br />
                    Volunteer: <code>rahul@volunteerhub.org</code> / <code>password123</code>
                  </div>
                </form>
              )}

              {/* TAB 2: MULTI-STEP REGISTER */}
              {activeTab === 'register' && (
                <div>
                  
                  {/* Step indicators */}
                  {formData.role === 'volunteer' && (
                    <div className="flex items-center justify-between mb-8">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <div className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold border-2 transition-all ${
                            step === s 
                              ? 'border-amber-500 text-amber-500 bg-amber-500/5' 
                              : step > s 
                                ? 'border-amber-500 bg-amber-500 text-white' 
                                : 'border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}>
                            {s}
                          </div>
                          {s < 4 && (
                            <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {regSuccess ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
                      <p className="text-sm text-slate-400">Your profile has been registered. You are redirected to login...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Step 1: Account credentials */}
                      {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h4 className="text-sm font-semibold text-amber-500 mb-2">Step 1: Account Information</h4>
                          
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Role Select</label>
                            <select 
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                            >
                              <option value="volunteer">Volunteer</option>
                              <option value="admin">NGO Administrator</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Rahul Sharma"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="rahul@example.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="password" 
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 99887 76655"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: Personal details */}
                      {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h4 className="text-sm font-semibold text-amber-500 mb-2">Step 2: Personal Details</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-2">Age</label>
                              <input 
                                type="number" 
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                placeholder="24"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-2">Gender</label>
                              <select 
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Residential Address</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <textarea 
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Apartment / Lane, City, State"
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm h-20 resize-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-3">Choose Your Avatar</label>
                            <div className="grid grid-cols-6 gap-3">
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
                                    className={`relative p-1.5 rounded-xl border-2 transition-all hover:scale-105 ${
                                      isSelected 
                                        ? 'border-amber-500 bg-amber-500/10' 
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                                    }`}
                                  >
                                    <img src={url} alt={name} className="h-10 w-10 mx-auto" />
                                    {isSelected && (
                                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Professional details */}
                      {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h4 className="text-sm font-semibold text-amber-500 mb-2">Step 3: Professional Details</h4>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Occupation / Study</label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.occupation}
                                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                placeholder="Student, Engineer, Medical Practitioner"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Skills (separated by commas)</label>
                            <div className="relative">
                              <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="First Aid, Writing, Web Design, Event Management"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 4: Preferences & uploads */}
                      {step === 4 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h4 className="text-sm font-semibold text-amber-500 mb-2">Step 4: Preferences & Uploads</h4>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Interests / Focus Areas (commas)</label>
                            <div className="relative">
                              <Heart className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.interests}
                                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                placeholder="Healthcare, Environment, Child Tutoring"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Availability Schedule (days/times)</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.availability}
                                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                placeholder="Weekends, Saturdays only, Wednesdays after 5 PM"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Preferred Location / City</label>
                            <input 
                              type="text" 
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="Mumbai"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Resume URL</label>
                            <input 
                              type="text" 
                              value={formData.resumeUrl}
                              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                            />
                          </div>
                        </motion.div>
                      )}

                      {regError && (
                        <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs">
                          {regError}
                        </div>
                      )}

                      {/* Control buttons */}
                      <div className="flex items-center gap-4 pt-4">
                        {step > 1 && (
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                          </button>
                        )}

                        <button 
                          type="button" 
                          onClick={formData.role === 'volunteer' && step < 4 ? nextStep : handleRegisterSubmit}
                          className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all"
                        >
                          {formData.role === 'volunteer' && step < 4 ? 'Continue' : 'Register Now'}
                          {formData.role === 'volunteer' && step < 4 && <ArrowRight className="h-4 w-4" />}
                        </button>
                      </div>

                    </div>
                  )}

                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[9px] font-bold tracking-wider uppercase">Or Register With</span>
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleMock}
                    className="flex w-full items-center justify-center gap-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Globe className="h-4 w-4 text-amber-500" />
                    <span>Sign up with Google</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold mb-2">Forgot Password</h3>
              <p className="text-xs text-slate-400 mb-6">Enter your email address to receive a password recovery link.</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="volunteer@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm"
                    required
                  />
                </div>

                {forgotStatus.message && (
                  <p className={`text-xs ${forgotStatus.success ? 'text-green-500' : 'text-rose-500'}`}>
                    {forgotStatus.message}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowForgotModal(false); setForgotStatus({ success: false, message: '' }); }}
                    className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13] p-6 text-slate-900 dark:text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
