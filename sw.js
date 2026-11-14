// Service worker Post Hub: cache KERANGKA saja (HTML/JS/ikon). Panggilan hub & Drive TIDAK pernah di-cache.
var CACHE = 'post-hub-shell-v6';   // naikkan angka ini setiap kali berkas kerangka berubah
var SHELL = ['./', 'index.html', 'core.js', 'upload.js', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  // hanya GET dan satu origin dengan halaman; hub, Drive, dan situs lain lewat jaringan langsung
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {                       // jaringan dulu supaya pembaruan cepat terlihat
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('index.html'); }); })
  );
});
