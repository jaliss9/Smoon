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
  // Ignore complètement les requêtes non-http (chrome-extension, data:, blob:, etc.)
  const requestUrl = event.request.url;
  
  // Vérifications strictes avant même de créer un URL
  if (!requestUrl || 
      requestUrl.startsWith('chrome-extension:') ||
      requestUrl.startsWith('chrome:') ||
      requestUrl.startsWith('moz-extension:') ||
      requestUrl.startsWith('safari-extension:') ||
      requestUrl.startsWith('data:') ||
      requestUrl.startsWith('blob:') ||
      requestUrl.startsWith('file:')) {
    return; // Ignorer complètement ces requêtes
  }
  
  // Vérifier le protocole avec URL seulement si c'est une URL valide
  let url;
  try {
    url = new URL(requestUrl);
  } catch (e) {
    // URL invalide, ignorer
    return;
  }
  
  // Vérifier que c'est bien http ou https
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Ignore les requêtes vers des domaines externes (sauf si nécessaire)
  // Sur iOS, on évite de cacher les requêtes externes qui peuvent causer des problèmes
  if (url.origin !== self.location.origin && !requestUrl.includes('nominatim.openstreetmap.org')) {
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
            
            // Vérifier une dernière fois que la requête est valide avant de la mettre en cache
            const requestUrl = event.request.url;
            if (requestUrl.startsWith('chrome-extension:') ||
                requestUrl.startsWith('chrome:') ||
                requestUrl.startsWith('moz-extension:') ||
                requestUrl.startsWith('safari-extension:') ||
                requestUrl.startsWith('data:') ||
                requestUrl.startsWith('blob:') ||
                requestUrl.startsWith('file:')) {
              return response; // Retourner sans mettre en cache
            }
            
            // Cloner la réponse avant de la mettre en cache
            const responseToCache = response.clone();
            
            // Mettre en cache de manière asynchrone (ne pas bloquer la réponse)
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  // Vérification finale avant put
                  if (event.request.url && !event.request.url.startsWith('chrome-extension:')) {
                    cache.put(event.request, responseToCache).catch((err) => {
                      // Ignorer silencieusement les erreurs de cache
                      if (!err.message.includes('chrome-extension')) {
                        console.warn('Cache put failed:', err);
                      }
                    });
                  }
                } catch (err) {
                  // Ignorer silencieusement les erreurs
                  if (!err.message || !err.message.includes('chrome-extension')) {
                    console.warn('Cache put error:', err);
                  }
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
