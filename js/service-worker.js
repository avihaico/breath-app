const CACHE_NAME = 'breathflow-v1';
const ASSETS = [
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // don't cache large media by default unless you want offline
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(clients.claim());
});

self.addEventListener('fetch', (evt) => {
  // network first for HTML, cache-first for assets
  if(evt.request.mode === 'navigate' || (evt.request.method === 'GET' && evt.request.headers.get('accept').includes('text/html'))){
    evt.respondWith(fetch(evt.request).catch(()=> caches.match('/index.html')));
    return;
  }
  evt.respondWith(caches.match(evt.request).then(res => res || fetch(evt.request)));
});
