// Coupons domain API service
import { supabase } from '../lib/supabase';

export const couponsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(coupon) {
    const isPercent = coupon.discountType === 'percentage' || coupon.type === 'percentage';
    const discountVal = Number(
      coupon.discountValue ??
      coupon.discount_percent ??
      coupon.discountPercent ??
      coupon.discount_amount ??
      coupon.discountAmount ??
      0
    );

    const payload = {
      id: coupon.id || `cp-${Date.now()}`,
      code: (coupon.code || '').trim().toUpperCase(),
      discount_percent: isPercent ? discountVal : 0,
      discount_amount: !isPercent ? discountVal : 0,
      type: isPercent ? 'percentage' : 'fixed',
      min_spend: Number(coupon.minSpend ?? coupon.min_spend ?? 0),
      max_discount: Number(coupon.maxDiscount ?? coupon.max_discount ?? 0),
      usage_count: Number(coupon.usedCount ?? coupon.usageCount ?? coupon.usage_count ?? 0),
      max_usage: Number(coupon.maxUses ?? coupon.maxUsage ?? coupon.max_usage ?? 100),
      start_date: coupon.startDate || coupon.start_date || new Date().toISOString().split('T')[0],
      end_date: coupon.expiryDate || coupon.endDate || coupon.end_date || null,
      is_active: coupon.isActive !== undefined ? Boolean(coupon.isActive) : (coupon.is_active !== undefined ? Boolean(coupon.is_active) : true),
      description: coupon.description || ''
    };
    const { data, error } = await supabase
      .from('coupons')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const payload = {};
    if (updates.code) payload.code = updates.code.trim().toUpperCase();

    const isPercent = updates.discountType ? updates.discountType === 'percentage' : (updates.type ? updates.type === 'percentage' : undefined);

    if (updates.discountValue !== undefined) {
      const val = Number(updates.discountValue);
      if (isPercent !== undefined) {
        payload.discount_percent = isPercent ? val : 0;
        payload.discount_amount = !isPercent ? val : 0;
      } else {
        payload.discount_percent = val;
      }
    }
    if (updates.discountPercent !== undefined) payload.discount_percent = Number(updates.discountPercent);
    if (updates.discount_percent !== undefined) payload.discount_percent = Number(updates.discount_percent);
    if (updates.discountAmount !== undefined) payload.discount_amount = Number(updates.discountAmount);
    if (updates.discount_amount !== undefined) payload.discount_amount = Number(updates.discount_amount);
    if (isPercent !== undefined) payload.type = isPercent ? 'percentage' : 'fixed';
    else if (updates.type) payload.type = updates.type;

    if (updates.minSpend !== undefined) payload.min_spend = Number(updates.minSpend);
    if (updates.min_spend !== undefined) payload.min_spend = Number(updates.min_spend);
    if (updates.maxDiscount !== undefined) payload.max_discount = Number(updates.maxDiscount);
    if (updates.max_discount !== undefined) payload.max_discount = Number(updates.max_discount);
    if (updates.maxUses !== undefined) payload.max_usage = Number(updates.maxUses);
    if (updates.maxUsage !== undefined) payload.max_usage = Number(updates.maxUsage);
    if (updates.max_usage !== undefined) payload.max_usage = Number(updates.max_usage);
    if (updates.startDate) payload.start_date = updates.startDate;
    if (updates.start_date) payload.start_date = updates.start_date;
    if (updates.expiryDate) payload.end_date = updates.expiryDate;
    if (updates.endDate) payload.end_date = updates.endDate;
    if (updates.end_date) payload.end_date = updates.end_date;
    if (updates.isActive !== undefined) payload.is_active = Boolean(updates.isActive);
    if (updates.is_active !== undefined) payload.is_active = Boolean(updates.is_active);
    if (updates.description !== undefined) payload.description = updates.description;

    const { data, error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async toggleStatus(id, isActive) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
