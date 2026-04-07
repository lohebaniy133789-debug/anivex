import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EpisodeData {
  number: number;
  title: string;
  titleRu: string;
  thumbnail: string | null;
}

interface EpisodesSectionProps {
  det: {
    malId?: number;
    shikiId?: number;
    id: number;
    episodes?: number;
    title: string;
  };
  onPlay: (episode: number) => void;
}

async function fetchKitsuEpisodes(malId: number): Promise<EpisodeData[]> {
  try {
    const mr = await fetch(
      `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/anime&filter[externalId]=${malId}&include=item`
    );
    const md = await mr.json();
    const kid = md?.included?.[0]?.id;
    if (!kid) return [];

    const eps: EpisodeData[] = [];
    let url: string | null = `https://kitsu.io/api/edge/anime/${kid}/episodes?page[limit]=20&page[offset]=0&sort=number`;

    while (url && eps.length < 200) {
      const r = await fetch(url);
      const d = await r.json();
      d?.data?.forEach((ep: any) => {
        const rawTitle =
          ep.attributes?.titles?.en_jp || ep.attributes?.canonicalTitle || '';
        eps.push({
          number: ep.attributes?.number || eps.length + 1,
          title: rawTitle,
          titleRu: rawTitle || `Серия ${ep.attributes?.number || eps.length + 1}`,
          thumbnail:
            ep.attributes?.thumbnail?.original ||
            ep.attributes?.thumbnail?.large ||
            null,
        });
      });
      url = d?.links?.next || null;
    }
    return eps;
  } catch {
    return [];
  }
}

export default function EpisodesSection({ det, onPlay }: EpisodesSectionProps) {
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const totalEps = det.episodes || 0;
  const malId = det.malId || det.shikiId || det.id;

  useEffect(() => {
    if (!malId || totalEps === 0) {
      setEpisodes([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const ke = await fetchKitsuEpisodes(malId);
        if (cancelled) return;

        const result: EpisodeData[] =
          ke.length > 0
            ? ke
            : Array.from({ length: totalEps }, (_, i) => ({
                number: i + 1,
                title: '',
                titleRu: `Серия ${i + 1}`,
                thumbnail: null,
              }));

        result.forEach((ep) => {
          if (!ep.titleRu || ep.titleRu.trim() === '') {
            ep.titleRu = `Серия ${ep.number}`;
          }
        });

        if (!cancelled) setEpisodes(result);
      } catch {
        if (!cancelled) {
          setEpisodes(
            Array.from({ length: totalEps }, (_, i) => ({
              number: i + 1,
              title: '',
              titleRu: `Серия ${i + 1}`,
              thumbnail: null,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [malId, totalEps]);

  if (totalEps === 0) return null;

  const displayEpisodes = expanded ? episodes : episodes.slice(0, 12);

  return (
    <div className="mt-10 max-w-6xl mx-auto">
      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-5 flex items-center gap-2.5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-indigo-400"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
        Эпизоды
        <span className="text-white/20 text-sm font-normal">({totalEps})</span>
      </h3>

      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayEpisodes.map((ep) => (
              <motion.button
                key={ep.number}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPlay(ep.number)}
                className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-indigo-500/50 transition-all group"
              >
                {ep.thumbnail ? (
                  <img
                    src={ep.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                    <span className="text-2xl font-black text-white/10">
                      {ep.number}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/90 flex items-center justify-center shadow-lg">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="ml-0.5"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </div>
                </div>

                {/* Episode info */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[10px] font-black text-white/80">
                    Серия {ep.number}
                  </p>
                  {ep.titleRu && ep.titleRu !== `Серия ${ep.number}` && (
                    <p className="text-[8px] text-white/40 truncate">{ep.titleRu}</p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {episodes.length > 12 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition flex items-center gap-2"
              >
                {expanded ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Свернуть
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    Показать все ({episodes.length})
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
