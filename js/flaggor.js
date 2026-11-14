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
    huvudstader: { title: "Huvudstäder", icon: "🏛️", lead: "Du ser flaggan och landets namn. Svara med huvudstaden. Nivåerna bygger på vilka huvudstäder som faktiskt dykt upp i quizfrågor och Onsdagsquizen-avsnitten, så de allra enklaste (Paris, Berlin) ligger lägre än de lite mer udda (Ulan Bator, Baku, Zagreb).", subs: [["rank", "Efter sannolikhet"], ["extra", "Träna extra"]], prefix: ["k:"] },
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
          <div class="fl-text">${it.t === "k" ? `<div class="fl-country">${esc(it.name)}</div>` : ""}${st.revealed ? (it.t === "g" ? `<div class="muted">${answer}</div>` : answer) : `<div class="muted">${it.t === "k" ? "Vad heter huvudstaden?" : prompt}</div>`}</div>
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
