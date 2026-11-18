/*
 * Service worker: gör Pubquiztränaren användbar utan internet.
 * Publiceringsskriptet (verktyg/publicera-pwa.ps1) ersätter VERSION och PRECACHE i den publicerade kopian.
 * Appfiler läses ur cachen och uppdateras i bakgrunden (nästa start får den nya versionen).
 * Bilder och flaggor sparas första gången de visas.
 */
const VERSION = "20261118-163245";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./data/affischer.js",
  "./data/bilder.js",
  "./data/dagsquiz.js",
  "./data/egna-fragor.js",
  "./data/flaggor.js",
  "./data/krig-reklass.js",
  "./data/landbas.js",
  "./data/landfakta-1.js",
  "./data/landfakta-2.js",
  "./data/landfakta-3.js",
  "./data/landfakta-4.js",
  "./data/p.bin",
  "./data/spotify.js",
  "./data/varldskarta.js",
  "./data/dagsquiz/2026-11-02.json",
  "./data/dagsquiz/2026-11-03.json",
  "./data/mer-om-svaret/aktuellt.js",
  "./data/mer-om-svaret/blandat.js",
  "./data/mer-om-svaret/film-tv.js",
  "./data/mer-om-svaret/fordjupning.js",
  "./data/mer-om-svaret/geografi.js",
  "./data/mer-om-svaret/historia.js",
  "./data/mer-om-svaret/kanda-personer.js",
  "./data/mer-om-svaret/mat-dryck.js",
  "./data/mer-om-svaret/musik.js",
  "./data/mer-om-svaret/popkultur.js",
  "./data/mer-om-svaret/quizkvall.js",
  "./data/mer-om-svaret/sport.js",
  "./data/mer-om-svaret/sverige-norden.js",
  "./data/mer-om-svaret/vetenskap-natur.js",
  "./data/questions/aktuellt.js",
  "./data/questions/blandat.js",
  "./data/questions/film-tv.js",
  "./data/questions/fordjupning.js",
  "./data/questions/geografi.js",
  "./data/questions/historia.js",
  "./data/questions/internationellt-2-fakta.js",
  "./data/questions/internationellt-2-kultur.js",
  "./data/questions/internationellt-fakta.js",
  "./data/questions/internationellt-kultur.js",
  "./data/questions/kanda-personer.js",
  "./data/questions/krig-militar.js",
  "./data/questions/mat-dryck.js",
  "./data/questions/musik.js",
  "./data/questions/p3-dokumentar-1.js",
  "./data/questions/p3-dokumentar-2.js",
  "./data/questions/p3-historia-1.js",
  "./data/questions/p3-historia-2.js",
  "./data/questions/p3-historia-3.js",
  "./data/questions/p3-historia-4.js",
  "./data/questions/p3-id-1.js",
  "./data/questions/p3-id-2.js",
  "./data/questions/p3-id-3.js",
  "./data/questions/popkultur.js",
  "./data/questions/quizkvall.js",
  "./data/questions/sondagsintervjun-1.js",
  "./data/questions/sondagsintervjun-2.js",
  "./data/questions/sport.js",
  "./data/questions/sverige-norden.js",
  "./data/questions/vetenskap-natur.js",
  "./data/questions/wikipedia-2015.js",
  "./data/questions/wikipedia-2016.js",
  "./data/questions/wikipedia-2017.js",
  "./data/questions/wikipedia-2018.js",
  "./data/questions/wikipedia-2019.js",
  "./data/questions/wikipedia-2020.js",
  "./data/questions/wikipedia-2021.js",
  "./data/questions/wikipedia-2022.js",
  "./data/questions/wikipedia-2023.js",
  "./data/questions/wikipedia-2024.js",
  "./data/questions/wikipedia-brott.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/app.js",
  "./js/bank.js",
  "./js/categories.js",
  "./js/dagsquiz.js",
  "./js/engine.js",
  "./js/filmer.js",
  "./js/flaggor.js",
  "./js/priv.js",
  "./js/quizspel.js",
  "./js/research.js",
  "./js/store.js",
  "./js/sync.js"
];
const CACHE = "pq-" + VERSION;
const LAZY = ["/data/bilder/", "/data/flaggor/", "/icons/"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("pq-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const lazy = LAZY.some((p) => url.pathname.includes(p));

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    const fetchAndStore = () => fetch(req, { cache: "no-cache" }).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    if (lazy) return hit || fetchAndStore();
    if (hit) { fetchAndStore().catch(() => {}); return hit; }
    try { return await fetchAndStore(); }
    catch (err) {
      if (req.mode === "navigate") { const home = await cache.match("./index.html") || await cache.match("./"); if (home) return home; }
      throw err;
    }
  })());
});
