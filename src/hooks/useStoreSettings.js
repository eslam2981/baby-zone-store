import { useState, useEffect } from 'react';
import { initialStoreSettings } from '../data/adminData';
import { storeSettingsApi } from '../services/api';
import { formatDbSettings } from '../utils/mappers';
import { syncBus } from '../utils/syncBus';
import { supabase } from '../lib/supabase';

/**
 * useStoreSettings:
 * Provides live, real-time store settings to both customer and administrative views.
 * Listens to local syncBus events for zero-latency cross-component updates and
 * Supabase Postgres changes for multi-device cloud synchronization.
 */
export function useStoreSettings() {
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Load initial settings from Supabase Cloud
    async function loadSettings() {
      try {
        const data = await storeSettingsApi.get();
        if (data && isMounted) {
          setStoreSettings(formatDbSettings(data));
        }
      } catch (err) {
        console.warn('Failed to load store settings:', err?.message);
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    }

    loadSettings();

    // Zero-latency local sync bus subscription
    const unsub = syncBus.on('SETTINGS_UPDATED', ({ settings }) => {
      if (!isMounted || !settings) return;
      setStoreSettings((prev) => {
        const isCod = settings.enableCOD ?? settings.enableCod ?? prev.enableCOD ?? true;
        const isInstapay = settings.enableInstaPay ?? settings.enableInstapay ?? prev.enableInstaPay ?? false;
        const isCard = settings.enableCreditCard ?? settings.enableCard ?? prev.enableCreditCard ?? false;
        const isVodafone = settings.enableVodafoneCash ?? settings.enableVodafone ?? prev.enableVodafoneCash ?? false;

        return {
          ...prev,
          ...settings,
          enableCOD: isCod,
          enableCod: isCod,
          enableInstaPay: isInstapay,
          enableInstapay: isInstapay,
          enableCreditCard: isCard,
          enableCard: isCard,
          enableVodafoneCash: isVodafone
        };
      });
    });

    // Real-time Supabase postgres_changes channel
    const channel = supabase
      .channel('storefront_store_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (!isMounted) return;
          if (payload.new) {
            setStoreSettings(formatDbSettings(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      unsub();
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    storeSettings,
    setStoreSettings,
    isLoadingSettings
  };
}

