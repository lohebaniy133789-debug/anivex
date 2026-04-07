import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk, Show } from '@clerk/react';
import { useLocation } from 'wouter';
import AnimeStatusSelector from '@/components/AnimeStatusSelector';
import ProfilePage from '@/pages/ProfilePage';
import MyListPage from '@/pages/MyListPage';
import AnimePlayer from '@/components/AnimePlayer';
import EpisodesSection from '@/components/EpisodesSection';
import { api, setTokenProvider } from '@/lib/api';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const Icons = {
  SkipForward: ({ size = 24, className = "" }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>),
  SkipBack: ({ size = 24, className = "" }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>),
  Play: ({ size = 24, fill = "none", className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="6 3 20 12 6 21 6 3" /></svg>),
  Plus: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Search: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
  X: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  ChevronLeft: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="15 18 9 12 15 6" /></svg>),
  ChevronRight: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="9 18 15 12 9 6" /></svg>),
  Heart: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>),
  Clock: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  Send: ({ size = 24, fill = "none", className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>),
  User: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  Calendar: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  TrendingUp: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>),
  Star: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  Sparkles: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>),
  Layers: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>),
  Loader: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`} {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>),
  ChevronDown: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="6 9 12 15 18 9" /></svg>),
  ChevronUp: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="18 15 12 9 6 15" /></svg>),
  Film: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>),
  AlertTriangle: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  Zap: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>),
  Award: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>),
  Shuffle: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>),
  Home: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>),
  Grid: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>),
  Eye: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>),
  Lock: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  LogOut: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
  Filter: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>),
  Volume2: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>),
  Volume1: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>),
  VolumeX: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>),
  Maximize: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>),
  Image: ({ size = 24, className = "", ...props }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
};

// ══════════════════════════════════════════════════════════════
// СКЕЛЕТОН ЗАГРУЗКИ ГЛАВНОЙ СТРАНИЦЫ
// ══════════════════════════════════════════════════════════════
function HeroSkeleton() {
  return (
    <section className="relative h-[88vh] w-full overflow-hidden bg-[#0a0a0c]">
      {/* Анимированный градиентный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 60%)',
              'radial-gradient(ellipse at 60% 30%, rgba(99,102,241,0.1) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(139,92,246,0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Горизонтальные линии скелетона */}
        <div className="absolute inset-0 flex items-end pb-16 px-5 lg:px-14">
          <div className="w-full max-w-2xl space-y-4">
            {/* Бейджи */}
            <div className="flex gap-2">
              {[80, 100, 60, 90].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-5 rounded-full bg-white/[0.05]"
                  style={{ width: w }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </div>
            {/* Заголовок */}
            <div className="space-y-2">
              <motion.div
                className="h-10 lg:h-14 rounded-2xl bg-white/[0.05]"
                style={{ width: '75%' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="h-10 lg:h-14 rounded-2xl bg-white/[0.04]"
                style={{ width: '55%' }}
                animate={{ opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
              />
            </div>
            {/* Описание */}
            <div className="space-y-2 pt-1">
              {[100, 90, 70].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-3 rounded-lg bg-white/[0.04]"
                  style={{ width: `${w}%` }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                />
              ))}
            </div>
            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
              <motion.div
                className="h-11 w-32 rounded-2xl bg-indigo-600/20"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="h-11 w-32 rounded-2xl bg-white/[0.04]"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
        {/* Правые миниатюры */}
        <div className="absolute right-5 lg:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[0,1,2,3,4].map(i => (
            <motion.div
              key={i}
              className="w-16 h-22 rounded-xl bg-white/[0.04]"
              style={{ height: 88 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
      {/* Нижний градиент */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
      {/* Логотип загрузки */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-2xl border border-indigo-500/30 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.1)', '0 0 40px rgba(99,102,241,0.25)', '0 0 20px rgba(99,102,241,0.1)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">A</span>
            </motion.div>
            <motion.div
              className="absolute -inset-1 rounded-2xl border border-indigo-500/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[0,1,2,3].map(i => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-indigo-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// СКЕЛЕТОН ПОИСКА (как на фото)
// ══════════════════════════════════════════════════════════════
function SearchSkeleton() {
  return (
    <div className="p-3 space-y-0.5">
      {[1,2,3,4,5].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          {/* Постер */}
          <motion.div
            className="w-10 h-14 rounded-lg bg-white/[0.06] shrink-0"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
          />
          <div className="flex-1 space-y-2">
            {/* Название */}
            <motion.div
              className="h-3 rounded-lg bg-white/[0.06]"
              style={{ width: `${65 + Math.random() * 25}%` }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 + 0.05, ease: 'easeInOut' }}
            />
            {/* Год/тип */}
            <div className="flex gap-2">
              <motion.div
                className="h-2 w-10 rounded-md bg-white/[0.04]"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 + 0.1, ease: 'easeInOut' }}
              />
              <motion.div
                className="h-2 w-14 rounded-md bg-white/[0.04]"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 + 0.15, ease: 'easeInOut' }}
              />
            </div>
          </div>
          {/* Рейтинг */}
          <motion.div
            className="w-8 h-5 rounded bg-white/[0.05] shrink-0"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
          />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// УЛУЧШЕННАЯ КНОПКА ГРОМКОСТИ
// ══════════════════════════════════════════════════════════════
function VolumeButton({ muted, volume, onMuteToggle, onVolumeChange }: {
  muted: boolean;
  volume: number;
  onMuteToggle: () => void;
  onVolumeChange: (v: number) => void;
}) {
  const [showSlider, setShowSlider] = useState(false);
  const timerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showAndDelay = () => {
    setShowSlider(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSlider(false), 2500);
  };

  const VolumeIcon = muted || volume === 0
    ? Icons.VolumeX
    : volume < 0.5
    ? Icons.Volume1
    : Icons.Volume2;

  return (
    <div ref={containerRef} className="relative flex items-center" onMouseLeave={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowSlider(false), 800); }}>
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: -8, scaleX: 0.8 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            exit={{ opacity: 0, x: -8, scaleX: 0.8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-full mr-2 flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2 shadow-2xl"
            onMouseEnter={() => { clearTimeout(timerRef.current); }}
            style={{ transformOrigin: 'right' }}
          >
            <span className="text-[9px] font-black text-white/40 w-7 text-right tabular-nums">
              {muted ? '0' : Math.round(volume * 100)}%
            </span>
            <div className="relative h-1 w-24 bg-white/10 rounded-full cursor-pointer group/slider"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onVolumeChange(x);
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{
                  width: `${(muted ? 0 : volume) * 100}%`,
                  background: 'linear-gradient(90deg, #818cf8, #6366f1)',
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"
                style={{ left: `calc(${(muted ? 0 : volume) * 100}% - 6px)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.88 }}
        onMouseEnter={showAndDelay}
        onClick={() => { onMuteToggle(); showAndDelay(); }}
        className="relative p-2.5 rounded-full border border-white/15 bg-black/50 hover:bg-white/15 transition-all backdrop-blur-sm group"
        title={muted ? 'Включить звук' : 'Выключить звук'}
      >
        <motion.div
          animate={{ scale: muted ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <VolumeIcon size={14} className={muted ? "text-white/40" : "text-white"} />
        </motion.div>
        {!muted && (
          <motion.div
            className="absolute inset-0 rounded-full border border-indigo-500/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ГЕРОИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
// ══════════════════════════════════════════════════════════════
interface HeroEntry {
  shikiId: number;
  slug: string;
  hasLocalMedia: boolean;
  accentColor: string;
  genres: string[];
}

const HERO_ENTRIES: HeroEntry[] = [
  { shikiId: 11757, slug: 'sao', hasLocalMedia: true, accentColor: '#6366f1', genres: ['Фэнтези', 'Экшен'] },
  { shikiId: 16498, slug: 'aot', hasLocalMedia: true, accentColor: '#dc2626', genres: ['Экшен', 'Драма'] },
  { shikiId: 40748, slug: 'jujutsu', hasLocalMedia: true, accentColor: '#7c3aed', genres: ['Экшен', 'Сверхъестественное'] },
  { shikiId: 22319, slug: 'tokyo-ghoul', hasLocalMedia: true, accentColor: '#991b1b', genres: ['Экшен', 'Ужасы'] },
  { shikiId: 21, slug: 'one-piece', hasLocalMedia: true, accentColor: '#d97706', genres: ['Приключения', 'Экшен'] },
];

function parseShikiDesc(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\[character=\d+\](.*?)\[\/character\]/g, '$1')
    .replace(/\[anime=\d+\](.*?)\[\/anime\]/g, '$1')
    .replace(/\[manga=\d+\](.*?)\[\/manga\]/g, '$1')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ══════════════════════════════════════════════════════════════
// SHIKIMORI API
// ══════════════════════════════════════════════════════════════
const SHIKIMORI_BASE = 'https://shikimori.one/api';
const APP_NAME = 'Anivex/2.0';

const shikiHeaders = {
  'User-Agent': APP_NAME,
  'Content-Type': 'application/json',
};

const shikiCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function shikiFetch(endpoint: string, useC = true): Promise<any> {
  const url = `${SHIKIMORI_BASE}${endpoint}`;
  if (useC) {
    const c = shikiCache.get(url);
    if (c && Date.now() - c.ts < CACHE_TTL) return c.data;
  }
  const r = await fetch(url, { headers: shikiHeaders });
  if (r.status === 429) {
    await new Promise(res => setTimeout(res, 2000));
    return shikiFetch(endpoint, useC);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  shikiCache.set(url, { data, ts: Date.now() });
  return data;
}

function buildParams(params: Record<string, any>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) p.set(k, String(v)); });
  return p.toString() ? `?${p.toString()}` : '';
}

async function shikiGetAnimes(params: Record<string, any>): Promise<any[]> {
  return shikiFetch(`/animes${buildParams(params)}`);
}

async function shikiGetAnime(id: number): Promise<any> {
  return shikiFetch(`/animes/${id}`);
}

async function shikiGetRelated(id: number): Promise<any[]> {
  return shikiFetch(`/animes/${id}/related`);
}

async function shikiGetScreenshots(id: number): Promise<any[]> {
  try { return await shikiFetch(`/animes/${id}/screenshots`); }
  catch { return []; }
}

async function shikiGetRoles(id: number): Promise<any[]> {
  try { return await shikiFetch(`/animes/${id}/roles`); }
  catch { return []; }
}

async function shikiSearch(query: string, limit = 20): Promise<any[]> {
  return shikiFetch(`/animes${buildParams({ search: query, limit, order: 'popularity', censored: true })}`);
}

// ══════════════════════════════════════════════════════════════
// УТИЛИТЫ
// ══════════════════════════════════════════════════════════════
const Fmt: Record<string, string> = {
  tv: 'Сериал', tv_short: 'Мини-сериал', movie: 'Фильм',
  special: 'Спецвыпуск', ova: 'OVA', ona: 'ONA', music: 'Клип',
};

const StatusMap: Record<string, string> = {
  released: 'Завершено', ongoing: 'Выходит', anons: 'Анонс',
};

const RelMap: Record<string, string> = {
  sequel: 'Продолжение', prequel: 'Приквел', side_story: 'Побочная',
  parent_story: 'Основа', alternative_setting: 'Альтернатива',
  alternative_version: 'Альтернативная версия', spin_off: 'Спин-офф',
  other: 'Другое', adaptation: 'Адаптация', source: 'Источник',
  summary: 'Сводка', full_story: 'Полная история', character: 'Персонаж',
};

const SeasonMap: Record<string, string> = {
  winter: 'Зима', spring: 'Весна', summer: 'Лето', fall: 'Осень',
};

const GenreRuMap: Record<string, string> = {
  "Action": "Экшен", "Adventure": "Приключения", "Comedy": "Комедия",
  "Drama": "Драма", "Fantasy": "Фэнтези", "Horror": "Ужасы",
  "Mecha": "Меха", "Music": "Музыка", "Mystery": "Мистика",
  "Psychological": "Психологическое", "Romance": "Романтика",
  "Sci-Fi": "Фантастика", "Slice of Life": "Повседневность",
  "Sports": "Спорт", "Supernatural": "Сверхъестественное", "Thriller": "Триллер",
};

function getCurrentSeason() {
  const m = new Date().getMonth() + 1, y = new Date().getFullYear();
  if (m <= 3) return { season: 'winter' as const, year: y };
  if (m <= 6) return { season: 'spring' as const, year: y };
  if (m <= 9) return { season: 'summer' as const, year: y };
  return { season: 'fall' as const, year: y };
}

// ══════════════════════════════════════════════════════════════
// НОРМАЛИЗАЦИЯ
// ══════════════════════════════════════════════════════════════
function normShiki(m: any): any {
  if (!m) return null;
  let poster = '';
  if (m.image?.original) poster = `https://shikimori.one${m.image.original}`;
  else if (m.image?.preview) poster = `https://shikimori.one${m.image.preview}`;
  else if (m.image?.x96) poster = `https://shikimori.one${m.image.x96}`;
  const seasonStr = m.season || '';
  const [seasonName, seasonYear] = seasonStr.split('_');
  const rating = m.score ? parseFloat(m.score) : 0;
  const genres = (m.genres || []).map((g: any) => g.russian || GenreRuMap[g.name] || g.name);
  const rawDesc = m.description || m.description_html || '';
  const desc = parseShikiDesc(rawDesc);
  return {
    id: m.id, malId: m.id, shikiId: m.id,
    title: m.russian || m.name || 'Без названия',
    titleNative: m.japanese || '',
    titleRomaji: m.name || '',
    titleEnglish: m.name || '',
    titleRu: m.russian || '',
    desc, descRu: desc,
    year: seasonYear || m.aired_on?.substring(0, 4) || '—',
    type: Fmt[m.kind] || m.kind || 'Аниме',
    rating, genres, poster, banner: poster,
    episodes: m.episodes || m.episodes_aired || null,
    duration: m.duration || null,
    status: m.status,
    statusRu: StatusMap[m.status] || m.status || '',
    studio: null, nextEpisode: null, trailer: null,
    season: seasonName || null,
    seasonYear: seasonYear ? parseInt(seasonYear) : null,
    characters: [], relations: [], recommendations: [], screenshots: [],
  };
}

// ══════════════════════════════════════════════════════════════
// ХУКИ
// ══════════════════════════════════════════════════════════════
interface ShikiParams {
  order?: string; limit?: number; page?: number; status?: string;
  season?: string; genre?: string; kind?: string; censored?: boolean; score?: number;
}

function useShikiList(key: string, params: ShikiParams, on = true) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const vs = JSON.stringify(params);
  useEffect(() => {
    if (!on) { setLoading(false); setData([]); return; }
    let cancelled = false;
    setLoading(true);
    shikiGetAnimes({ ...params, censored: true })
      .then(res => { if (cancelled) return; setData((res || []).map(normShiki).filter(Boolean)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key, vs, on]);
  return { data, loading };
}

function useShikiDetail(id: number | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!id) { setData(null); setError(false); return; }
    let cancelled = false;
    setLoading(true); setError(false);
    (async () => {
      try {
        const [anime, related, roles] = await Promise.all([
          shikiGetAnime(id), shikiGetRelated(id), shikiGetRoles(id),
        ]);
        if (cancelled) return;
        if (!anime) { setError(true); return; }
        const base = normShiki(anime);
        base.studio = anime.studios?.[0]?.name || null;
        if (anime.videos?.length > 0) {
          const yt = anime.videos.find((v: any) => v.hosting === 'youtube');
          if (yt) base.trailer = { id: yt.video_id, site: 'youtube' };
        }
        base.relations = (related || [])
          .filter((r: any) => r.anime)
          .map((r: any) => {
            const n = normShiki(r.anime);
            if (!n) return null;
            return { ...n, relationType: r.relation, relationRu: RelMap[r.relation] || r.relation_text || r.relation };
          }).filter(Boolean);
        base.characters = (roles || [])
          .filter((r: any) => r.character).slice(0, 12)
          .map((r: any) => ({
            name: r.character.name || '—',
            nameR: r.character.russian || r.character.name || '',
            image: r.character.image?.preview ? `https://shikimori.one${r.character.image.preview}` : null,
            role: r.roles?.includes('Main') ? 'Главный' : r.roles?.includes('Supporting') ? 'Второстеп.' : 'Фоновый',
          }));
        try {
          const similar = await shikiFetch(`/animes/${id}/similar`);
          if (!cancelled) base.recommendations = (similar || []).slice(0, 8).map(normShiki).filter(Boolean);
        } catch {}
        try {
          const shots = await shikiGetScreenshots(id);
          if (!cancelled) {
            base.screenshots = (shots || []).slice(0, 12).map((s: any) => ({
              url: s.original ? `https://shikimori.one${s.original}` : '',
              preview: s.preview ? `https://shikimori.one${s.preview}` : '',
            }));
          }
        } catch {}
        if (!cancelled) setData(base);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);
  return { data, loading, error };
}

function useDebounce<T>(v: T, d: number): T {
  const [db, s] = useState(v);
  useEffect(() => { const t = setTimeout(() => s(v), d); return () => clearTimeout(t); }, [v, d]);
  return db;
}

function useShikiSearch(query: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query || query.length < 2) { setData([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const results = await shikiSearch(query, 20);
        if (cancelled) return;
        setData((results || []).map(normShiki).filter(Boolean).slice(0, 15));
      } catch {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);
  return { data, loading };
}

// ══════════════════════════════════════════════════════════════
// ХУКИ ДЛЯ ГЕРОЕВ
// ══════════════════════════════════════════════════════════════
function useHeroAnimes() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const results = await Promise.allSettled(
          HERO_ENTRIES.map(entry => shikiGetAnime(entry.shikiId))
        );
        if (cancelled) return;
        const heroData = results
          .map((result, idx) => {
            if (result.status !== 'fulfilled' || !result.value) return null;
            const entry = HERO_ENTRIES[idx];
            const base = normShiki(result.value);
            if (!base) return null;
            const raw = result.value.description || '';
            base.descRu = parseShikiDesc(raw);
            base.desc = base.descRu;
            return {
              ...base,
              slug: entry.slug,
              hasLocalMedia: entry.hasLocalMedia,
              accentColor: entry.accentColor,
              heroGenres: entry.genres,
              localVideo: entry.hasLocalMedia ? `/heroes/${entry.slug}/opening.mp4` : null,
              localLogo: entry.hasLocalMedia ? `/heroes/${entry.slug}/logo.png` : null,
            };
          }).filter(Boolean);
        if (!cancelled) setHeroes(heroData);
      } catch {
        if (!cancelled) setHeroes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return { heroes, loading };
}

// ══════════════════════════════════════════════════════════════
// ЭПИЗОДЫ
// ══════════════════════════════════════════════════════════════
interface EpisodeData {
  number: number; title: string; titleRu: string; thumbnail: string | null;
}

async function fetchKitsuEpisodes(malId: number): Promise<EpisodeData[]> {
  try {
    const mr = await fetch(`https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/anime&filter[externalId]=${malId}&include=item`);
    const md = await mr.json();
    const kid = md?.included?.[0]?.id;
    if (!kid) return [];
    const eps: EpisodeData[] = [];
    let url: string | null = `https://kitsu.io/api/edge/anime/${kid}/episodes?page[limit]=20&page[offset]=0&sort=number`;
    while (url && eps.length < 200) {
      const r = await fetch(url);
      const d = await r.json();
      d?.data?.forEach((ep: any) => {
        const rawTitle = ep.attributes?.titles?.en_jp || ep.attributes?.canonicalTitle || '';
        eps.push({ number: ep.attributes?.number || eps.length + 1, title: rawTitle, titleRu: rawTitle, thumbnail: ep.attributes?.thumbnail?.original || ep.attributes?.thumbnail?.large || null });
      });
      url = d?.links?.next || null;
    }
    return eps;
  } catch { return []; }
}

function useEpisodes(malId: number | null, totalEps: number) {
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!malId || totalEps === 0) { setEpisodes([]); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const ke = await fetchKitsuEpisodes(malId);
        if (cancelled) return;
        const result: EpisodeData[] = ke.length > 0 ? ke : Array.from({ length: totalEps || 12 }, (_, i) => ({
          number: i + 1, title: '', titleRu: `Серия ${i + 1}`, thumbnail: null,
        }));
        result.forEach(ep => { if (!ep.titleRu || ep.titleRu.trim() === '') ep.titleRu = `Серия ${ep.number}`; });
        if (!cancelled) setEpisodes(result);
      } catch {
        if (!cancelled) setEpisodes(Array.from({ length: totalEps || 12 }, (_, i) => ({
          number: i + 1, title: '', titleRu: `Серия ${i + 1}`, thumbnail: null,
        })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [malId, totalEps]);
  return { episodes, loading };
}

// ══════════════════════════════════════════════════════════════
// KODIK
// ══════════════════════════════════════════════════════════════
async function findWorkingKodikLink(shikiId: number): Promise<string | null> {
  try {
    const r = await fetch(`https://kodikapi.com/search?token=447d179e875efe44217f20d1ee2146be&shikimori_id=${shikiId}&types=anime-serial,anime&with_episodes=true&limit=1`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d?.results?.length > 0) {
      let link = d.results[0].link;
      if (link && !link.startsWith('http')) link = 'https:' + link;
      return link;
    }
  } catch {}
  return null;
}

// ══════════════════════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════════════════════
function ScreenshotLightbox({ screenshots, initialIndex, onClose }: {
  screenshots: { url: string; preview: string }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % screenshots.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + screenshots.length) % screenshots.length);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [screenshots.length, onClose]);
  useEffect(() => { setImgLoaded(false); }, [idx]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition z-10 border border-white/10"><Icons.X size={18} /></button>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + screenshots.length) % screenshots.length); }} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 border border-white/10"><Icons.ChevronLeft size={20} /></button>
      <motion.div key={idx} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="relative max-w-5xl max-h-[80vh] mx-12" onClick={e => e.stopPropagation()}>
        {!imgLoaded && (<div className="absolute inset-0 flex items-center justify-center"><Icons.Loader size={28} className="text-indigo-500" /></div>)}
        <img src={screenshots[idx].url || screenshots[idx].preview} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10" alt="" onLoad={() => setImgLoaded(true)} style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }} />
      </motion.div>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % screenshots.length); }} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 border border-white/10"><Icons.ChevronRight size={20} /></button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {screenshots.map((_, i) => (<button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} className={`h-0.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />))}
      </div>
      <div className="absolute bottom-5 right-5 text-[10px] text-white/30 font-black">{idx + 1} / {screenshots.length}</div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// HERO СЕКЦИЯ — автослайд только после конца опенинга
// ══════════════════════════════════════════════════════════════
function HeroSection({ heroes, loading, onGo }: {
  heroes: any[];
  loading: boolean;
  onGo: (id: number) => void;
}) {
  const [hi, setHi] = useState(0);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [videoReady, setVideoReady] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [userNavigated, setUserNavigated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimer = useRef<any>(null);

  const current = heroes[hi];

  // Переход на следующий слайд
  const goNext = useCallback(() => {
    setHi(p => (p + 1) % heroes.length);
    setUserNavigated(false);
  }, [heroes.length]);

  // После окончания видео — сразу переходим
  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);
    if (!userNavigated) {
      // небольшая пауза после конца опенинга
      fallbackTimer.current = setTimeout(() => {
        goNext();
      }, 1200);
    }
  }, [goNext, userNavigated]);

  // Если нет видео — используем таймер 10 сек
  useEffect(() => {
    if (heroes.length === 0) return;
    clearTimeout(fallbackTimer.current);
    setVideoEnded(false);
    setVideoReady(false);
    setLogoError(false);

    if (!current?.localVideo) {
      // Нет видео — автослайд через 10 сек
      fallbackTimer.current = setTimeout(() => {
        if (!userNavigated) goNext();
      }, 10000);
    }
    // Если есть видео — ждём videoEnded

    return () => clearTimeout(fallbackTimer.current);
  }, [hi, heroes.length, current?.localVideo]);

  // Сброс видео при смене слайда
  useEffect(() => {
    setVideoReady(false);
    setLogoError(false);
    setVideoEnded(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [hi]);

  // Громкость и muted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  const handleUserNav = useCallback((newIdx: number) => {
    clearTimeout(fallbackTimer.current);
    setUserNavigated(true);
    setHi(newIdx);
    // После ручной навигации — возобновляем авто через 12 сек
    fallbackTimer.current = setTimeout(() => {
      setUserNavigated(false);
    }, 12000);
  }, []);

  const handlePrev = useCallback(() => {
    handleUserNav((hi - 1 + heroes.length) % heroes.length);
  }, [hi, heroes.length, handleUserNav]);

  const handleNext = useCallback(() => {
    handleUserNav((hi + 1) % heroes.length);
  }, [hi, heroes.length, handleUserNav]);

  if (loading) return <HeroSkeleton />;

  if (heroes.length === 0) {
    return (
      <section className="relative h-[88vh] w-full flex items-end pb-14 px-5 lg:px-12 overflow-hidden bg-[#060608]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Icons.Loader size={32} className="text-indigo-500" />
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Загрузка...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[88vh] w-full overflow-hidden">
      {/* Фон */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${hi}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={current?.banner || current?.poster}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: (current?.localVideo && videoReady) ? 0 : 0.4,
              transition: 'opacity 1s ease',
              filter: 'contrast(1.15) saturate(1.3)',
            }}
            alt=""
          />
          {current?.localVideo && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: videoReady ? 0.5 : 0,
                transition: 'opacity 1s ease',
                filter: 'contrast(1.1) saturate(1.2)',
              }}
              autoPlay
              muted={muted}
              playsInline
              onCanPlay={() => setVideoReady(true)}
              onEnded={handleVideoEnded}
              onError={() => setVideoReady(false)}
            >
              <source src={current.localVideo} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-[#050505]/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/30 to-transparent" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 50%, ${current?.accentColor || '#6366f1'}08 0%, transparent 60%)` }} />
        </motion.div>
      </AnimatePresence>

      {/* Контент */}
      <div className="relative z-10 h-full flex items-end pb-16 px-5 lg:px-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${hi}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 15, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {(current?.heroGenres || current?.genres?.slice(0, 2) || []).map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
                  style={{ borderColor: `${current?.accentColor || '#6366f1'}50`, color: current?.accentColor || '#a5b4fc', background: `${current?.accentColor || '#6366f1'}12` }}>
                  {g}
                </span>
              ))}
              <RatingBadge val={current?.rating} />
              <span className="text-white/30 text-[9px] font-bold uppercase tracking-wider">
                {current?.year} · {current?.type}{current?.episodes && ` · ${current?.episodes} эп.`}
              </span>
            </div>

            {current?.localLogo && !logoError ? (
              <motion.img
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                src={current.localLogo} alt={current.title}
                className="max-h-28 max-w-sm object-contain mb-4 drop-shadow-2xl"
                onError={() => setLogoError(true)}
              />
            ) : (
              <motion.h1
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter font-syne mb-3 leading-[0.92]"
                style={{ textShadow: `0 0 60px ${current?.accentColor || '#6366f1'}40` }}
              >
                {current?.title}
              </motion.h1>
            )}

            {current?.titleNative && <p className="text-white/15 text-sm mb-3 font-light tracking-wider">{current?.titleNative}</p>}

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-[13px] text-white/45 mb-6 leading-relaxed font-light line-clamp-3 max-w-lg"
            >
              {current?.descRu || current?.desc || 'Загрузка описания...'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex gap-3 flex-wrap"
            >
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onGo(current?.id)}
                className="px-7 py-3 text-white font-black rounded-2xl flex items-center gap-2.5 transition-all text-[10px] uppercase tracking-[0.2em] shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${current?.accentColor || '#6366f1'}, ${current?.accentColor || '#4f46e5'}cc)`, boxShadow: `0 0 30px ${current?.accentColor || '#6366f1'}40` }}
              >
                <Icons.Play size={15} fill="white" className="text-white" />Смотреть
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={() => onGo(current?.id)}
                className="px-7 py-3 bg-white/8 border border-white/15 text-white font-black rounded-2xl flex items-center gap-2.5 hover:bg-white/15 transition text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm"
              >
                <Icons.Eye size={15} />Подробнее
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Правые миниатюры */}
      <div className="absolute right-5 lg:right-10 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
        {heroes.map((h: any, i: number) => (
          <motion.button
            key={h.id}
            onClick={() => handleUserNav(i)}
            whileHover={{ scale: 1.08, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === hi ? 'border-white/60 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-70'}`}
            style={{ height: 88, ...(i === hi ? { boxShadow: `0 0 20px ${h.accentColor}60` } : {}) }}
          >
            <img src={h.poster} className="w-full h-full object-cover" alt="" />
            {i === hi && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
          </motion.button>
        ))}
      </div>

      {/* Нижние элементы */}
      <div className="absolute bottom-6 left-5 lg:left-14 z-20 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-2 rounded-full border border-white/10 bg-black/30 hover:bg-white/10 transition backdrop-blur-sm">
            <Icons.ChevronLeft size={14} />
          </button>
          <button onClick={handleNext} className="p-2 rounded-full border border-white/10 bg-black/30 hover:bg-white/10 transition backdrop-blur-sm">
            <Icons.ChevronRight size={14} />
          </button>
        </div>

        {/* Прогресс-точки */}
        <div className="flex items-center gap-1.5">
          {heroes.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => handleUserNav(i)}
              className="relative overflow-hidden rounded-full transition-all duration-500"
              style={{ width: i === hi ? 28 : 6, height: 4, background: i === hi ? (current?.accentColor || '#6366f1') : 'rgba(255,255,255,0.15)' }}
            >
              {i === hi && !userNavigated && current?.localVideo && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 90, ease: 'linear' }}
                  key={`prog-${hi}`}
                />
              )}
              {i === hi && !current?.localVideo && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  key={`prog-fallback-${hi}`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Улучшенная кнопка громкости */}
        {current?.localVideo && (
          <VolumeButton
            muted={muted}
            volume={volume}
            onMuteToggle={() => setMuted(m => !m)}
            onVolumeChange={(v) => { setVolume(v); if (v > 0) setMuted(false); }}
          />
        )}
      </div>

      {/* Индикатор прогресса видео */}
      {current?.localVideo && videoReady && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 z-20">
          <motion.div
            className="h-full rounded-full"
            style={{ background: current?.accentColor || '#6366f1' }}
            initial={{ width: '0%' }}
            animate={{ width: videoEnded ? '100%' : '0%' }}
            transition={{ duration: videoEnded ? 0 : 90, ease: 'linear' }}
            key={`bar-${hi}`}
          />
        </div>
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// UI КОМПОНЕНТЫ
// ══════════════════════════════════════════════════════════════
function TiltPoster({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' });
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 });
  const [imgError, setImgError] = useState(false);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setStyle({ transform: `perspective(800px) rotateX(${(0.5 - y) * 18}deg) rotateY(${(x - 0.5) * 18}deg) scale3d(1.04,1.04,1.04)` });
    setGlare({ x: x * 100, y: y * 100, o: 0.15 });
  }, []);
  const onLeave = useCallback(() => {
    setStyle({ transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
    setGlare({ x: 50, y: 50, o: 0 });
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`relative ${className}`}
      style={{ ...style, transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d' }}>
      {src && !imgError ? (
        <img src={src} className="w-full h-full rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 object-cover" alt="" onError={() => setImgError(true)} />
      ) : (
        <div className="w-full aspect-[2/3] rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-3">
          <Icons.Image size={32} className="text-white/10" />
          <span className="text-[9px] text-white/15 font-bold uppercase tracking-wider">Нет постера</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.o}), transparent 60%)` }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// НОВЫЙ VIDEO PLAYER — AniLibria HLS + Kodik fallback
// ══════════════════════════════════════════════════════════════
import { searchAniLibria, getEpisodeHlsUrl, getEpisodesArray } from '@/lib/anilibria';
import type { AniLibriaTitle, AniLibriaEpisode } from '@/lib/anilibria';
import HlsPlayer from '@/components/HlsPlayer';

type PlayerSource = 'anilibria' | 'kodik' | 'loading' | 'error';

function VideoPlayer({
  det,
  onClose,
  onSwitchSeason,
}: {
  det: any;
  onClose: () => void;
  onSwitchSeason: (id: number) => void;
}) {
  const [currentEp, setCurrentEp] = useState(det._startEp || 1);
  const [activeTab, setActiveTab] = useState<'episodes' | 'seasons'>('episodes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Источник
  const [source, setSource] = useState<PlayerSource>('loading');
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [kodikUrl, setKodikUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // AniLibria данные
  const [aliTitle, setAliTitle] = useState<AniLibriaTitle | null>(null);
  const [aliEpisodes, setAliEpisodes] = useState<AniLibriaEpisode[]>([]);
  const [quality, setQuality] = useState<'fhd' | 'hd' | 'sd'>('hd');
  const [qualityOpen, setQualityOpen] = useState(false);

  const shikiId = det.shikiId || det.malId || det.id;
  const totalEps = det.episodes || 1;

  const allSeasons = useMemo(() => {
    const seqPre =
      det.relations?.filter((r: any) =>
        ['sequel', 'prequel'].includes(r.relationType)
      ) || [];
    return [{ ...det, isCurrent: true }, ...seqPre].sort(
      (a: any, b: any) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0)
    );
  }, [det.relations]);

  // ── Инициализация: ищем в AniLibria
  useEffect(() => {
    let cancelled = false;
    setSource('loading');
    setHlsUrl(null);
    setKodikUrl(null);
    setIframeLoaded(false);
    setAliTitle(null);
    setAliEpisodes([]);

    (async () => {
      // 1. Пробуем AniLibria
      try {
        const found = await searchAniLibria(
          det.titleRu || det.title,
          det.titleEnglish || det.titleRomaji || '',
          det.titleRomaji
        );

        if (found && !cancelled) {
          const episodes = getEpisodesArray(found);
          setAliTitle(found);
          setAliEpisodes(episodes);

          // Берём нужный эпизод
          const ep = det._startEp || 1;
          const url = getEpisodeHlsUrl(found, ep, 'hd');
          if (url) {
            setHlsUrl(url);
            setSource('anilibria');
            return;
          }
        }
      } catch {}

      // 2. Fallback — Kodik
      if (!cancelled) {
        try {
          const kl = await findWorkingKodikLink(shikiId);
          if (kl && !cancelled) {
            setKodikUrl(kl);
            setSource('kodik');
            return;
          }
        } catch {}
      }

      // 3. Kodik по названию
      if (!cancelled) {
        const fallback = shikiId
          ? `https://kodik.info/find-player?shikimoriID=${shikiId}&episode=${det._startEp || 1}&only_season=false`
          : `https://kodik.info/find-player?title=${encodeURIComponent(det.titleRomaji || det.title)}&episode=${det._startEp || 1}`;
        setKodikUrl(fallback);
        setSource('kodik');
      }
    })();

    return () => { cancelled = true; };
  }, [det.id]);

  // ── Смена эпизода
  const handleEpChange = useCallback(
    (ep: number) => {
      setCurrentEp(ep);
      setIframeLoaded(false);

      if (aliTitle) {
        const url = getEpisodeHlsUrl(aliTitle, ep, quality);
        if (url) {
          setHlsUrl(url);
          setSource('anilibria');
          return;
        }
      }

      // Kodik fallback
      if (shikiId) {
        setKodikUrl(
          `https://kodik.info/find-player?shikimoriID=${shikiId}&episode=${ep}&only_season=false`
        );
        setSource('kodik');
      }
    },
    [aliTitle, quality, shikiId]
  );

  // ── Смена качества (только AniLibria)
  const handleQualityChange = useCallback(
    (q: 'fhd' | 'hd' | 'sd') => {
      setQuality(q);
      setQualityOpen(false);
      if (aliTitle) {
        const url = getEpisodeHlsUrl(aliTitle, currentEp, q);
        if (url) setHlsUrl(url);
      }
    },
    [aliTitle, currentEp]
  );

  // ── Проверка доступных качеств
  const availableQualities = useMemo(() => {
    if (!aliTitle) return [];
    const ep = aliTitle.player.list[String(currentEp)];
    if (!ep) return [];
    return (['fhd', 'hd', 'sd'] as const).filter((q) => !!ep.hls[q]);
  }, [aliTitle, currentEp]);

  const qualityLabels = { fhd: '1080p', hd: '720p', sd: '480p' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[600] bg-[#050505] flex flex-col lg:flex-row overflow-hidden"
    >
      {/* ── Основная область плеера */}
      <div className="flex-1 flex flex-col relative bg-black min-h-0">

        {/* Топ-бар */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="absolute top-0 w-full z-50 p-3 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/40 to-transparent"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/15 rounded-full transition backdrop-blur-xl border border-white/10"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase italic tracking-tighter truncate">
                {det.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Серия {currentEp} из {totalEps}
                </p>
                {/* Бейдж источника */}
                {source === 'anilibria' && (
                  <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    AniLibria
                  </span>
                )}
                {source === 'kodik' && (
                  <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5 text-white/30 border border-white/10">
                    Kodik
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Переключатель качества (только AniLibria) */}
            {source === 'anilibria' && availableQualities.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setQualityOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/15 rounded-full transition border border-white/10 text-[10px] font-black"
                >
                  {qualityLabels[quality]}
                  <Icons.ChevronDown size={10} />
                </button>
                <AnimatePresence>
                  {qualityOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute top-full right-0 mt-1.5 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[80px]"
                    >
                      {availableQualities.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQualityChange(q)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase transition hover:bg-white/10 ${
                            quality === q
                              ? 'text-indigo-400 bg-indigo-500/10'
                              : 'text-white/60'
                          }`}
                        >
                          {quality === q && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          )}
                          {qualityLabels[q]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-white/5 hover:bg-white/15 rounded-full transition backdrop-blur-xl border border-white/10 lg:hidden"
            >
              <Icons.Grid size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/15 rounded-full transition backdrop-blur-xl border border-white/10"
            >
              <Icons.X size={16} />
            </button>
          </div>
        </motion.div>

        {/* ── Область видео */}
        <div className="flex-1 relative">

          {/* Загрузка */}
          {source === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808] gap-4 z-10">
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(99,102,241,0.1)',
                      '0 0 40px rgba(99,102,241,0.3)',
                      '0 0 20px rgba(99,102,241,0.1)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icons.Play size={28} className="text-indigo-400 ml-1" fill="currentColor" />
                </motion.div>
                <motion.div
                  className="absolute -inset-2 rounded-2xl border border-indigo-500/20"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">
                Поиск источника...
              </p>
            </div>
          )}

          {/* Ошибка */}
          {source === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808] gap-4 z-10">
              <Icons.AlertTriangle size={36} className="text-amber-500" />
              <p className="text-white/50 text-sm font-bold">Плеер недоступен</p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition"
              >
                Закрыть
              </button>
            </div>
          )}

          {/* AniLibria HLS */}
          {source === 'anilibria' && hlsUrl && (
            <HlsPlayer
              key={`${hlsUrl}-${currentEp}`}
              src={hlsUrl}
              className="w-full h-full"
              onError={() => {
                // Fallback на Kodik
                if (shikiId) {
                  setKodikUrl(
                    `https://kodik.info/find-player?shikimoriID=${shikiId}&episode=${currentEp}&only_season=false`
                  );
                  setSource('kodik');
                } else {
                  setSource('error');
                }
              }}
            />
          )}

          {/* Kodik iframe */}
          {source === 'kodik' && kodikUrl && (
            <>
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808] gap-4 z-10">
                  <motion.div
                    className="w-20 h-20 rounded-2xl border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(99,102,241,0.1)',
                        '0 0 40px rgba(99,102,241,0.3)',
                        '0 0 20px rgba(99,102,241,0.1)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icons.Play size={28} className="text-indigo-400 ml-1" fill="currentColor" />
                  </motion.div>
                  <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">
                    Загрузка Kodik...
                  </p>
                </div>
              )}
              <iframe
                key={kodikUrl}
                src={kodikUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
                onLoad={() => setIframeLoaded(true)}
                style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.4s' }}
              />
            </>
          )}
        </div>

        {/* ── Нижняя панель */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between gap-3"
        >
          <button
            disabled={currentEp <= 1}
            onClick={() => handleEpChange(currentEp - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold hover:bg-white/10 disabled:opacity-20 transition border border-white/5"
          >
            <Icons.SkipBack size={14} /> Назад
          </button>

          <div className="hidden sm:flex items-center gap-3 flex-1 justify-center">
            <span className="text-xs font-black text-white/30 tracking-widest tabular-nums">
              {currentEp}/{totalEps}
            </span>
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                animate={{ width: `${(currentEp / totalEps) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <button
            disabled={currentEp >= totalEps}
            onClick={() => handleEpChange(currentEp + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-500 disabled:opacity-20 transition shadow-lg shadow-indigo-600/20"
          >
            Далее <Icons.SkipForward size={14} />
          </button>
        </motion.div>
      </div>

      {/* ── Сайдбар */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full lg:w-[340px] bg-[#0a0a0a] border-l border-white/5 flex flex-col shrink-0 max-h-[40vh] lg:max-h-none"
          >
            <div className="flex border-b border-white/5 shrink-0">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition ${
                  activeTab === 'episodes'
                    ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500'
                    : 'text-white/20'
                }`}
              >
                Эпизоды ({totalEps})
              </button>
              <button
                onClick={() => setActiveTab('seasons')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition ${
                  activeTab === 'seasons'
                    ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500'
                    : 'text-white/20'
                }`}
              >
                Сезоны ({allSeasons.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-1">
              {activeTab === 'episodes' ? (
                Array.from({ length: totalEps }, (_, i) => i + 1).map((num) => {
                  const aliEp = aliEpisodes.find((e) => e.episode === num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleEpChange(num)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl border transition ${
                        currentEp === num
                          ? 'bg-indigo-600/20 border-indigo-500/50'
                          : 'bg-white/[0.02] border-transparent hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {/* Превью эпизода если есть */}
                      {aliEp?.preview ? (
                        <div className="w-12 h-7 rounded-lg overflow-hidden shrink-0 border border-white/5">
                          <img
                            src={`https://cache.libria.fun${aliEp.preview}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                            currentEp === num
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {num}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-tight truncate">
                          {aliEp?.name || `Серия ${num}`}
                        </p>
                        {/* Индикатор скипов */}
                        {aliEp?.skips?.opening?.length > 0 && (
                          <p className="text-[8px] text-indigo-400/50 mt-0.5">
                            Пропуск опенинга
                          </p>
                        )}
                      </div>

                      {currentEp === num && (
                        <div className="ml-auto flex gap-0.5 shrink-0">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-0.5 bg-indigo-500 rounded-full"
                              animate={{ height: [4, 12, 4] }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : allSeasons.length > 1 ? (
                <div className="space-y-1.5">
                  {allSeasons.map((s: any, idx: number) => {
                    const isCurrent = s.isCurrent || s.id === det.id;
                    return (
                      <motion.button
                        key={s.id || idx}
                        whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { if (!isCurrent) onSwitchSeason(s.id); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group ${
                          isCurrent
                            ? 'bg-indigo-600/15 border-indigo-500/40 cursor-default'
                            : 'bg-white/[0.02] border-white/8 hover:border-indigo-500/40 hover:bg-white/[0.05] cursor-pointer'
                        }`}
                      >
                        <div
                          className={`relative w-12 h-16 rounded-xl overflow-hidden border shrink-0 ${
                            isCurrent ? 'border-indigo-500/40' : 'border-white/10'
                          }`}
                        >
                          {s.poster ? (
                            <img src={s.poster} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <span className="text-xs font-black text-white/20">{idx + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-400' : 'text-white/30'}`}>
                            Сезон {idx + 1}
                            {isCurrent && <span className="ml-1.5 text-[8px] bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded-md">Текущий</span>}
                          </p>
                          <p className={`text-[11px] font-bold truncate mt-0.5 ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                            {s.titleRu || s.title}
                          </p>
                          {s.year && (
                            <p className="text-[9px] text-white/25 mt-0.5">
                              {s.year}{s.episodes && ` · ${s.episodes} эп.`}
                            </p>
                          )}
                        </div>
                        {!isCurrent && (
                          <Icons.ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Icons.Film size={24} className="text-white/10" />
                  <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest">Один сезон</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// ЖАНРЫ
// ══════════════════════════════════════════════════════════════
const GENRES_SHIKI = [
  { id: '1', name: 'Экшен', en: 'Action' }, { id: '2', name: 'Приключения', en: 'Adventure' },
  { id: '4', name: 'Комедия', en: 'Comedy' }, { id: '8', name: 'Драма', en: 'Drama' },
  { id: '10', name: 'Фэнтези', en: 'Fantasy' }, { id: '14', name: 'Ужасы', en: 'Horror' },
  { id: '18', name: 'Меха', en: 'Mecha' }, { id: '19', name: 'Музыка', en: 'Music' },
  { id: '7', name: 'Мистика', en: 'Mystery' }, { id: '40', name: 'Психологическое', en: 'Psychological' },
  { id: '22', name: 'Романтика', en: 'Romance' }, { id: '24', name: 'Фантастика', en: 'Sci-Fi' },
  { id: '36', name: 'Повседневность', en: 'Slice of Life' }, { id: '30', name: 'Спорт', en: 'Sports' },
  { id: '37', name: 'Сверхъестественное', en: 'Supernatural' }, { id: '41', name: 'Триллер', en: 'Thriller' },
];

const GENRE_ICONS: Record<string, string> = {
  "Экшен": "⚡", "Приключения": "🗺️", "Комедия": "😄", "Драма": "🎭",
  "Фэнтези": "✨", "Ужасы": "👻", "Мистика": "🔍", "Психологическое": "🧠",
  "Романтика": "💖", "Фантастика": "🚀", "Повседневность": "🌸",
  "Спорт": "⚽", "Сверхъестественное": "🌙", "Триллер": "🔪", "Меха": "🤖", "Музыка": "🎵",
};

function RatingBadge({ val }: { val: number }) {
  if (!val) return null;
  if (val >= 9) return <div className="bg-black border border-amber-400 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black shadow-[0_0_10px_rgba(251,191,36,0.3)]">{val.toFixed(1)}</div>;
  if (val >= 7) return <div className="bg-black/60 border border-green-500/30 text-green-400 px-2 py-0.5 rounded text-[10px] font-black">{val.toFixed(1)}</div>;
  return <div className="bg-black/60 border border-white/10 text-gray-400 px-2 py-0.5 rounded text-[10px] font-black">{val.toFixed(1)}</div>;
}

function Spinner({ text = "Загрузка..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <motion.div className="w-14 h-14 rounded-2xl border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5"
          animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.1)', '0 0 30px rgba(99,102,241,0.25)', '0 0 15px rgba(99,102,241,0.1)'] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <Icons.Loader size={22} className="text-indigo-400" />
        </motion.div>
      </div>
      <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.3em]">{text}</p>
    </div>
  );
}

function Skel() {
  return (
    <div className="aspect-[3/4.2] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5">
      <motion.div className="w-full h-full bg-gradient-to-b from-white/[0.06] to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}

type CatalogMode = 'all' | 'genre' | 'seasonal' | 'trending' | 'topRated' | 'movies' | 'upcoming' | 'finished';
interface CatalogState { mode: CatalogMode; genreId?: string; genreName?: string; season?: string; year?: number; title: string; }

function Card({ a, go }: { a: any; go: () => void }) {
  const [h, setH] = useState(false);
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={go}
      animate={{ y: h ? -6 : 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-shadow"
    >
      {a.poster && !imgError ? (
        <motion.img src={a.poster}
          animate={{ scale: h ? 1.07 : 1, filter: h ? 'blur(4px) brightness(0.6)' : 'blur(0px) brightness(1)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover" alt="" loading="lazy"
          onError={() => setImgError(true)} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 flex flex-col items-center justify-center gap-2">
          <Icons.Film size={24} className="text-white/10" />
          <span className="text-[8px] text-white/15 font-bold uppercase text-center px-2">{a.title}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <motion.div animate={{ opacity: h ? 1 : 0 }} transition={{ duration: 0.25 }} className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.05) 90%, transparent 100%)' }} />
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1"><RatingBadge val={a.rating} /></div>
      <motion.div animate={{ opacity: h ? 1 : 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 p-2.5 flex flex-col justify-end z-10">
        <h4 className="text-[11px] lg:text-xs font-black mb-0.5 uppercase leading-tight italic font-syne tracking-tighter line-clamp-2">{a.title}</h4>
        {a.studio && <p className="text-indigo-400/70 text-[8px] font-black uppercase tracking-widest mb-1">{a.studio}</p>}
        <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/40 mb-1 uppercase">
          <span>{a.year}</span><span className="w-0.5 h-0.5 rounded-full bg-white/20" /><span>{a.type}</span>
          {a.episodes && <><span className="w-0.5 h-0.5 rounded-full bg-white/20" /><span>{a.episodes} эп.</span></>}
        </div>
        <div className="flex flex-wrap gap-0.5 mb-2">
          {a.genres?.slice(0, 2).map((g: string) => (<span key={g} className="text-[7px] uppercase tracking-wider text-white/30 border border-white/10 px-1 py-0.5 rounded-full">{g}</span>))}
        </div>
        <button className="w-full py-1.5 bg-white text-black rounded-lg font-black text-[9px] uppercase tracking-[0.15em] hover:bg-indigo-100 active:scale-95 transition-all">Подробнее</button>
      </motion.div>
    </motion.div>
  );
}

function Row({ t, ic, d, l, onM, go }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <section className="px-4 lg:px-10">
      <div className="flex justify-between items-center mb-4 lg:mb-5">
        <div className="flex items-center gap-2 lg:gap-2.5">
          <div className="h-6 lg:h-7 w-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
          {ic}
          <h3 className="text-base lg:text-xl font-black uppercase italic tracking-tighter font-syne">{t}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })} className="w-7 h-7 rounded-full border border-white/5 hidden lg:flex items-center justify-center hover:bg-white/10 transition"><Icons.ChevronLeft size={13} /></button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })} className="w-7 h-7 rounded-full border border-white/5 hidden lg:flex items-center justify-center hover:bg-white/10 transition"><Icons.ChevronRight size={13} /></button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onM} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 hover:border-white/15 transition-all">Все <Icons.ChevronRight size={10} /></motion.button>
        </div>
      </div>
      {l ? (
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {Array(6).fill(0).map((_, i) => <div key={i} className="min-w-[140px] lg:min-w-[165px] shrink-0"><Skel /></div>)}
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {d.map((a: any) => (<div key={a.id} className="min-w-[140px] lg:min-w-[165px] shrink-0"><Card a={a} go={() => go(a.id)} /></div>))}
          {d.length === 0 && <p className="text-white/15 py-6 text-xs">Нет данных</p>}
        </div>
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ══════════════════════════════════════════════════════════════
export default function AnivexPlatform() {
  const { user } = useUser();
  const { signOut, session } = useClerk();
  const [, setLocation] = useLocation();

  const [tab, setTab] = useState<'home' | 'catalog' | 'detail' | 'mylist'>('home');
  const [sf, setSf] = useState(false);
  const [sq, setSq] = useState("");
  const [sid, setSid] = useState<number | null>(null);
  const [cp, setCp] = useState(1);
  const [acd, setAcd] = useState<any[]>([]);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerStartEp, setPlayerStartEp] = useState(1);
  const [catalogState, setCatalogState] = useState<CatalogState>({ mode: 'all', title: 'Каталог' });
  const [logoMenu, setLogoMenu] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [animeListStats, setAnimeListStats] = useState<Record<string, number>>({});
  const [lightboxScreenshots, setLightboxScreenshots] = useState<{ url: string; preview: string }[] | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const logoRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const dq = useDebounce(sq, 400);
  const { season: cs, year: cy } = getCurrentSeason();

  const { heroes, loading: heroesLoading } = useHeroAnimes();

  const { data: td, loading: tl } = useShikiList('trend', { order: 'popularity', limit: 15, page: 1, status: 'ongoing', censored: true });
  const { data: pd, loading: pl } = useShikiList('pop', { order: 'popularity', limit: 15, page: 1, censored: true });
  const { data: rd, loading: rl } = useShikiList('top', { order: 'ranked', limit: 15, page: 1, status: 'released', censored: true });
  const { data: sd, loading: sl } = useShikiList('sea', { order: 'popularity', limit: 15, page: 1, season: `${cs}_${cy}`, censored: true });
  const { data: ud, loading: ul } = useShikiList('upcoming', { order: 'popularity', limit: 15, page: 1, status: 'anons', censored: true });
  const { data: md, loading: ml } = useShikiList('movies', { order: 'popularity', limit: 15, page: 1, kind: 'movie', censored: true });
  const { data: fd, loading: fl } = useShikiList('finished', { order: 'aired_on', limit: 15, page: 1, status: 'released', censored: true });
  const { data: romD, loading: romL } = useShikiList('rom', { order: 'popularity', limit: 15, page: 1, genre: '22', censored: true });
  const { data: actD, loading: actL } = useShikiList('act', { order: 'popularity', limit: 15, page: 1, genre: '1', censored: true });
  const { data: comD, loading: comL } = useShikiList('com', { order: 'popularity', limit: 15, page: 1, genre: '4', censored: true });
  const { data: fantD, loading: fantL } = useShikiList('fant', { order: 'popularity', limit: 15, page: 1, genre: '10', censored: true });

  const { data: sr, loading: srl } = useShikiSearch(dq);

  const catalogParams = useMemo((): ShikiParams => {
    const base: ShikiParams = { limit: 50, page: cp, censored: true };
    switch (catalogState.mode) {
      case 'trending': return { ...base, order: 'popularity', status: 'ongoing' };
      case 'topRated': return { ...base, order: 'ranked', status: 'released' };
      case 'movies': return { ...base, order: 'popularity', kind: 'movie' };
      case 'upcoming': return { ...base, order: 'popularity', status: 'anons' };
      case 'finished': return { ...base, order: 'aired_on', status: 'released' };
      case 'seasonal': return { ...base, order: 'popularity', season: `${catalogState.season || cs}_${catalogState.year || cy}` };
      case 'genre': return { ...base, order: 'popularity', genre: catalogState.genreId };
      default: return { ...base, order: 'popularity' };
    }
  }, [catalogState, cp, cs, cy]);

  const { data: cd, loading: cl } = useShikiList(
    `cat-${catalogState.mode}-${catalogState.genreId || ''}-${catalogState.season || ''}-${catalogState.year || ''}-${cp}`,
    catalogParams, tab === 'catalog'
  );

  useEffect(() => {
    if (cd.length > 0) {
      if (cp === 1) setAcd(cd);
      else setAcd(p => { const ids = new Set(p.map((a: any) => a.id)); return [...p, ...cd.filter((a: any) => !ids.has(a.id))]; });
    }
  }, [cd, cp]);
  useEffect(() => { setCp(1); setAcd([]); }, [catalogState]);

  const { data: det, loading: dl, error: de } = useShikiDetail(tab === 'detail' ? sid : null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (logoRef.current && !logoRef.current.contains(e.target as Node)) setLogoMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSf(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setTokenProvider(() => session?.getToken() ?? Promise.resolve(null));
  }, [session]);

  useEffect(() => {
    if (!user) return;
    api.animelist.getAll().then(items => {
      const stats: Record<string, number> = {};
      items.forEach((item: any) => { stats[item.status] = (stats[item.status] || 0) + 1; });
      setAnimeListStats(stats);
    }).catch(() => {});
  }, [user, listRefreshKey]);

  const navigate = useCallback((newTab: 'home' | 'catalog' | 'detail' | 'mylist') => {
    setTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const go = useCallback((id: number) => {
    setSid(id); navigate('detail'); setPlayerOpen(false); setLogoMenu(false);
  }, [navigate]);

  const openPlayer = useCallback((ep: number = 1) => { setPlayerStartEp(ep); setPlayerOpen(true); }, []);

  const goToCatalog = useCallback((state: CatalogState) => {
    setCatalogState(state); navigate('catalog'); setLogoMenu(false);
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate('home'); setSid(null); setPlayerOpen(false); setLogoMenu(false);
  }, [navigate]);

  const openRandomAnime = useCallback(async () => {
    setRandomLoading(true); setLogoMenu(false);
    try {
      const rp = Math.floor(Math.random() * 50) + 1;
      const results = await shikiGetAnimes({ order: 'ranked', limit: 1, page: rp, status: 'released', score: 7, censored: true });
      if (results?.[0]) go(results[0].id);
      else if (td.length > 0) go(td[Math.floor(Math.random() * td.length)].id);
    } catch {
      if (td.length > 0) go(td[Math.floor(Math.random() * td.length)].id);
    } finally { setRandomLoading(false); }
  }, [td, go]);

  const openLightbox = useCallback((screenshots: { url: string; preview: string }[], idx: number) => {
    setLightboxScreenshots(screenshots);
    setLightboxIdx(idx);
  }, []);

  const pageVariants = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        .font-syne{font-family:'Syne',sans-serif}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        * { box-sizing: border-box; }
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:#fff;margin-top:-4px;}
        input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:rgba(255,255,255,0.1);}
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-[300] flex items-center justify-between px-5 lg:px-10 py-3.5 backdrop-blur-3xl bg-black/60 border-b border-white/[0.06]">
        <div className="flex items-center gap-5 lg:gap-8">
          <div ref={logoRef} className="relative">
            <button onMouseEnter={() => setLogoMenu(true)} onClick={() => setLogoMenu(v => !v)} className="flex items-center gap-1.5 group">
              <span className="text-xl lg:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase select-none">ANIVEX</span>
              <motion.div animate={{ rotate: logoMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <Icons.ChevronDown size={13} className="text-white/20 group-hover:text-white/50 transition mt-0.5" />
              </motion.div>
            </button>
            <AnimatePresence>
              {logoMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }} onMouseLeave={() => setLogoMenu(false)}
                  className="absolute top-full left-0 mt-2.5 w-64 bg-[#0F0F11]/98 backdrop-blur-2xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 z-[500]"
                >
                  <div className="p-3 pb-2 border-b border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/15">Навигация</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {[
                      { fn: goHome, icon: <Icons.Home size={14} className="text-indigo-400" />, bg: 'bg-indigo-500/10', t: 'Главная', d: 'На главную страницу', active: tab === 'home' },
                      { fn: () => goToCatalog({ mode: 'all', title: 'Каталог' }), icon: <Icons.Grid size={14} className="text-cyan-400" />, bg: 'bg-cyan-500/10', t: 'Каталог', d: 'Все аниме с жанрами', active: tab === 'catalog' },
                      { fn: () => { navigate('mylist'); setLogoMenu(false); }, icon: <Icons.Layers size={14} className="text-violet-400" />, bg: 'bg-violet-500/10', t: 'Мой список', d: 'Твои аниме и статусы', active: tab === 'mylist' },
                      { fn: openRandomAnime, icon: randomLoading ? <Icons.Loader size={14} className="text-amber-400" /> : <Icons.Shuffle size={14} className="text-amber-400" />, bg: 'bg-amber-500/10', t: 'Случайное аниме', d: 'Открыть случайное аниме', active: false },
                      { fn: () => goToCatalog({ mode: 'seasonal', season: cs, year: cy, title: `${SeasonMap[cs]} ${cy}` }), icon: <Icons.Calendar size={14} className="text-emerald-400" />, bg: 'bg-emerald-500/10', t: `Сезон — ${SeasonMap[cs]}`, d: `Аниме сезона ${cy}`, active: false },
                      { fn: () => goToCatalog({ mode: 'topRated', title: 'Топ рейтинг' }), icon: <Icons.Star size={14} className="text-rose-400" />, bg: 'bg-rose-500/10', t: 'Топ рейтинг', d: 'Лучшие по оценкам', active: false },
                    ].map((item, idx) => (
                      <button key={idx} onClick={item.fn} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition group ${item.active ? 'bg-indigo-600/10' : 'hover:bg-white/[0.04]'}`}>
                        <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>{item.icon}</div>
                        <div className="text-left flex-1 min-w-0">
                          <p className={`text-[12px] font-bold truncate ${item.active ? 'text-indigo-400' : 'text-white'}`}>{item.t}</p>
                          <p className="text-[9px] text-white/20 truncate">{item.d}</p>
                        </div>
                        {item.active && <div className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="mx-3 my-1 h-px bg-white/5" />
                  <div className="p-2">
                    <a href="https://web.telegram.org/k/#@anivexlib" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition group">
                      <div className="w-7 h-7 rounded-lg bg-[#229ED9]/10 flex items-center justify-center shrink-0"><Icons.Send size={14} fill="currentColor" className="text-[#229ED9]" /></div>
                      <div className="text-left"><p className="text-[12px] font-bold">Telegram</p><p className="text-[9px] text-white/20">Наше сообщество</p></div>
                    </a>
                  </div>
                  <div className="p-2 pt-0 pb-2.5">
                    <p className="text-[7px] text-white/8 uppercase tracking-widest text-center">Anivex v2.0 — Shikimori</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-full p-1">
            {[
              { t: 'Главная', tb: 'home' as const, fn: goHome },
              { t: 'Каталог', tb: 'catalog' as const, fn: () => goToCatalog({ mode: 'all', title: 'Каталог' }) },
              { t: 'Мой список', tb: 'mylist' as const, fn: () => navigate('mylist') },
            ].map(({ t, tb, fn }) => (
              <button key={tb} onClick={fn} className={`relative px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-200 ${tab === tb ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
                {tab === tb && (<motion.div layoutId="navPill" className="absolute inset-0 bg-indigo-600 rounded-full" transition={{ type: 'spring', damping: 20, stiffness: 300 }} />)}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ПОИСК */}
          <div ref={searchRef} className="relative">
            <div className={`flex items-center bg-white/[0.04] border rounded-full transition-all duration-300 ${sf ? 'w-56 lg:w-72 border-indigo-500/50 bg-white/[0.06]' : 'w-36 lg:w-52 border-white/8 hover:border-white/15'}`}>
              <Icons.Search className="ml-3.5 text-white/25 shrink-0" size={14} />
              <input
                type="text"
                placeholder={sf ? "Поиск по-русски или по-английски..." : "Поиск..."}
                className="bg-transparent border-none outline-none py-2.5 px-2.5 w-full text-[12px] font-medium text-white placeholder:text-white/25"
                onFocus={() => setSf(true)}
                value={sq}
                onChange={e => setSq(e.target.value)}
              />
              {sf && sq && (
                <button className="mr-2.5 text-white/20 hover:text-white transition" onClick={() => setSq('')}>
                  <Icons.X size={12} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {sf && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 right-0 w-72 lg:w-80 bg-[#0F0F11]/98 backdrop-blur-2xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl z-[400]"
                >
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                      {dq ? `Результаты: «${dq}»` : 'Популярное прямо сейчас'}
                    </span>
                    {srl && dq && (
                      <div className="flex gap-0.5">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Скелетон поиска */}
                  {srl && dq ? (
                    <SearchSkeleton />
                  ) : (
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                      {(dq ? sr : td.slice(0, 7)).map((a: any) => (
                        <div key={a.id} onClick={() => { go(a.id); setSf(false); setSq(""); }}
                          className="flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] px-3 py-2.5 transition group">
                          {a.poster ? (
                            <img src={a.poster} className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/5" alt=""
                              onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-white/5 border border-white/5 shrink-0 flex items-center justify-center"><Icons.Film size={12} className="text-white/20" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold truncate group-hover:text-indigo-400 transition">{a.title}</p>
                            <p className="text-[9px] text-white/20 mt-0.5">{a.year} • {a.type}</p>
                          </div>
                          <RatingBadge val={a.rating} />
                        </div>
                      ))}
                      {dq && sr.length === 0 && !srl && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Icons.Search size={20} className="text-white/10" />
                          <p className="text-white/20 text-[11px]">Ничего не найдено</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Show when="signed-out">
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => setLocation(`${basePath}/sign-up`)} className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-transparent hover:border-white/10 transition-all">Регистрация</button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setLocation(`${basePath}/sign-in`)} className="px-4 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-white/20 transition-all">Войти</motion.button>
            </div>
          </Show>
          <Show when="signed-in">
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenuOpen(v => !v)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition">
                {user?.imageUrl ? (<img src={user.imageUrl} className="w-6 h-6 rounded-full object-cover" alt="" />) : (<div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center"><Icons.User size={12} className="text-white" /></div>)}
                <span className="text-[10px] font-bold text-white/70 hidden sm:block max-w-[80px] truncate">{user?.firstName || user?.username || 'Профиль'}</span>
                <Icons.ChevronDown size={11} className="text-white/30" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-52 bg-[#0F0F11]/98 backdrop-blur-2xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl z-[500]"
                  >
                    <div className="p-3 border-b border-white/5 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5">
                        {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><Icons.User size={16} className="text-white/30" /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white truncate">{user?.firstName || user?.username || 'Аниматор'}</p>
                        <p className="text-[9px] text-white/30 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <button onClick={() => { setProfileOpen(true); setUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition text-white/60 hover:text-white text-left">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Icons.User size={12} className="text-indigo-400" /></div>
                        <span className="text-[12px] font-bold">Профиль</span>
                      </button>
                      <button onClick={() => { navigate('mylist'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition text-white/60 hover:text-white text-left">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Icons.Layers size={12} className="text-cyan-400" /></div>
                        <span className="text-[12px] font-bold">Мой список</span>
                        {Object.keys(animeListStats).length > 0 && (<span className="ml-auto text-[9px] text-white/30 bg-white/5 px-1.5 rounded-md">{Object.values(animeListStats).reduce((a, b) => a + b, 0)}</span>)}
                      </button>
                    </div>
                    <div className="mx-2 my-1 h-px bg-white/5" />
                    <div className="p-2">
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-red-500/5 transition text-white/40 hover:text-red-400 text-left">
                        <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center"><Icons.LogOut size={12} className="text-red-400" /></div>
                        <span className="text-[12px] font-bold">Выйти</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Show>
        </div>
      </nav>

      {/* PAGES */}
      <AnimatePresence mode="wait">
        {/* HOME */}
        {tab === 'home' && (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <HeroSection heroes={heroes} loading={heroesLoading} onGo={go} />
            <div className="py-8 space-y-14 pb-32">
              <Row t={`Сезон ${SeasonMap[cs]} ${cy}`} ic={<Icons.Calendar size={17} className="text-indigo-400" />} d={sd} l={sl} onM={() => goToCatalog({ mode: 'seasonal', season: cs, year: cy, title: `Сезон ${SeasonMap[cs]} ${cy}` })} go={go} />
              <Row t="Онгоинги" ic={<Icons.TrendingUp size={17} className="text-rose-400" />} d={td} l={tl} onM={() => goToCatalog({ mode: 'trending', title: 'Онгоинги' })} go={go} />
              <Row t="Топ по рейтингу" ic={<Icons.Star size={17} className="text-amber-400" />} d={rd} l={rl} onM={() => goToCatalog({ mode: 'topRated', title: 'Топ по рейтингу' })} go={go} />
              <Row t="Популярное" ic={<Icons.Sparkles size={17} className="text-cyan-400" />} d={pd} l={pl} onM={() => goToCatalog({ mode: 'all', title: 'Популярное' })} go={go} />
              <Row t="Аниме фильмы" ic={<Icons.Film size={17} className="text-purple-400" />} d={md} l={ml} onM={() => goToCatalog({ mode: 'movies', title: 'Аниме фильмы' })} go={go} />
              <Row t="Скоро выйдут" ic={<Icons.Clock size={17} className="text-emerald-400" />} d={ud} l={ul} onM={() => goToCatalog({ mode: 'upcoming', title: 'Скоро выйдут' })} go={go} />
              <Row t="Недавно завершённые" ic={<Icons.Award size={17} className="text-orange-400" />} d={fd} l={fl} onM={() => goToCatalog({ mode: 'finished', title: 'Недавно завершённые' })} go={go} />
              <Row t="Романтика" ic={<Icons.Heart size={17} className="text-pink-400" />} d={romD} l={romL} onM={() => goToCatalog({ mode: 'genre', genreId: '22', genreName: 'Романтика', title: 'Романтика' })} go={go} />
              <Row t="Экшен" ic={<Icons.Zap size={17} className="text-red-400" />} d={actD} l={actL} onM={() => goToCatalog({ mode: 'genre', genreId: '1', genreName: 'Экшен', title: 'Экшен' })} go={go} />
              <Row t="Комедия" ic={<Icons.Sparkles size={17} className="text-yellow-400" />} d={comD} l={comL} onM={() => goToCatalog({ mode: 'genre', genreId: '4', genreName: 'Комедия', title: 'Комедия' })} go={go} />
              <Row t="Фэнтези" ic={<Icons.Star size={17} className="text-violet-400" />} d={fantD} l={fantL} onM={() => goToCatalog({ mode: 'genre', genreId: '10', genreName: 'Фэнтези', title: 'Фэнтези' })} go={go} />
            </div>
          </motion.div>
        )}

        {/* CATALOG */}
        {tab === 'catalog' && (
          <motion.div key="catalog" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} className="pt-24 px-5 lg:px-10 min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-5">
              <div className="flex items-center gap-3">
                <button onClick={goHome} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5 shrink-0"><Icons.ChevronLeft size={15} /></button>
                <div>
                  <p className="text-indigo-500 font-black text-[8px] tracking-[0.6em] uppercase flex items-center gap-1.5 mb-0.5"><Icons.Layers size={10} />Медиатека</p>
                  <h2 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter font-syne">{catalogState.title}</h2>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-5">
                <div className="flex items-center gap-1.5 mr-2">
                  <Icons.Filter size={13} className="text-white/30" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Фильтр</span>
                </div>
                {[
                  { m: 'all' as CatalogMode, t: 'Все' },
                  { m: 'trending' as CatalogMode, t: 'Онгоинги' },
                  { m: 'topRated' as CatalogMode, t: 'Топ' },
                  { m: 'movies' as CatalogMode, t: 'Фильмы' },
                  { m: 'upcoming' as CatalogMode, t: 'Скоро' },
                  { m: 'seasonal' as CatalogMode, t: `${SeasonMap[cs]} ${cy}` },
                ].map(({ m, t }) => (
                  <button key={m}
                    onClick={() => setCatalogState(
                      m === 'seasonal'
                        ? { mode: m, season: cs, year: cy, title: `${SeasonMap[cs]} ${cy}` }
                        : { mode: m, title: t === 'Топ' ? 'Топ рейтинг' : t === 'Онгоинги' ? 'Онгоинги' : t === 'Скоро' ? 'Скоро выйдут' : t === 'Фильмы' ? 'Аниме фильмы' : 'Каталог' }
                    )}
                    className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${catalogState.mode === m && !catalogState.genreId ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:bg-white/[0.06] hover:border-white/15'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/15 mb-3">Жанры</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {GENRES_SHIKI.map(g => (
                    <button key={g.id}
                      onClick={() => setCatalogState({ mode: 'genre', genreId: g.id, genreName: g.name, title: g.name })}
                      className={`relative group flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 ${catalogState.mode === 'genre' && catalogState.genreId === g.id ? 'bg-indigo-600/20 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'}`}
                    >
                      <span className="text-xl">{GENRE_ICONS[g.name] || '🎬'}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${catalogState.mode === 'genre' && catalogState.genreId === g.id ? 'text-indigo-300' : 'text-white/40 group-hover:text-white/70'}`}>{g.name}</span>
                      {catalogState.mode === 'genre' && catalogState.genreId === g.id && (<motion.div layoutId="genrePill" className="absolute inset-0 rounded-2xl ring-1 ring-indigo-500/50" />)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {cl && cp === 1 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-20">
                {Array(24).fill(0).map((_, i) => <Skel key={i} />)}
              </div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-8">
                  <AnimatePresence>
                    {acd.map((a: any, idx: number) => (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.4) }}>
                        <Card a={a} go={() => go(a.id)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {cd.length === 50 && (
                  <div className="flex justify-center pb-20">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setCp(p => p + 1)} disabled={cl}
                      className="px-8 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition flex items-center gap-2 disabled:opacity-50">
                      {cl ? <Icons.Loader size={14} className="text-indigo-500" /> : <Icons.ChevronDown size={14} />} Показать ещё
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* DETAIL */}
        {tab === 'detail' && (
          <motion.div key="detail" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} className="min-h-screen">
            {de ? (
              <div className="pt-32 text-center">
                <Icons.AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
                <p className="text-white/30 text-lg mb-4">Ошибка загрузки</p>
                <button onClick={goHome} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition">← Назад</button>
              </div>
            ) : dl || !det ? (
              <div className="pt-32"><Spinner /></div>
            ) : (
              <>
                <div className="relative h-[40vh] lg:h-[52vh] w-full overflow-hidden">
                  <img src={det.banner || det.poster} className="w-full h-full object-cover opacity-30 contrast-125 saturate-150" alt=""
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
                </div>

                <div className="relative -mt-40 lg:-mt-56 z-10 px-5 lg:px-12 pb-28">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 max-w-6xl mx-auto">
                    <div className="shrink-0 flex justify-center lg:justify-start">
                      <TiltPoster src={det.poster} className="w-40 lg:w-52" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <RatingBadge val={det.rating} />
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.15em]">
                          {det.year} · {det.type}{det.episodes && ` · ${det.episodes} эп.`}{det.duration && ` · ${det.duration} мин.`}
                        </span>
                        {det.status && (
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${det.status === 'ongoing' ? 'border-green-500/30 text-green-400 bg-green-500/5' : det.status === 'released' ? 'border-white/10 text-white/30' : 'border-amber-500/30 text-amber-400 bg-amber-500/5'}`}>
                            {det.statusRu}
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter font-syne leading-[0.95]">{det.title}</h1>
                      {det.titleNative && <p className="text-white/20 text-xs">{det.titleNative}</p>}
                      {det.titleRomaji && det.title !== det.titleRomaji && <p className="text-white/15 text-[11px] italic">{det.titleRomaji}</p>}
                      {det.studio && <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em]">Студия: {det.studio}</p>}
                      <div className="flex gap-1 flex-wrap">
                        {det.genres?.map((g: string) => (<span key={g} className="text-[8px] font-black uppercase tracking-widest text-white/30 border border-white/8 px-2 py-0.5 rounded-full">{g}</span>))}
                      </div>
                      <div className="max-w-2xl">
                        <p className="text-[13px] text-white/50 font-light leading-relaxed">{det.descRu || det.desc || 'Описание недоступно.'}</p>
                      </div>

                      {det.screenshots?.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-2.5 flex items-center gap-1.5">
                            <Icons.Image size={10} className="text-indigo-400" />Кадры из аниме
                            <span className="text-white/10">({det.screenshots.length})</span>
                          </p>
                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                            {det.screenshots.map((s: any, i: number) => (
                              <motion.button key={i} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                                onClick={() => openLightbox(det.screenshots, i)}
                                className="relative group shrink-0 rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all shadow-lg"
                                style={{ height: 80, width: 'auto', aspectRatio: '16/9' }}
                              >
                                <img src={s.preview || s.url} className="h-full w-auto object-cover" alt="" style={{ minWidth: 120 }} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-1.5"><Icons.Maximize size={12} className="text-white" /></div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap pt-1">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openPlayer(1)}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(79,70,229,0.3)] uppercase tracking-widest text-[9px]">
                          <Icons.Play size={15} fill="white" className="text-white" /> Смотреть
                        </motion.button>
                        {det.trailer && (
                          <a href={det.trailer.site === 'youtube' ? `https://youtube.com/watch?v=${det.trailer.id}` : '#'} target="_blank" rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-black rounded-xl flex items-center gap-2 hover:bg-white/10 transition uppercase tracking-widest text-[9px]">
                            <Icons.Play size={15} />Трейлер
                          </a>
                        )}
                        <AnimeStatusSelector anime={det} onStatusChange={() => setListRefreshKey(k => k + 1)} />
                        <button onClick={goHome} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-black rounded-xl flex items-center gap-2 hover:bg-white/10 transition uppercase tracking-widest text-[9px]">
                          <Icons.ChevronLeft size={15} />Назад
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Сезоны */}
                  {(() => {
                    const seasonRels = det.relations?.filter((r: any) => ['sequel', 'prequel'].includes(r.relationType)) || [];
                    if (seasonRels.length === 0) return null;
                    const allSeasons = [det, ...seasonRels].sort((a: any, b: any) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
                    return (
                      <div className="max-w-6xl mx-auto mt-8 mb-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 mb-3 flex items-center gap-2">
                          <Icons.Layers size={11} className="text-indigo-400" />Сезоны
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {allSeasons.map((s: any, idx: number) => {
                            const isCurrent = s.id === det.id;
                            return (
                              <motion.button key={s.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => !isCurrent && go(s.id)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all ${isCurrent ? 'bg-indigo-600/20 border-indigo-500/50 text-white cursor-default' : 'bg-white/[0.03] border-white/8 text-white/50 hover:border-white/20 hover:text-white hover:bg-white/[0.06] cursor-pointer'}`}>
                                <div className={`w-7 h-7 rounded-xl overflow-hidden border shrink-0 ${isCurrent ? 'border-indigo-500/40' : 'border-white/10'}`}>
                                  {s.poster ? <img src={s.poster} className="w-full h-full object-cover" alt="" onError={e => (e.currentTarget.style.display = 'none')} /> : <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20">{idx + 1}</div>}
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black uppercase tracking-wider">{isCurrent ? 'Текущий' : `Сезон ${idx + 1}`}</p>
                                  {s.year && <p className="text-[8px] text-white/30 mt-0.5">{s.year}</p>}
                                </div>
                                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <EpisodesSection det={det} onPlay={openPlayer} />

                  {det.characters?.length > 0 && (
                    <div className="mt-12 max-w-6xl mx-auto">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter font-syne mb-5 flex items-center gap-2.5">
                        <Icons.User size={18} className="text-indigo-400" />Персонажи
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {det.characters.map((c: any, i: number) => (
                          <motion.div key={i} whileHover={{ y: -3 }} className="min-w-[85px] flex flex-col items-center gap-1.5 group cursor-pointer">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-indigo-500/50 transition shadow-lg">
                              {c.image ? <img src={c.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-white/5" />}
                            </div>
                            <p className="text-[9px] font-bold text-center truncate max-w-[75px]">{c.nameR || c.name}</p>
                            <p className="text-[8px] text-white/20 uppercase">{c.role}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {det.relations?.length > 0 && (
                    <div className="mt-12 max-w-6xl mx-auto">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter font-syne mb-5 flex items-center gap-2.5">
                        <Icons.Layers size={18} className="text-cyan-400" />Связанные
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {det.relations.map((r: any) => (
                          <div key={r.id} className="min-w-[145px]">
                            <Card a={r} go={() => go(r.id)} />
                            <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1.5 text-center">{r.relationRu}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {det.recommendations?.length > 0 && (
                    <div className="mt-12 max-w-6xl mx-auto">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter font-syne mb-5 flex items-center gap-2.5">
                        <Icons.Sparkles size={18} className="text-amber-400" />Рекомендации
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {det.recommendations.map((r: any) => (
                          <div key={r.id} className="min-w-[145px]"><Card a={r} go={() => go(r.id)} /></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* MY LIST */}
        {tab === 'mylist' && (
          <motion.div key="mylist" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Show when="signed-in">
              <MyListPage onAnimeClick={(id) => go(id)} onBack={goHome} refreshKey={listRefreshKey} />
            </Show>
            <Show when="signed-out">
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-5">
                <div className="text-6xl">📋</div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter font-syne text-center">Войдите, чтобы вести список</h2>
                <p className="text-white/40 text-sm text-center max-w-sm">Сохраняйте аниме, ставьте оценки и отслеживайте прогресс просмотра</p>
                <button onClick={goHome} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition">На главную</button>
              </div>
            </Show>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxScreenshots && (
          <ScreenshotLightbox screenshots={lightboxScreenshots} initialIndex={lightboxIdx} onClose={() => setLightboxScreenshots(null)} />
        )}
      </AnimatePresence>

      {/* PROFILE */}
      <AnimatePresence>
        {profileOpen && (<ProfilePage onClose={() => setProfileOpen(false)} animeListStats={animeListStats} />)}
      </AnimatePresence>

      {/* PLAYER */}
      <AnimatePresence>
        {playerOpen && det && (
          <VideoPlayer
            det={{ ...det, _startEp: playerStartEp }}
            onClose={() => setPlayerOpen(false)}
            onSwitchSeason={(newId) => { setPlayerOpen(false); go(newId); }}
          />
        )}
      </AnimatePresence>

      <footer className="py-10 border-t border-white/5 text-center">
        <p className="text-[8px] font-black text-white/10 uppercase tracking-[1em] italic">Anivex © 2026</p>
      </footer>
    </div>
  );
}
