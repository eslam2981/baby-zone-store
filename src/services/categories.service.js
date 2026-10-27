// Categories domain API service
import { supabase } from '../lib/supabase';

export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
