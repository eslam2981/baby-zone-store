// Cross-tab and intra-app real-time synchronization bus
const CHANNEL_NAME = 'babyzone_sync_bus';

export const syncBus = {
  channel: typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null,

  emit(type, payload) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (err) {
        console.warn('SyncBus emit warning:', err);
      }
    }
    // Also dispatch to local window for immediate intra-window reaction
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('babyzone_sync_event', { detail: { type, payload } }));
    }
  },

  on(type, handler) {
    if (typeof window === 'undefined') return () => {};

    const handleBroadcast = (e) => {
      if (e.data?.type === type) {
        handler(e.data.payload);
      }
    };

    const handleLocal = (e) => {
      if (e.detail?.type === type) {
        handler(e.detail.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('babyzone_sync_event', handleLocal);

    return () => {
      if (this.channel) {
        this.channel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('babyzone_sync_event', handleLocal);
    };
  }
};
