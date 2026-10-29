// Store Settings domain API service
import { supabase } from '../lib/supabase';

export const storeSettingsApi = {
  async get() {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(settings) {
    const payload = {
      id: 'primary_store_settings',
      store_name: settings.storeName || settings.store_name,
      tagline: settings.tagline,
      description: settings.description,
      support_phone: settings.supportPhone || settings.support_phone,
      support_email: settings.supportEmail || settings.support_email,
      address: settings.address,
      currency: settings.currency,
      currency_code: settings.currencyCode || settings.currency_code,
      free_shipping_limit: Number(settings.freeShippingLimit ?? settings.free_shipping_limit ?? settings.freeShippingThreshold ?? 1375),
      cairo_shipping_fee: Number(settings.cairoShippingFee ?? settings.cairo_shipping_fee ?? settings.cairoShippingCost ?? 50),
      provinces_shipping_fee: Number(settings.provincesShippingFee ?? settings.provinces_shipping_fee ?? settings.otherGovernoratesShippingCost ?? 75),
      tax_rate: Number(settings.taxRate ?? settings.tax_rate ?? 14),
      auto_confirm_orders: Boolean(settings.autoConfirmOrders ?? settings.auto_confirm_orders),
      enable_cod: Boolean(settings.enableCOD ?? settings.enableCod ?? settings.enable_cod ?? true),
      enable_instapay: Boolean(settings.enableInstaPay ?? settings.enableInstapay ?? settings.enable_instapay ?? false),
      enable_vodafone_cash: Boolean(settings.enableVodafoneCash ?? settings.enableVodafone ?? settings.enable_vodafone_cash ?? false),
      enable_credit_card: Boolean(settings.enableCreditCard ?? settings.enableCard ?? settings.enable_credit_card ?? false),
      maintenance_mode: Boolean(settings.maintenanceMode ?? settings.maintenance_mode),
      business_hours: settings.businessHours || settings.business_hours,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload)
      .select();
    if (error) throw error;
    return data?.[0];
  }
};
