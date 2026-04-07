import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/react';
import { api } from '@/lib/api';

const STATUSES = [
  { value: 'watching', label: 'Смотрю', icon: '👀', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'completed', label: 'Просмотрено', icon: '✅', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'planned', label: 'Запланировано', icon: '📋', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'on_hold', label: 'Отложено', icon: '⏸️', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'dropped', label: 'Брошено', icon: '❌', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

interface AnimeStatusSelectorProps {
  anime: {
    id: number;
    shikiId?: number;
    malId?: number;
    title: string;
  };
  onStatusChange?: () => void;
}

export default function AnimeStatusSelector({ anime, onStatusChange }: AnimeStatusSelectorProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const animeId = anime.shikiId || anime.malId || anime.id;

  useEffect(() => {
    if (!user) return;
    
    api.animelist.get(animeId)
      .then(item => {
        if (item) setCurrentStatus(item.status);
      })
      .catch(() => {});
  }, [user, animeId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (status: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (currentStatus === status) {
        await api.animelist.remove(animeId);
        setCurrentStatus(null);
      } else if (currentStatus) {
        await api.animelist.update(animeId, { status });
        setCurrentStatus(status);
      } else {
        await api.animelist.add(animeId, status);
        setCurrentStatus(status);
      }
      onStatusChange?.();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  if (!user) {
    return (
      <button
        disabled
        className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/30 font-black rounded-xl flex items-center gap-2 cursor-not-allowed uppercase tracking-widest text-[9px]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        В список
      </button>
    );
  }

  const current = STATUSES.find(s => s.value === currentStatus);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`px-6 py-2.5 font-black rounded-xl flex items-center gap-2 transition-all uppercase tracking-widest text-[9px] border ${
          current
            ? current.color
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        } ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : current ? (
          <span>{current.icon}</span>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
        {current ? current.label : 'В список'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-48 bg-[#0F0F11]/98 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            <div className="p-1.5">
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleSelect(status.value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                    currentStatus === status.value
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{status.icon}</span>
                  <span className="text-[11px] font-bold">{status.label}</span>
                  {currentStatus === status.value && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              ))}
            </div>
            {currentStatus && (
              <>
                <div className="mx-2 h-px bg-white/5" />
                <div className="p-1.5">
                  <button
                    onClick={() => handleSelect(currentStatus)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all text-left"
                  >
                    <span className="text-sm">🗑️</span>
                    <span className="text-[11px] font-bold">Удалить из списка</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
