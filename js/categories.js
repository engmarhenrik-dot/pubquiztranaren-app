/*
 * Kategorier, svårighetsgrader och blandningsregler.
 * Ny kategori: lägg till en rad här och skapa data/questions/<id>.js
 * (och en <script>-rad i index.html).
 */
window.PQ = window.PQ || {};

PQ.CATEGORIES = [
  { id: "musik",           name: "Musik",                  icon: "🎵", hue: 330, blurb: "Artister, låtar, album, Mello och Eurovision" },
  { id: "film-tv",         name: "Film och TV",            icon: "🎬", hue: 18,  blurb: "Filmer, serier, regissörer, Oscars och repliker" },
  { id: "geografi",        name: "Geografi",               icon: "🌍", hue: 165, blurb: "Länder, huvudstäder, floder, berg och flaggor" },
  { id: "historia",        name: "Historia",               icon: "🏛️", hue: 38,  blurb: "Världshistoria, svensk historia och kungligheter" },
  { id: "sport",           name: "Sport",                  icon: "⚽", hue: 125, blurb: "Fotboll, hockey, OS och svenska idrottare" },
  { id: "krig-militar",    name: "Krig och militär",       icon: "🪖", hue: 100, blurb: "Slag, världskrig, vapen, kalla kriget och svensk militärhistoria" },
  { id: "mat-dryck",       name: "Mat, dryck och bakverk", icon: "🍰", hue: 48,  blurb: "Rätter, fikaklassiker, öl, ost och matkultur" },
  { id: "kanda-personer",  name: "Kända personer",         icon: "⭐", hue: 285, blurb: "Artister, politiker, författare och ikoner" },
  { id: "sverige-norden",  name: "Sverige och Norden",     icon: "👑", hue: 212, blurb: "Traditioner, landskap, kungahuset och grannländer" },
  { id: "vetenskap-natur", name: "Vetenskap och natur",    icon: "🔬", hue: 192, blurb: "Djur, kroppen, rymden och uppfinningar" },
  { id: "popkultur",       name: "Populärkultur och nöje", icon: "🎮", hue: 262, blurb: "Spel, internet, TV-nöje och trender" },
  { id: "aktuellt",        name: "Aktuellt",               icon: "📰", hue: 2,   blurb: "Daterade, källkontrollerade nyheter" },
  { id: "blandat",         name: "Blandad allmänbildning", icon: "🎲", hue: 92,  blurb: "Allt som inte passar in någon annanstans" },
];

PQ.CATEGORY = Object.fromEntries(PQ.CATEGORIES.map((c) => [c.id, c]));

PQ.DIFFICULTIES = [
  { id: "lätt",  name: "Lätt",  hint: "Grundläggande allmänbildning" },
  { id: "medel", name: "Medel", hint: "Typisk pubquizfråga" },
  { id: "svår",  name: "Svår",  hint: "Skiljer bra lag från riktigt bra" },
];

// Realistisk blandning när alla nivåer är valda (ungefär 30/50/20).
PQ.DIFF_MIX = { "lätt": 0.3, "medel": 0.5, "svår": 0.2 };

// Hur ofta varje kategori dyker upp i läget "Blandat pubquiz".
// Nöjeskategorierna (musik, film/TV, populärkultur) har en liten övervikt.
// Aktuellt och Mat, dryck och bakverk ingår inte i blandat pubquiz.
PQ.PUBQUIZ_WEIGHTS = {
  "musik": 15, "film-tv": 14, "popkultur": 11, "geografi": 10, "sport": 9, "historia": 9,
  "sverige-norden": 10, "vetenskap-natur": 9, "kanda-personer": 10, "krig-militar": 6, "blandat": 3,
};

// Generella källor som man kan välja mellan i "Blandat pubquiz". Varje källa samlar ett eller
// flera origin-värden (set.origin i datafilerna). Okända origin hamnar under "Övrigt".
PQ.SOURCES = [
  { id: "grundbank",     name: "Grundbanken",      blurb: "Egna, faktakontrollerade frågor, inklusive Sveriges Radio, Wikipedia och internationellt", origins: ["grundbank", "p3-dokumentar", "p3-historia", "p3-id", "sondagsintervjun", "wikipedia", "internationell"] },
  { id: "qa",            name: "Samling A",        blurb: "Privat samling", origins: ["qa"] },
  { id: "qb",            name: "Samling B",        blurb: "Privat samling", origins: ["qb"] },
  { id: "qc",            name: "Samling C",        blurb: "Privat samling", origins: ["qc"] },
  { id: "egna",          name: "Egna frågor",      blurb: "Frågor du lagt till själv", origins: ["egen", "egen-fil"] },
  { id: "ovrigt",        name: "Övrigt",           blurb: "Allt annat", origins: [] },
];
PQ.SOURCE = Object.fromEntries(PQ.SOURCES.map((s) => [s.id, s]));
PQ.sourceOf = (function () {
  const map = new Map();
  PQ.SOURCES.forEach((s) => s.origins.forEach((o) => map.set(o, s.id)));
  return (origin) => map.get(origin || "grundbank") || "ovrigt";
})();

// Aktuella frågor räknas som "aktuella" så här många dagar efter händelsen.
PQ.FRESH_DAYS = 90;
