const CACHE_NAME = 'breathflow-cache-v1';
const URLsToCache = [
  '/',
  '/index.html',
  'css/styles.css',
  'jp/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLsToCache)));
  self.skipWaiting();
});
self.addEventListener('activate', event => clients.claim());
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
