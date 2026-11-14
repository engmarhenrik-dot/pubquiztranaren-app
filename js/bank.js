/*
 * Frågebanken: tar emot frågor från datafilerna (data/questions/*.js) och från
 * egna/researchade frågor i webbläsaren, validerar dem och hittar dubbletter.
 */
(function () {
  const PQ = window.PQ;
  const DIFFS = ["lätt", "medel", "svår"];
  const TYPES = ["tidlös", "aktuell"];
  const DEFAULT_VERIFIED = "2026-10-30";

  const questions = [];
  const byId = new Map();
  const problems = [];

  // "sv:ABBA" -> Wikipedia-länk, annars en vanlig URL eller fritext.
  function expandSource(s) {
    if (s && typeof s === "object" && s.url) return { label: s.label || hostOf(s.url), url: s.url };
    if (typeof s !== "string" || !s.trim()) return null;
    const m = s.match(/^(sv|en|no|da|fi):(.+)$/);
    if (m) {
      const title = m[2].trim().replace(/ /g, "_");
      return {
        label: "Wikipedia (" + m[1] + "): " + title.replace(/_/g, " "),
        url: "https://" + m[1] + ".wikipedia.org/wiki/" + encodeURIComponent(title),
      };
    }
    if (/^https?:\/\//i.test(s)) return { label: hostOf(s), url: s };
    return { label: s, url: null };
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
  }

  // "Mer om svaret": längre bakgrund per fråga, från fältet `more` eller från
  // data/mer-om-svaret/*.js som anropar PQ.bank.addInfo({ id: "text" }).
  const info = new Map();
  function addInfo(map) {
    Object.entries(map || {}).forEach(([id, text]) => {
      const t = String(text || "").trim();
      if (!t) return;
      info.set(id, t);
      const q = byId.get(id);
      if (q && !q.raw.more) q.more = t;
    });
  }

  // Spotify: sökfras (artist + låt) per fråga, från fältet `spotify` eller data/spotify.js.
  const spotify = new Map();
  function addSpotify(map) {
    Object.entries(map || {}).forEach(([id, query]) => {
      const s = String(query || "").trim();
      if (!s) return;
      spotify.set(id, s);
      const q = byId.get(id);
      if (q && !q.raw.spotify) q.spotify = s;
    });
  }

  // Bilder: { src, credit, page } per fråga, från data/bilder.js (verktyg/hamta-bilder.ps1).
  const images = new Map();
  function addImages(map) {
    Object.entries(map || {}).forEach(([id, img]) => {
      if (!img || !img.src) return;
      images.set(id, img);
      const q = byId.get(id);
      if (q && !q.raw.image) q.image = img;
    });
  }

  // Bildpaket (Claude-sidan): artefakter tillåter för få filer för en fil per bild, så
  // verktyg/packa-bilder.ps1 lägger bilderna som data-URI:er i data/bilder-paket/pNN.js.
  // Utan paketindex (index.html lokalt) används bildfilerna direkt.
  const packOf = new Map();      // filnamn -> paketnamn
  const packed = new Map();      // filnamn -> data-URI
  const packLoads = new Map();   // paketnamn -> Promise
  function addImagePacks(map) { Object.entries(map || {}).forEach(([file, pack]) => packOf.set(file, pack)); }
  function imagePack(map) { Object.entries(map || {}).forEach(([file, uri]) => packed.set(file, uri)); }
  function imageUrl(src) {
    const file = String(src).split("/").pop();
    const pack = packOf.get(file);
    if (!pack) return Promise.resolve(src);
    if (packed.has(file)) return Promise.resolve(packed.get(file));
    if (!packLoads.has(pack)) {
      packLoads.set(pack, new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = "data/bilder-paket/" + pack + ".js";
        el.onload = resolve;
        el.onerror = () => { packLoads.delete(pack); el.remove(); reject(new Error("bildpaket")); };
        document.head.appendChild(el);
      }));
    }
    return packLoads.get(pack).then(() => packed.get(file) || Promise.reject(new Error("bild saknas")));
  }

  function normalize(raw, defaults, origin) {
    defaults = defaults || {};
    const id = String(raw.id || "").trim();
    return {
      id,
      more: String(raw.more || "").trim() || info.get(id) || "",
      spotify: String(raw.spotify || "").trim() || spotify.get(id) || "",
      image: raw.image || images.get(id) || null,
      category: raw.category || defaults.category,
      question: String(raw.question || "").trim(),
      answer: String(raw.answer || "").trim(),
      accept: Array.isArray(raw.accept) ? raw.accept.map(String).filter(Boolean) : [],
      explanation: String(raw.explanation || "").trim(),
      difficulty: String(raw.difficulty || "").toLowerCase().replace("svar", "svår").replace("latt", "lätt"),
      sources: (Array.isArray(raw.sources) ? raw.sources : [raw.sources]).map(expandSource).filter(Boolean),
      verified: raw.verified || defaults.verified || DEFAULT_VERIFIED,
      type: raw.type || defaults.type || "tidlös",
      eventDate: raw.eventDate || null,
      validUntil: raw.validUntil || null,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      origin: origin || "grundbank",
      raw: raw,
    };
  }

  function validate(q) {
    const errs = [];
    if (!q.id) errs.push("saknar id");
    if (!q.question) errs.push("saknar frågetext");
    if (!q.answer) errs.push("saknar svar");
    if (!PQ.CATEGORY[q.category]) errs.push("okänd kategori '" + q.category + "'");
    if (!DIFFS.includes(q.difficulty)) errs.push("svårighetsgrad måste vara lätt/medel/svår");
    if (!TYPES.includes(q.type)) errs.push("typ måste vara tidlös/aktuell");
    if (!q.sources.length) errs.push("saknar källa");
    if (q.type === "aktuell" && !/^\d{4}-\d{2}-\d{2}$/.test(q.eventDate || "")) errs.push("aktuell fråga saknar eventDate (ÅÅÅÅ-MM-DD)");
    return errs;
  }

  function addOne(raw, defaults, origin) {
    const q = normalize(raw, defaults, origin);
    const errs = validate(q);
    if (byId.has(q.id)) errs.push("dubblett-id");
    if (errs.length) {
      problems.push({ id: q.id || "(utan id)", origin: q.origin, errors: errs });
      return null;
    }
    questions.push(q);
    byId.set(q.id, q);
    return q;
  }

  function removeById(id) {
    const q = byId.get(id);
    if (!q) return;
    byId.delete(id);
    questions.splice(questions.indexOf(q), 1);
  }

  // ---------- Dubblettkontroll ----------
  const STOP = new Set(("vad vilken vilket vilka vem vems hur när var som i på av och en ett det den de är " +
    "blev har hade till för med om från år heter hette kallas kallades kallad namn namnet man mest första " +
    "kan kunde ska skulle får fick sin sitt sina han hon dess deras vid ut upp efter under över mellan " +
    "the of a an in is was what which who").split(" "));

  // Enkel svensk ordstamning så att "Australiens" och "Australien" räknas som samma ord.
  const SUFFIXES = ["ernas", "arnas", "ornas", "erna", "arna", "orna", "ens", "ets", "en", "et", "ar", "er", "or", "na", "s"];
  function stem(w) {
    for (const suf of SUFFIXES) {
      if (w.length - suf.length >= 4 && w.endsWith(suf)) { w = w.slice(0, -suf.length); break; }
    }
    if (w.length > 5 && w.endsWith("en")) w = w.slice(0, -2);
    return w;
  }

  function words(s) {
    return String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem);
  }

  function jaccard(a, b) {
    const A = new Set(a), B = new Set(b);
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((w) => { if (B.has(w)) inter++; });
    return inter / (A.size + B.size - inter);
  }

  function answerKey(q) { return words(q.answer).join(" "); }

  // Returnerar den mest lika befintliga frågan om kandidaten verkar vara en dubblett.
  function findDuplicate(cand, pool) {
    pool = pool || questions;
    const cw = words(cand.question), ca = answerKey(cand);
    let best = null;
    for (const q of pool) {
      if (q === cand || q.id === cand.id) continue;
      const sim = jaccard(cw, words(q.question));
      const qa = answerKey(q);
      const sameAnswer = ca && qa && (ca === qa || (ca.length > 3 && qa.length > 3 && (ca.includes(qa) || qa.includes(ca))));
      const isDup = sim >= 0.7 || (sameAnswer && sim >= 0.25);
      if (isDup && (!best || sim > best.score)) best = { question: q, score: sim, sameAnswer: !!sameAnswer };
    }
    return best;
  }

  // ---------- Datum ----------
  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() { return isoDate(new Date()); }
  function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }
  function isExpired(q, now) { return !!(q.validUntil && q.validUntil < (now || today())); }
  function isFresh(q, now) {
    return q.type === "aktuell" && !isExpired(q, now) && daysBetween(q.eventDate, now || today()) <= PQ.FRESH_DAYS;
  }

  PQ.bank = {
    DIFFS, TYPES,
    addSet(set) {
      const defaults = { category: set.category, verified: set.verified, type: set.type };
      (set.questions || []).forEach((raw) => addOne(raw, defaults, set.origin || "grundbank"));
    },
    addInfo,
    addSpotify,
    addImages,
    addImagePacks,
    imagePack,
    imageUrl,
    spotifyUrl(query) { return "https://open.spotify.com/search/" + encodeURIComponent(query); },
    addCustom(raw) { return addOne(raw, {}, "egen"); },
    validateRaw(raw) { const q = normalize(raw, {}, "egen"); return { question: q, errors: validate(q) }; },
    normalize, removeById, expandSource,
    all() { return questions; },
    // Aktiva = inte utgångna och inte bortplockade som "för lätt" (PQ.store finns när frågor väljs).
    // Dagens quiz-frågor spelas bara i sina egna quiz (js/dagsquiz.js).
    active() { const t = today(); const st = PQ.store; return questions.filter((q) => q.origin !== "dagsquiz" && !isExpired(q, t) && !(st && st.isHidden(q.id))); },
    get(id) { return byId.get(id); },
    has(id) { return byId.has(id); },
    problems,
    findDuplicate, words, jaccard,
    today, isoDate, daysBetween, isExpired, isFresh,
  };
})();
