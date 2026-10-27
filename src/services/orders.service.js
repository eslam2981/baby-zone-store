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
    return (data || []).filter((o) => !o.id?.startsWith('EGY-TEST') && o.id !== 'EGY-98421');
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
    if (!raw || raw.length < 3) return null;

    // Strip SQL wildcards and unescaped characters to prevent wildcard enumeration
    const cleanQuery = raw.replace(/[%_\\]/g, '').trim();
    if (!cleanQuery || cleanQuery.length < 3) return null;

    // Exact match by order ID or phone (never partial substring wildcards)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'محذوف')
      .or(`id.ilike.${cleanQuery},customer_phone.eq.${cleanQuery}`)
      .limit(1);
    if (error) throw error;
    const found = data?.[0] || null;
    if (found && (found.id?.startsWith('EGY-TEST') || found.id === 'EGY-98421')) {
      return null;
    }
    return found;
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

    // When an authenticated customer has an email address, their orders are strictly identified by that email.
    // We NEVER use % substring wildcards or mix with other accounts!
    if (cleanEmail) {
      query = query.ilike('customer_email', cleanEmail);
    } else if (cleanPhone) {
      query = query.eq('customer_phone', cleanPhone);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Strict client-side verification to guarantee zero leakage:
    return (data || []).filter((ord) => {
      // Discard deleted or dummy test orders
      if (ord.status === 'محذوف' || ord.id?.startsWith('EGY-TEST') || ord.id === 'EGY-98421') {
        return false;
      }
      // An authentic order must have items that the customer chose
      if (!Array.isArray(ord.items) || ord.items.length === 0) {
        return false;
      }

      const orderEmail = (ord.customer_email || '').trim().toLowerCase();
      const orderPhone = (ord.customer_phone || '').trim();

      // If customer has an email, ONLY return orders with that EXACT email
      if (cleanEmail) {
        return orderEmail === cleanEmail;
      }

      // If phone-only, match exact phone and ensure it's not tagged with a different email
      return cleanPhone && orderPhone === cleanPhone && !orderEmail;
    });
  }
};
