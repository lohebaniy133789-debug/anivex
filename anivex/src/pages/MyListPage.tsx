import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const STATUSES = [
  { value: 'all', label: 'Все', icon: '📚' },
  { value: 'watching', label: 'Смотрю', icon: '👀' },
  { value: 'completed', label: 'Просмотрено', icon: '✅' },
  { value: 'planned', label: 'Запланировано', icon: '📋' },
  { value: 'on_hold', label: 'Отложено', icon: '⏸️' },
  { value: 'dropped', label: 'Брошено', icon: '❌' },
];

interface MyListPageProps {
  onAnimeClick: (id: number) => void;
  onBack: () => void;
  refreshKey?: number;
}

interface ListItem {
  id: string;
  animeId: number;
  status: string;
  score?: number;
  progress?: number;
  animeData?: {
    title: string;
    poster: string;
    type: string;
    year: string;
    episodes?: number;
  };
}

// Shikimori API для получения данных аниме
async function fetchAnimeData(animeId: number) {
  try {
    const res = await fetch(`https://shikimori.one/api/animes/${animeId}`, {
      headers: { 'User-Agent': 'Anivex/2.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.russian || data.name,
      poster: data.image?.original ? `https://shikimori.one${data.image.original}` : '',
      type: data.kind || 'Аниме',
      year: data.aired_on?.substring(0, 4) || '',
      episodes: data.episodes || data.episodes_aired || null,
    };
  } catch {
    return null;
  }
}

export default function MyListPage({ onAnimeClick, onBack, refreshKey = 0 }: MyListPageProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.animelist
      .getAll()
      .then(async (list) => {
        // Fetch anime data for each item
        const enrichedItems = await Promise.all(
          list.map(async (item: any) => {
            const animeData = await fetchAnimeData(item.animeId);
            return { ...item, animeData };
          })
        );
        setItems(enrichedItems);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filteredItems =
    activeStatus === 'all'
      ? items
      : items.filter((item) => item.status === activeStatus);

  return (
    <div className="min-h-screen pt-24 pb-20 px-5 lg:px-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition border border-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Мой список
          </h1>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {STATUSES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setActiveStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeStatus === value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>{icon}</span>
              {label}
              <span className="text-[10px] opacity-60">
                ({value === 'all' ? items.length : items.filter((i) => i.status === value).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">📭</div>
            <p className="text-white/30 text-sm">Список пуст</p>
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition"
            >
              Найти аниме
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 cursor-pointer group"
                  onClick={() => onAnimeClick(item.animeId)}
                >
                  {item.animeData?.poster ? (
                    <img
                      src={item.animeData.poster}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-lg">
                      {STATUSES.find((s) => s.value === item.status)?.icon || '📺'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-xs font-bold line-clamp-2 mb-1">
                      {item.animeData?.title || `Anime #${item.animeId}`}
                    </h4>
                    {item.animeData && (
                      <p className="text-[10px] text-white/40">
                        {item.animeData.year} · {item.animeData.type}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
