// Activity Log domain API service
import { supabase } from '../lib/supabase';

export const activityLogApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async add(entryOrAdminName, action, target, type) {
    let payload;
    if (typeof entryOrAdminName === 'object' && entryOrAdminName !== null) {
      payload = {
        id: entryOrAdminName.id || `act-${Date.now()}`,
        admin_name: entryOrAdminName.adminName || entryOrAdminName.admin_name || 'مدير النظام',
        action: entryOrAdminName.action,
        target: entryOrAdminName.target || '',
        type: entryOrAdminName.type || 'general'
      };
    } else {
      payload = {
        id: `act-${Date.now()}`,
        admin_name: entryOrAdminName || 'مدير النظام',
        action,
        target: target || '',
        type: type || 'general'
      };
    }
    const { data, error } = await supabase
      .from('activity_log')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  }
};
