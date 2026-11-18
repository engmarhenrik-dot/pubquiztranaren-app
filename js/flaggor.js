/*
 * Flaggor och huvudstäder: två egna menyer (#/flaggor och #/huvudstader).
 *  - Flaggor: se flaggan, visa svaret (landet). Sorterat efter hur troliga flaggorna är på ett pubquiz.
 *    Egen flik för förväxlingar (liknande flaggor) och för sparade flaggor att träna extra på.
 *  - Huvudstäder: se flaggan och landets namn, svara med huvudstaden.
 * Data finns i data/flaggor.js och bilderna i data/flaggor/. Sparade kort lagras i inställningen "flaggor.extra".
 */
(function () {
  const PQ = window.PQ;
  PQ.views = PQ.views || {};
  const D = PQ.flagData;
  if (!D) return;
  const UI = () => PQ.ui;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---- Data ----
  const ALL = [];
  D.tiers.forEach((t, ti) => t.items.trim().split("|").forEach((s) => {
    const i = s.indexOf(" ");
    ALL.push({ code: s.slice(0, i), name: s.slice(i + 1), tier: ti + 1, rank: ALL.length + 1 });
  }));
  // Egen sannolikhetsordning för huvudstäder (D.capTiers), byggd på vilka huvudstäder som faktiskt förekommit i quizfrågor.
  const CAPALL = [];
  D.capTiers.forEach((t, ti) => t.items.trim().split("|").forEach((s) => {
    const i = s.indexOf(" "), code = s.slice(0, i);
    CAPALL.push({ code, name: (ALL.find((c) => c.code === code) || {}).name, tier: ti + 1, rank: CAPALL.length + 1 });
  }));
  const CAPS = Object.fromEntries(D.caps.split("|").map((s) => { const i = s.indexOf(" "); return [s.slice(0, i), s.slice(i + 1)]; }));
  const NAME = Object.fromEntries(ALL.map((c) => [c.code, c.name]));
  const src = (code) => "data/flaggor/" + code.toLowerCase() + ".svg";
  // ---- Landfakta: folkmängd, huvudstad, karta och sammanfattning ----
  const FACTS = {};
  (PQ.landText || "").split("\n").forEach((line) => {
    const p = line.split("|");
    if (p.length < 5 || !/^[A-Z]{2}(-[A-Z]{3})?$/.test(p[0])) return;
    FACTS[p[0]] = { cap: +p[1], lat: +p[2], lng: +p[3], text: p.slice(4).join("|") };
  });
  const BAS = PQ.landBas || { pop: {}, rank: {}, a3: {}, sov: [], n: 0, eu: [] };
  const nf = (n) => {
    const sv = (x) => x.toLocaleString("sv-SE").replace(/\u00a0/g, " ");
    if (n >= 1e7) return sv(Math.round(n / 1e5) / 10) + " miljoner";
    if (n >= 1e6) return sv(Math.round(n / 1e4) / 100) + " miljoner";
    if (n >= 1e5) return sv(Math.round(n / 1e3) * 1e3);
    if (n >= 1e3) return sv(Math.round(n / 100) * 100);
    return sv(Math.round(n));
  };
  function mapDefs() {
    if (document.getElementById("pqWorldDefs") || !PQ.worldMap) return;
    const paths = Object.entries(PQ.worldMap).map(([k, d]) => `<path id="pq-c-${k}" d="${d}"/>`).join("");
    const el = document.createElement("div");
    el.innerHTML = `<svg id="pqWorldDefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs><g id="pq-world">${paths}</g></defs></svg>`;
    document.body.appendChild(el.firstChild);
  }
  function mapHtml(code, zoom) {
    const f = FACTS[code]; if (!f || !PQ.worldMap) return "";
    mapDefs();
    const x = f.lng + 180, y = 90 - f.lat;
    let vb = [0, 0, 360, 180];
    if (zoom) { const w = 56, h = 32; vb = [Math.max(0, Math.min(360 - w, x - w / 2)), Math.max(0, Math.min(180 - h, y - h / 2)), w, h]; }
    const k = vb[2] / 360;
    const ids = code === "EU" ? BAS.eu : (BAS.a3[code] ? [BAS.a3[code]] : []);
    const hl = ids.filter((a) => PQ.worldMap[a]).map((a) => `<use href="#pq-c-${a}" class="map-hl"/>`).join("");
    return `<svg class="map-svg" viewBox="${vb.join(" ")}" role="img" aria-label="Världskarta som visar var landet ligger">
      <rect x="0" y="0" width="360" height="180" class="map-sea"/>
      <use href="#pq-world" class="map-land"/>${hl}
      <circle cx="${x}" cy="${y}" r="${(7 * k).toFixed(2)}" class="map-ring"/>
      <circle cx="${x}" cy="${y}" r="${(2.6 * k).toFixed(2)}" class="map-pin"/></svg>`;
  }
  function factsHtml(code) {
    const f = FACTS[code]; if (!f) return "";
    const pop = BAS.pop[code], rank = BAS.rank[code], sov = BAS.sov.includes(code);
    const rankTxt = code === "EU" ? "Som ett eget land skulle EU vara nummer 3 i världen (efter Indien och Kina)." :
      sov ? `Nummer <b>${rank}</b> av ${BAS.n} länder i folkmängd.` : `Skulle som eget land hamna på plats ca ${rank} av ${BAS.n} i folkmängd.`;
    return `<div class="fl-facts">
      <div class="fl-stats">
        <div><span>Invånare</span><b>ca ${nf(pop)}</b></div>
        <div><span>Huvudstad</span><b>ca ${nf(f.cap)}</b></div>
        <div class="wide"><span>Storleksordning</span><b>${rankTxt}</b></div>
      </div>
      <p class="fl-summary">${esc(f.text)}</p>
      <div class="muted small">Folkmängd: FN/Världsbanken, uppskattning för 2025. Huvudstadens invånartal är ungefärliga och avser själva staden.</div>
    </div>`;
  }

  const TIER_LABEL = ["Mycket sannolik", "Sannolik", "Möjlig", "Osannolik"];

  // ---- Sparade kort (träna extra) ----
  const keyOf = (it) => (it.codes ? "g:" + it.codes.join("-") : (it.t === "k" ? "k:" : "c:") + it.code);
  const savedSet = () => new Set(PQ.store.setting("flaggor.extra", []));
  function toggleSaved(it) {
    const s = savedSet(), k = keyOf(it);
    if (s.has(k)) s.delete(k); else s.add(k);
    PQ.store.setSetting("flaggor.extra", [...s]);
    return s.has(k);
  }

  // ---- Utbyggnad av vyerna ----
  const KINDS = {
    flaggor: { title: "Flaggor", icon: "🏳️", lead: "Se flaggan och försök komma på landet. De vanligaste pubquiz-flaggorna kommer först.", subs: [["rank", "Efter sannolikhet"], ["pairs", "Förväxlingar"], ["extra", "Träna extra"]], prefix: ["c:", "g:"] },
    huvudstader: { title: "Huvudstäder", icon: "🏛️", lead: "Du ser flaggan och landets namn. Svara med huvudstaden. Nivåerna bygger på vilka huvudstäder som faktiskt dykt upp i quizfrågor, så de allra enklaste (Paris, Berlin) ligger lägre än de lite mer udda (Ulan Bator, Baku, Zagreb).", subs: [["rank", "Efter sannolikhet"], ["extra", "Träna extra"]], prefix: ["k:"] },
  };
  const state = {};

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function buildDeck(kind) {
    const st = state[kind], t = kind === "flaggor" ? "c" : "k";
    const byTier = () => {
      const out = [];
      [1, 2, 3, 4].filter((n) => st.tiers.has(n)).forEach((n) => {
        const part = (kind === "flaggor" ? ALL : CAPALL).filter((c) => c.tier === n).map((c) => Object.assign({ t }, c));
        out.push(...(st.shuffle ? shuffle(part) : part));
      });
      return out;
    };
    let deck;
    if (st.sub === "rank") deck = byTier();
    else if (st.sub === "pairs") deck = D.pairs.map((p) => Object.assign({ t: "g" }, p));
    else {
      const s = savedSet();
      deck = [...(kind === "flaggor" ? ALL : CAPALL).map((c) => Object.assign({ t }, c)), ...(kind === "flaggor" ? D.pairs.map((p) => Object.assign({ t: "g" }, p)) : [])].filter((it) => s.has(keyOf(it)));
    }
    if (st.shuffle && st.sub !== "rank") shuffle(deck);
    st.deck = deck;
    st.pos = Math.min(st.pos || 0, Math.max(deck.length - 1, 0));
    st.revealed = false;
  }

  function render(kind) {
    const K = KINDS[kind];
    const st = state[kind] || (state[kind] = { sub: "rank", tiers: new Set([1, 2, 3, 4]), shuffle: false, deck: [], pos: 0, revealed: false });
    st.pos = 0;
    const ui = UI();

    function frame() {
      const n = savedSet(); const count = [...n].filter((k) => K.prefix.some((p) => k.startsWith(p))).length;
      ui.mount(`
        <a class="back" href="#/">← Startsidan</a>
        <div class="page-head"><h1>${K.icon} ${K.title}</h1><p>${K.lead}</p></div>
        <div class="row fl-controls">
          <div class="seg" role="group" aria-label="Kategori">
            ${K.subs.map(([id, label]) => `<button type="button" data-sub="${id}" aria-pressed="${st.sub === id}">${label}${id === "extra" ? ` (${count})` : ""}</button>`).join("")}
          </div>
          ${st.sub !== "pairs" && st.sub !== "extra" ? `<div class="seg" role="group" aria-label="Nivå">
            <button type="button" data-tier="0" aria-pressed="${st.tiers.size === 4}">Alla nivåer</button>
            ${[1, 2, 3, 4].map((n) => `<button type="button" data-tier="${n}" aria-pressed="${st.tiers.size < 4 && st.tiers.has(n)}" title="${TIER_LABEL[n - 1]}">Nivå ${n}</button>`).join("")}
          </div>` : ""}
          <label class="check-row"><input type="checkbox" id="flShuffle" ${st.shuffle ? "checked" : ""}> Blanda ${st.sub === "rank" ? "inom nivå" : "ordningen"}</label>
        </div>
        <div class="quiz fl-quiz" id="flBody"></div>`);
      ui.onViewClick(onClick);
      buildDeck(kind);
      paint();
    }

    function paint() {
      const body = document.getElementById("flBody");
      const it = st.deck[st.pos];
      if (!it) {
        body.innerHTML = `<article class="card"><p class="muted" style="margin:0">${st.sub === "extra"
          ? "Inget sparat än. Klicka på ☆ Träna extra på ett kort i någon annan flik för att samla det du behöver öva mer på."
          : "Inga kort att visa."}</p></article>`;
        return;
      }
      const tierInfo = it.tier ? { label: `Nivå ${it.tier} · ${TIER_LABEL[it.tier - 1]}`, n: it.tier } : { label: it.imp ? "Förväxling · Mycket viktig" : "Förväxling", n: it.imp ? 1 : 4 };
      const saved = savedSet().has(keyOf(it));
      let media, prompt, answer;
      if (it.t === "g") {
        media = `<div class="fl-multi">${it.codes.map((c) => `<figure><img alt="Flagga" src="${src(c)}"><figcaption>${st.revealed ? esc(NAME[c]) : "?"}</figcaption></figure>`).join("")}</div>`;
        prompt = "Vilka länder är det här? Vad skiljer flaggorna åt?";
        answer = esc(it.note);
      } else {
        media = `<div class="fl-flag"><img alt="Flagga" src="${src(it.code)}"></div>`;
        if (it.t === "k") { prompt = ""; answer = `<div class="fl-answer">${esc(CAPS[it.code])}</div><div class="muted small">Plats ${it.rank} av ${CAPALL.length} i sannolikhetslistan för huvudstäder</div>`; }
        else { prompt = "Vilket land (eller område) är det här?"; answer = `<div class="fl-answer">${esc(it.name)}</div><div class="muted small">Plats ${it.rank} av ${ALL.length} i sannolikhetslistan</div>`; }
      }
      body.innerHTML = `
        <div class="quiz-top"><div class="progress"><div style="width:${100 * (st.pos + 1) / st.deck.length}%"></div></div><div class="quiz-count">${st.pos + 1} / ${st.deck.length}</div></div>
        <article class="card">
          <div class="card-meta">
            <span class="pill fl-tier fl-t${tierInfo.n}">${tierInfo.label}</span>
            ${it.t === "k" ? `<span class="pill">Huvudstad</span>` : ""}
            <span class="spacer"></span>
            <button class="btn small ${saved ? "accent" : ""}" type="button" data-act="star" aria-pressed="${saved}">${saved ? "★ Sparad" : "☆ Träna extra"}</button>
          </div>
          ${media}
          ${it.t !== "g" && FACTS[it.code] ? `<div class="fl-map">${mapHtml(it.code, st.zoom)}<button class="btn small ghost" type="button" data-act="zoom">${st.zoom ? "🌍 Hela världen" : "🔍 Zooma in"}</button></div>` : ""}
          <div class="fl-text">${it.t === "k" ? `<div class="fl-country">${esc(it.name)}</div>` : ""}${st.revealed ? (it.t === "g" ? `<div class="muted">${answer}</div>` : answer) : `<div class="muted">${it.t === "k" ? "Vad heter huvudstaden?" : prompt}</div>`}</div>
          ${st.revealed && it.t !== "g" ? factsHtml(it.code) : ""}
          <div class="fl-actions">
            <button class="btn" type="button" data-act="prev" ${st.pos === 0 ? "disabled" : ""}>← Förra</button>
            <button class="btn primary reveal" type="button" data-act="reveal">${st.revealed ? "DÖLJ SVAR" : "VISA SVAR"}</button>
            <button class="btn" type="button" data-act="next" ${st.pos >= st.deck.length - 1 ? "disabled" : ""}>Nästa →</button>
          </div>
        </article>
        <div class="quiz-foot"><span class="kbd-hints"><kbd>Mellanslag</kbd> visa svar · <kbd>←</kbd> <kbd>→</kbd> bläddra · <kbd>S</kbd> spara</span></div>`;
    }

    function step(d) { const n = st.pos + d; if (n < 0 || n >= st.deck.length) return; st.pos = n; st.revealed = false; paint(); }
    function reveal() { if (!st.deck[st.pos]) return; st.revealed = !st.revealed; paint(); }
    function star() {
      const it = st.deck[st.pos]; if (!it) return;
      const on = toggleSaved(it);
      if (st.sub === "extra" && !on) { st.deck.splice(st.pos, 1); st.pos = Math.min(st.pos, Math.max(st.deck.length - 1, 0)); st.revealed = false; }
      frameKeep();
    }
    // Rita om hela ramen (räknaren på fliken) men behåll leken.
    function frameKeep() { const keepPos = st.pos, keepRev = st.revealed, keepDeck = st.deck; frame0(keepDeck, keepPos, keepRev); }
    function frame0(deck, pos, rev) { frame(); st.deck = deck; st.pos = pos; st.revealed = rev; paint(); }

    const onClick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.sub) { st.sub = b.dataset.sub; st.pos = 0; frame(); }
      else if (b.dataset.tier != null) {
        const n = +b.dataset.tier;
        if (n === 0) st.tiers = new Set([1, 2, 3, 4]);
        else if (st.tiers.size === 4) st.tiers = new Set([n]);
        else if (st.tiers.has(n)) { if (st.tiers.size > 1) st.tiers.delete(n); }
        else st.tiers.add(n);
        st.pos = 0; frame();
      }
      else if (b.dataset.act === "reveal") reveal();
      else if (b.dataset.act === "prev") step(-1);
      else if (b.dataset.act === "next") step(1);
      else if (b.dataset.act === "star") star();
      else if (b.dataset.act === "zoom") { st.zoom = !st.zoom; paint(); }
    };
    view().addEventListener("change", onChange);
    function onChange(e) { if (e.target.id === "flShuffle") { st.shuffle = e.target.checked; st.pos = 0; frame(); } }
    function view() { return document.getElementById("view"); }
    // Lyssnaren ligger kvar på #view; ta bort den när vyn byts.
    const stale = view()._flChange; if (stale) view().removeEventListener("change", stale);
    view()._flChange = onChange;

    ui.setKeys((e) => {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter") { e.preventDefault(); reveal(); }
      else if (k === "arrowright") step(1);
      else if (k === "arrowleft") step(-1);
      else if (k === "s") star();
    });

    frame();
  }

  PQ.views.flaggor = () => render("flaggor");
  PQ.views.huvudstader = () => render("huvudstader");
})();
