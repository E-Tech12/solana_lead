// PWA Service Worker for Solana Memecoin Beginner Lead Finder
const CACHE_NAME = 'solana-lead-finder-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'New Solana Beginner Lead';
    const body = data.body || 'A new potential lead has been discovered.';
    const icon = data.icon || '/icon-192.png';
    const tag = data.lead_id ? `lead-${data.lead_id}` : 'system-notice';

    const options = {
      body: body,
      icon: icon,
      badge: '/icon-192.png',
      tag: tag,
      renotify: true,
      data: {
        url: data.url || '/',
        video_url: data.video_url || null,
        lead_id: data.lead_id || null,
        type: data.type || 'lead_alert'
      },
      actions: [
        {
          action: 'open_lead',
          title: 'View Lead'
        }
      ]
    };

    if (data.video_url) {
      options.actions.push({
        action: 'open_tiktok',
        title: 'Open TikTok'
      });
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Failed to parse push notification payload:', err);
  }
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  if (event.action === 'open_tiktok' && data.video_url) {
    targetUrl = data.video_url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
