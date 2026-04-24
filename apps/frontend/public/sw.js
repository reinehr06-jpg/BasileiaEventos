self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('basileia-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/me/tickets',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Basileia Eventos';
  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/me/tickets')
  );
});
