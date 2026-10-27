// Customers domain API service
import { supabase } from '../lib/supabase';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../constants/permissions';

export const customersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findByEmailOrPhone(email, phone) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    if (!cleanEmail && !cleanPhone) return null;

    let query = supabase.from('customers').select('*');
    if (cleanEmail) {
      query = query.eq('email', cleanEmail);
    } else {
      query = query.eq('phone', cleanPhone);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async syncOnOrder({ name, email, phone, city, address, totalAmount }) {
    const customerEmail = (email || '').trim().toLowerCase();
    const customerPhone = (phone || '').trim();
    const customerName = (name || '').trim();
    const isVipTier = totalAmount >= 1300;

    if (!customerEmail && !customerPhone) return null;

    try {
      const existingCust = await this.findByEmailOrPhone(customerEmail, customerPhone);

      if (existingCust) {
        const updatedSpent = Number(existingCust.total_spent || 0) + totalAmount;
        return await this.update(existingCust.id, {
          name: customerName,
          phone: customerPhone || existingCust.phone,
          city,
          address: (address || '').trim(),
          orders_count: (existingCust.orders_count || 0) + 1,
          total_spent: updatedSpent,
          is_vip: existingCust.is_vip || isVipTier
        });
      } else {
        const newRecord = {
          id: `cust-${Date.now()}`,
          name: customerName,
          email: customerEmail || `cust-${Date.now()}@babyzone-egypt.com`,
          phone: customerPhone,
          city,
          address: (address || '').trim(),
          role: isVipTier ? 'vip_customer' : 'customer',
          permissions: DEFAULT_CUSTOMER_PERMISSIONS,
          is_vip: isVipTier,
          status: 'نشط',
          orders_count: 1,
          total_spent: totalAmount
        };
        return await this.create(newRecord);
      }
    } catch (err) {
      console.warn('Customer order synchronization notice:', err);
      return null;
    }
  }
};

