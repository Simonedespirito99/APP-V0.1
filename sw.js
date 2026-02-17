
// Service Worker SMIRT - Versione Semplificata per Installazione
const CACHE_NAME = 'smirt-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Strategia Network-First: prova il web, se offline usa la cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
