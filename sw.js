/* 台本読み合わせ練習アプリ：画面の部品を端末に保存し、電波がなくても開けるようにする。
   画面を更新したら VERSION の数字を1つ上げてください。 */
const VERSION = 'gakuya-v0.11.0';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))); /* すぐには切り替えない。画面の「切り替える」ボタンで切り替える */
});
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'gakuya-files').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       /* GASとのやりとりは保存しない */
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  /* config.js はいつも最新を取りにいく（電波がないときだけ保存分） */
  if (url.origin === location.origin && /config\.js$/.test(url.pathname)) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req)));
    return;
  }
  /* 先に保存済みのものを出し、裏で新しいものを取ってくる */
  e.respondWith(caches.open(VERSION).then(cache => cache.match(req).then(hit => {
    const fresh = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => hit);
    return hit || fresh;
  })));
});
