/* Offline copy of the trip site: network first, cached copy when there is no signal. */
const CACHE = "yuzawa-ski-v1";
const CORE = ["./", "index.html", "data/pricing.json", "manifest.webmanifest", "icon-192.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  const same = u.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !fonts) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : undefined)))
  );
});
