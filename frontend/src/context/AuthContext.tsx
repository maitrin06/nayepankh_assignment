'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

// Translation Dictionaries (English & Hindi)
export const translations: any = {
  en: {
    heroTitle: "Empower Communities, One Volunteer at a Time",
    heroSubtitle: "Join hands with VolunteerHub to make a lasting impact. Register as a volunteer or manage social action events and task assignments with high efficiency.",
    getStarted: "Get Started",
    adminPortal: "Admin Portal",
    statsVolunteers: "Active Volunteers",
    statsEvents: "Completed Events",
    statsHours: "Impact Hours",
    testimonialsTitle: "What People Say",
    langToggle: "हिन्दी",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    home: "Home",
    dashboard: "Dashboard",
    volunteers: "Volunteers",
    events: "Events",
    tasks: "Tasks",
    leaderboard: "Leaderboard",
    analytics: "Analytics",
    reports: "Reports",
    profile: "Profile",
    logout: "Log Out",
    login: "Log In",
    register: "Register",
    welcome: "Welcome back",
    registerTitle: "Join VolunteerHub",
  },
  hi: {
    heroTitle: "समुदायों को सशक्त बनाएं, एक समय में एक स्वयंसेवक",
    heroSubtitle: "स्थायी प्रभाव डालने के लिए वालंटियरहब से हाथ मिलाएं। स्वयंसेवक के रूप में पंजीकरण करें या उच्च दक्षता के साथ सामाजिक गतिविधियों और कार्यों का प्रबंधन करें।",
    getStarted: "शुरू करें",
    adminPortal: "एडमिन पोर्टल",
    statsVolunteers: "सक्रिय स्वयंसेवक",
    statsEvents: "पूर्ण कार्यक्रम",
    statsHours: "प्रभाव के घंटे",
    testimonialsTitle: "लोग क्या कहते हैं",
    langToggle: "English",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    home: "होम",
    dashboard: "डैशबोर्ड",
    volunteers: "स्वयंसेवक",
    events: "कार्यक्रम",
    tasks: "कार्य",
    leaderboard: "लीडरबोर्ड",
    analytics: "विश्लेषण",
    reports: "रिपोर्ट",
    profile: "प्रोफ़ाइल",
    logout: "लॉग आउट",
    login: "लॉग इन",
    register: "पंजीकरण",
    welcome: "आपका स्वागत है",
    registerTitle: "वालंटियरहब से जुड़ें",
  }
};

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface AuthContextType {
  token: string | null;
  user: any | null;
  loading: boolean;
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
  notifications: Notification[];
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (email: string, name: string) => Promise<any>;
  registerVolunteer: (data: any) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  logout: () => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  t: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Read state from localStorage
    const savedToken = localStorage.getItem('vh_token');
    const savedUser = localStorage.getItem('vh_user');
    const savedLang = localStorage.getItem('vh_lang');
    const savedTheme = localStorage.getItem('vh_theme');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedLang === 'en' || savedLang === 'hi') {
      setLanguage(savedLang);
    }
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark'); // default dark mode
    }
    setLoading(false);
  }, []);

  // Connect Socket.io when authenticated
  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Socket client connected');
      newSocket.emit('register_user', user.id);
    });

    newSocket.on('notification', (payload: Notification) => {
      console.log('Real-time notification received:', payload);
      setNotifications(prev => [payload, ...prev]);
    });

    setSocket(newSocket);
    fetchNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('vh_lang', nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('vh_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user: userData } = res.data;
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('vh_token', token);
      localStorage.setItem('vh_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const googleLogin = async (email: string, name: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { email, name, googleToken: 'mock-google-token' });
      const { token, user: userData } = res.data;

      setToken(token);
      setUser(userData);
      localStorage.setItem('vh_token', token);
      localStorage.setItem('vh_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Google Auth failed' };
    }
  };

  const registerVolunteer = async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!token || !user) throw new Error('Not authenticated');
      const res = await axios.put(`${API_URL}/volunteer/${user.volunteerId || user.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedVolunteer = res.data.volunteer;
      
      // Update local storage user profile image/details
      const updatedUser = {
        ...user,
        name: updatedVolunteer.user.name,
        phone: updatedVolunteer.user.phone,
        profileImage: updatedVolunteer.user.profileImage,
        status: updatedVolunteer.status,
      };

      setUser(updatedUser);
      localStorage.setItem('vh_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('vh_token');
    localStorage.removeItem('vh_user');
    router.push('/');
  };

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      if (!token) return;
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      language,
      theme,
      notifications,
      login,
      googleLogin,
      registerVolunteer,
      updateProfile,
      logout,
      toggleLanguage,
      toggleTheme,
      markNotificationRead,
      fetchNotifications,
      t
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
