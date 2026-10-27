// Products domain API service
import { supabase } from '../lib/supabase';

export const productsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async updateStock(id, newCount) {
    return this.update(id, {
      stockCount: newCount,
      inStock: newCount > 0
    });
  }
};
