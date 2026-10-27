// Admins Team domain API service
import { supabase } from '../lib/supabase';

export const adminsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(adminData) {
    const rawPerms = Array.isArray(adminData.permissions) ? [...adminData.permissions] : ['all'];
    const cleanPass = (adminData.password || '').trim();
    if (!cleanPass) {
      throw new Error('يرجى تحديد كلمة مرور آمنة للمشرف الجديد');
    }
    const permsWithPwd = [
      ...rawPerms.filter((p) => typeof p === 'string' && !p.startsWith('__pwd:')),
      `__pwd:${cleanPass}__`
    ];

    const payload = {
      id: adminData.id || `adm-${Date.now()}`,
      name: adminData.name,
      email: adminData.email.trim().toLowerCase(),
      phone: adminData.phone || '',
      role: adminData.role || 'مشرف (Moderator)',
      avatar: adminData.avatar || '/logo.png',
      status: adminData.status || 'نشط',
      permissions: permsWithPwd
    };
    const { data, error } = await supabase
      .from('admins')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async updateLastLogin(id) {
    const { error } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async update(id, updates) {
    const payload = { ...updates };
    if (payload.password || payload.permissions) {
      const currentPerms = Array.isArray(payload.permissions) ? [...payload.permissions] : ['all'];
      const cleanPass = payload.password ? payload.password.trim() : null;
      if (cleanPass) {
        payload.permissions = [
          ...currentPerms.filter((p) => typeof p === 'string' && !p.startsWith('__pwd:')),
          `__pwd:${cleanPass}__`
        ];
      }
      delete payload.password;
    }
    const { data, error } = await supabase
      .from('admins')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
