import React from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/react';

interface ProfilePageProps {
  onClose: () => void;
  animeListStats: Record<string, number>;
}

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  watching: { label: 'Смотрю', icon: '👀', color: 'text-green-400' },
  completed: { label: 'Просмотрено', icon: '✅', color: 'text-blue-400' },
  planned: { label: 'Запланировано', icon: '📋', color: 'text-amber-400' },
  on_hold: { label: 'Отложено', icon: '⏸️', color: 'text-gray-400' },
  dropped: { label: 'Брошено', icon: '❌', color: 'text-red-400' },
};

export default function ProfilePage({ onClose, animeListStats }: ProfilePageProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const total = Object.values(animeListStats).reduce((acc, val) => acc + val, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-600/30 to-purple-600/30">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div className="relative -mt-12 flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0c] overflow-hidden bg-indigo-600/20">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-indigo-400">
                {user?.firstName?.[0] || user?.username?.[0] || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-6">
          <h2 className="text-xl font-black text-center uppercase italic tracking-tight">
            {user?.firstName || user?.username || 'Пользователь'}
          </h2>
          <p className="text-white/30 text-xs text-center mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </p>

          {/* Stats */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center py-2 px-3 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="text-xs font-bold text-white/40">Всего в списке</span>
              <span className="text-sm font-black text-indigo-400">{total}</span>
            </div>

            {Object.entries(STATUS_LABELS).map(([key, { label, icon, color }]) => (
              <div
                key={key}
                className="flex justify-between items-center py-2 px-3 bg-white/[0.02] rounded-xl border border-white/5"
              >
                <span className="text-xs font-bold text-white/40 flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </span>
                <span className={`text-sm font-black ${color}`}>
                  {animeListStats[key] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Sign Out */}
          <button
            onClick={() => signOut()}
            className="w-full mt-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти из аккаунта
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
