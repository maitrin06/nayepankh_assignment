'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, Sun, Moon, Languages, LogOut, User, 
  LayoutDashboard, Users, Calendar, CheckSquare, Award, FileText 
} from 'lucide-react';
import Link from 'next/link';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { 
    user, logout, language, toggleLanguage, theme, toggleTheme, 
    notifications, markNotificationRead, t 
  } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Redirect if loading finishes and no user exists
  React.useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p>Redirecting to Authentication...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  // Sidebar navigation options
  const menuItems = isAdmin
    ? [
        { label: t('dashboard'), href: '/dashboard/admin', icon: LayoutDashboard },
        { label: t('volunteers'), href: '/volunteers', icon: Users },
        { label: t('events'), href: '/events', icon: Calendar },
        { label: t('tasks'), href: '/tasks', icon: CheckSquare },
        { label: t('reports'), href: '/reports', icon: FileText },
      ]
    : [
        { label: t('dashboard'), href: '/dashboard/volunteer', icon: LayoutDashboard },
        { label: t('events'), href: '/events', icon: Calendar },
        { label: t('tasks'), href: '/tasks', icon: CheckSquare },
        { label: t('profile'), href: '/profile', icon: User },
      ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070b13] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-[#0d1321] border-r border-slate-200 dark:border-slate-800 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              VolunteerHub
            </span>
          </Link>
          <button lg-only="true" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 dark:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar user preview */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <img 
              src={user.profileImage || "https://api.dicebear.com/7.x/bottts/svg?seed=Avatar"} 
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate dark:text-slate-100">{user.name}</h4>
              <span className="text-xs text-amber-600 dark:text-amber-500 font-medium capitalize">
                {user.role === 'admin' ? t('adminPortal') : 'Volunteer'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-amber-500' : ''}`} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 bg-white dark:bg-[#0d1321] border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 lg:flex-none"></div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              title="Change Language"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <Languages className="h-4 w-4" />
              <span>{t('langToggle')}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0d1321]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dialog Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 z-20 w-80 rounded-xl bg-white dark:bg-[#121b2d] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-sm dark:text-slate-100">Notifications</span>
                        <span className="text-xs text-amber-500 font-medium">{unreadCount} unread</span>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                if (!n.read) markNotificationRead(n.id);
                              }}
                              className={`p-3.5 text-xs transition-colors cursor-pointer ${
                                !n.read 
                                  ? 'bg-amber-500/5 dark:bg-amber-500/5 hover:bg-amber-500/10' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                              }`}
                            >
                              <p className={`mb-1 leading-relaxed ${!n.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 grid-pattern">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
