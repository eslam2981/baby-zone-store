// Orders domain API service
import { supabase } from '../lib/supabase.js';

export const ordersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'محذوف')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .neq('status', 'محذوف')
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(order) {
    const { error } = await supabase
      .from('orders')
      .insert([order]);
    if (error) throw error;
    return order;
  },

  async updateStatus(id, newStatus) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async softDelete(id) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'محذوف' })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async hardDelete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async track(query) {
    const raw = (query || '').trim();
    if (!raw || raw.length < 4) return null;

    // Strip SQL wildcards and unescaped characters to prevent wildcard enumeration
    const cleanQuery = raw.replace(/[%_\\]/g, '').trim();
    if (!cleanQuery || cleanQuery.length < 4) return null;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'محذوف')
      .or(`id.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%`)
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  },

  async getByCustomer(email, phone) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    if (!cleanEmail && !cleanPhone) return [];

    let query = supabase
      .from('orders')
      .select('*')
      .neq('status', 'محذوف')
      .order('created_at', { ascending: false });

    if (cleanEmail && cleanPhone) {
      query = query.or(`customer_email.ilike.%${cleanEmail}%,customer_phone.ilike.%${cleanPhone}%`);
    } else if (cleanEmail) {
      query = query.ilike('customer_email', `%${cleanEmail}%`);
    } else if (cleanPhone) {
      query = query.ilike('customer_phone', `%${cleanPhone}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};
