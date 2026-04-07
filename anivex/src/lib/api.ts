// API client for Anivex backend

let tokenProvider: () => Promise<string | null> = () => Promise.resolve(null);

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await tokenProvider();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

export interface AnimeListItem {
  id: string;
  animeId: number;
  status: 'watching' | 'completed' | 'planned' | 'dropped' | 'on_hold';
  score?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  animelist: {
    getAll: () => request<AnimeListItem[]>('/animelist'),
    
    get: (animeId: number) => 
      request<AnimeListItem | null>(`/animelist/${animeId}`),
    
    add: (animeId: number, status: string) =>
      request<AnimeListItem>('/animelist', {
        method: 'POST',
        body: JSON.stringify({ animeId, status }),
      }),
    
    update: (animeId: number, data: { status?: string; score?: number; progress?: number }) =>
      request<AnimeListItem>(`/animelist/${animeId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    
    remove: (animeId: number) =>
      request<void>(`/animelist/${animeId}`, {
        method: 'DELETE',
      }),
  },
};

export default api;
