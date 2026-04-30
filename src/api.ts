import { supabase } from './supabase';
import type { CategoryData, DashboardEntry, Homeowner, Requirements } from './types';

function toHomeowner(row: any): Homeowner {
  return {
    id: row.id,
    name: row.name,
    apartment: row.apartment,
    building: row.building ?? '',
    phone: row.phone ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRequirements(row: any): Requirements {
  return {
    homeownerId: row.homeowner_id,
    categories: row.categories ?? {},
    updatedAt: row.updated_at,
  };
}

function throwIf(error: any) {
  if (error) throw new Error(error.message);
}

export const api = {
  getHomeowners: async (): Promise<Homeowner[]> => {
    const { data, error } = await supabase
      .from('homeowners')
      .select('*')
      .order('created_at');
    throwIf(error);
    return (data ?? []).map(toHomeowner);
  },

  saveHomeowner: async (input: Partial<Homeowner>): Promise<Homeowner> => {
    const row = {
      id: input.id || `h_${Date.now()}`,
      name: input.name?.trim() ?? '',
      apartment: input.apartment?.trim() ?? '',
      building: input.building?.trim() ?? '',
      phone: input.phone?.trim() ?? '',
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('homeowners')
      .upsert(row)
      .select()
      .single();
    throwIf(error);
    return toHomeowner(data);
  },

  deleteHomeowner: async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.from('homeowners').delete().eq('id', id);
    throwIf(error);
    return { success: true };
  },

  getRequirements: async (homeownerId: string): Promise<Requirements | null> => {
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .eq('homeowner_id', homeownerId)
      .maybeSingle();
    throwIf(error);
    return data ? toRequirements(data) : null;
  },

  saveRequirements: async (
    homeownerId: string,
    categories: Record<string, CategoryData>
  ): Promise<Requirements> => {
    const { data, error } = await supabase
      .from('requirements')
      .upsert({ homeowner_id: homeownerId, categories, updated_at: new Date().toISOString() })
      .select()
      .single();
    throwIf(error);
    return toRequirements(data);
  },

  getDashboard: async (): Promise<DashboardEntry[]> => {
    const [{ data: homeowners, error: he }, { data: requirements, error: re }] =
      await Promise.all([
        supabase.from('homeowners').select('*').order('created_at'),
        supabase.from('requirements').select('*'),
      ]);
    throwIf(he);
    throwIf(re);

    return (homeowners ?? []).map(h => ({
      ...toHomeowner(h),
      requirements: (() => {
        const r = (requirements ?? []).find(r => r.homeowner_id === h.id);
        return r ? toRequirements(r) : null;
      })(),
    }));
  },
};
