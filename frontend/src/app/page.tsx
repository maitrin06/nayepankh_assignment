'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Award, Heart, Calendar, Clock, ArrowRight, ShieldCheck, Zap, Users, Star, 
  Moon, Sun, Languages 
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { user, language, toggleLanguage, theme, toggleTheme, t } = useAuth();
  const router = useRouter();

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Lead Environmentalist Volunteer",
      quote: "VolunteerHub made signing up and tracking my community cleanup participation so seamless. I immediately received my certificate!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Dr. Priya Patel",
      role: "Medical Camp Volunteer Coordinator",
      quote: "The task management and automated emails ensure that our healthcare camps run with zero administrative friction. Highly recommended NGO tool.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 w-full glass border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              VolunteerHub
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
            >
              <Languages className="h-4 w-4" />
              <span>{t('langToggle')}</span>
            </button>

            {/* Dark Mode */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Login / Dashboard Link */}
            {user ? (
              <Link 
                href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/volunteer'}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow-md shadow-amber-500/20"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <Link 
                href="/auth"
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow-md shadow-amber-500/20"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-600/10 dark:bg-orange-600/5 rounded-full blur-[100px]" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-center z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Smart Volunteer Administration</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent"
          >
            {t('heroTitle')}
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth?tab=register"
              className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/auth?tab=login"
              className="px-7 py-3.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50 font-semibold rounded-xl transition-all"
            >
              Explore Events
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-white dark:bg-[#0c1220] border-y border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/45">
            <Users className="h-8 w-8 text-amber-500 mb-4" />
            <h3 className="text-3xl font-extrabold mb-1">1,240+</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('statsVolunteers')}</span>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/45">
            <Calendar className="h-8 w-8 text-orange-500 mb-4" />
            <h3 className="text-3xl font-extrabold mb-1">450+</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('statsEvents')}</span>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/45">
            <Clock className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-3xl font-extrabold mb-1">18,500+</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('statsHours')}</span>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('testimonialsTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-white dark:bg-[#0d1321] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Star className="h-24 w-24 text-slate-900 dark:text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed relative z-10">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <img 
                    src={t.image} 
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-500"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <span className="text-xs text-amber-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-[#070b13] text-center text-xs text-slate-500">
        <p className="mb-2">© {new Date().getFullYear()} VolunteerHub. Designed for premium community-based volunteer automation.</p>
        <p>Built with Next.js, Express, TypeScript, and Prisma ORM.</p>
      </footer>

    </div>
  );
}
