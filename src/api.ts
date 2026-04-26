import type { CategoryData, DashboardEntry, Homeowner, Requirements } from './types';

const BASE = '/api';

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'שגיאה בשרת');
  }
  return res.json();
}

export const api = {
  getHomeowners: () => req<Homeowner[]>('/homeowners'),

  saveHomeowner: (data: Partial<Homeowner>) =>
    req<Homeowner>('/homeowners', { method: 'POST', body: JSON.stringify(data) }),

  deleteHomeowner: (id: string) =>
    req<{ success: boolean }>(`/homeowners/${id}`, { method: 'DELETE' }),

  getRequirements: (homeownerId: string) =>
    req<Requirements | null>(`/requirements/${homeownerId}`),

  saveRequirements: (homeownerId: string, categories: Record<string, CategoryData>) =>
    req<Requirements>('/requirements', {
      method: 'POST',
      body: JSON.stringify({ homeownerId, categories }),
    }),

  getDashboard: () => req<DashboardEntry[]>('/dashboard'),
};
