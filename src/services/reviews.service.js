// Reviews domain API service
import { supabase } from '../lib/supabase';

export const reviewsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByProductId(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(review) {
    const payload = {
      id: review.id || `rev-${Date.now()}`,
      product_id: review.productId || review.product_id,
      product_name: review.productName || review.product_name || '',
      customer_name: review.customerName || review.customer_name,
      customer_email: review.customerEmail || review.customer_email || '',
      rating: Number(review.rating || 5),
      comment: review.comment || '',
      is_approved: review.isApproved !== undefined ? Boolean(review.isApproved) : (review.is_approved !== undefined ? Boolean(review.is_approved) : true),
      likes: Number(review.likes || 0)
    };
    const { data, error } = await supabase
      .from('reviews')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async toggleApproval(id, isApproved) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_approved: isApproved })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
