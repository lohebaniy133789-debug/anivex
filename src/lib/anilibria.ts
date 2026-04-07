// AniLibria API client

const ANILIBRIA_API = 'https://api.anilibria.tv/v3';

export interface AniLibriaEpisode {
  episode: number;
  name: string | null;
  uuid: string;
  created_timestamp: number;
  preview: string | null;
  skips: {
    opening?: number[];
    ending?: number[];
  };
  hls: {
    fhd?: string;
    hd?: string;
    sd?: string;
  };
}

export interface AniLibriaTitle {
  id: number;
  code: string;
  names: {
    ru: string;
    en: string;
    alternative: string | null;
  };
  player: {
    host: string;
    list: Record<string, AniLibriaEpisode>;
    episodes: {
      first: number;
      last: number;
    };
  };
}

export async function searchAniLibria(
  titleRu: string,
  titleEn: string = '',
  titleRomaji: string = ''
): Promise<AniLibriaTitle | null> {
  const queries = [titleRu, titleEn, titleRomaji].filter(Boolean);
  
  for (const query of queries) {
    try {
      const res = await fetch(
        `${ANILIBRIA_API}/title/search?search=${encodeURIComponent(query)}&limit=1`
      );
      if (!res.ok) continue;
      
      const data = await res.json();
      if (data.list && data.list.length > 0) {
        return data.list[0];
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

export function getEpisodeHlsUrl(
  title: AniLibriaTitle,
  episode: number,
  quality: 'fhd' | 'hd' | 'sd' = 'hd'
): string | null {
  const ep = title.player.list[String(episode)];
  if (!ep) return null;
  
  const hlsPath = ep.hls[quality] || ep.hls.hd || ep.hls.sd || ep.hls.fhd;
  if (!hlsPath) return null;
  
  return `https://${title.player.host}${hlsPath}`;
}

export function getEpisodesArray(title: AniLibriaTitle): AniLibriaEpisode[] {
  return Object.values(title.player.list).sort((a, b) => a.episode - b.episode);
}

export default {
  searchAniLibria,
  getEpisodeHlsUrl,
  getEpisodesArray,
};
