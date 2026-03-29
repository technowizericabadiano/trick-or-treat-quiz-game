const CACHE_VERSION = "trick-or-treat-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const assetUrl = (path) => `${BASE_PATH}${path}`;
const APP_SHELL = [
  assetUrl("/"),
  assetUrl("/index.html"),
  assetUrl("/manifest.webmanifest"),
  assetUrl("/icons/icon-192.png"),
  assetUrl("/icons/icon-512.png"),
  assetUrl("/icons/apple-touch-icon.png"),
  assetUrl("/theme/back-button.png"),
  assetUrl("/theme/pumpkin.png"),
  assetUrl("/theme/smoke-texture.png"),
  assetUrl("/theme/treat-candy.png"),
  assetUrl("/theme/trick-ghost.png"),
  assetUrl("/theme/trick-ghosts.png"),
  assetUrl("/sounds/answer-correct.mp3"),
  assetUrl("/sounds/vine-boom.mp3"),
  assetUrl("/sounds/wrong-answer.mp3")
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          return cachedPage || caches.match(assetUrl("/index.html"));
        })
    );
    return;
  }

  const isStaticAsset = [
    "style",
    "script",
    "image",
    "font",
    "audio",
    "manifest"
  ].includes(event.request.destination);

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
