const CACHE_NAME = 'smoon-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Cache addAll failed:', err);
          // Continue même si certains fichiers ne peuvent pas être mis en cache
          return Promise.resolve();
        });
      })
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Prendre le contrôle immédiatement
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignore les requêtes non-http (chrome-extension, data:, blob:, etc.)
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Ignore les requêtes vers des domaines externes (sauf si nécessaire)
  // Sur iOS, on évite de cacher les requêtes externes qui peuvent causer des problèmes
  if (url.origin !== self.location.origin && !event.request.url.includes('nominatim.openstreetmap.org')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner depuis le cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Ne cache que les requêtes réussies, http/https, et de type 'basic'
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cloner la réponse avant de la mettre en cache
            const responseToCache = response.clone();
            
            // Mettre en cache de manière asynchrone (ne pas bloquer la réponse)
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (err) {
                  console.warn('Cache put failed:', err);
                }
              })
              .catch((err) => {
                console.warn('Cache open failed:', err);
              });
            
            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, retourner la page d'accueil depuis le cache
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});
