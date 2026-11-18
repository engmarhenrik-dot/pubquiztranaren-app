/*
 * Filmaffischer (#/affischer): se affischen, visa svaret (filmens titel och år).
 *  - Internationella: de 200 mest kända filmerna. Svenska: de 50 mest kända svenska filmerna.
 *  - Ordningen är ungefär efter hur kända filmerna är. Bocka i "Blanda" för slumpad ordning.
 *  - ☆ Träna extra sparar kortet i fliken Träna extra (inställningen "filmer.extra").
 * Data finns i data/affischer.js (skapas av verktyg/hamta-affischer.py). Bilderna visas direkt från Wikimedia.
 */
(function () {
  const PQ = window.PQ;
  PQ.views = PQ.views || {};
  const D = PQ.filmData;
  if (!D) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // [original, svensk titel, år, bild-URL]; placering = ordningen i listan
  const ALL = [];
  [["int", "Internationella"], ["sve", "Svenska"]].forEach(([g]) => (D[g] || []).forEach((f, i) => ALL.push({ g, id: g + ":" + (i + 1), rank: i + 1, orig: f[0], sv: f[1], year: f[2], img: f[3] })));
  const COUNT = { int: ALL.filter((f) => f.g === "int").length, sve: ALL.filter((f) => f.g === "sve").length };

  const state = { sub: "int", shuffle: false, deck: [], pos: 0, revealed: false, failed: false };
  const saved = () => new Set(PQ.store.setting("filmer.extra", []));
  function toggleSaved(f) {
    const s = saved();
    if (s.has(f.id)) s.delete(f.id); else s.add(f.id);
    PQ.store.setSetting("filmer.extra", [...s]);
    return s.has(f.id);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function render() {
    const st = state, ui = PQ.ui;

    function buildDeck() {
      let deck = st.sub === "extra" ? ALL.filter((f) => saved().has(f.id)) : ALL.filter((f) => f.g === st.sub);
      deck = deck.slice();
      if (st.shuffle) shuffle(deck);
      st.deck = deck;
      st.pos = Math.min(st.pos, Math.max(deck.length - 1, 0));
      st.revealed = false;
    }

    function frame() {
      ui.mount(`
        <a class="back" href="#/">← Startsidan</a>
        <div class="page-head"><h1>🎬 Filmaffischer</h1><p>Se affischen och försök komma på filmen. Kortet visar titel och år när du trycker på visa svar. Filmerna ligger ungefär efter hur kända de är.</p></div>
        <div class="row fl-controls">
          <div class="seg" role="group" aria-label="Samling">
            <button type="button" data-sub="int" aria-pressed="${st.sub === "int"}">Internationella (${COUNT.int})</button>
            <button type="button" data-sub="sve" aria-pressed="${st.sub === "sve"}">Svenska (${COUNT.sve})</button>
            <button type="button" data-sub="extra" aria-pressed="${st.sub === "extra"}">Träna extra (${saved().size})</button>
          </div>
          <label class="check-row"><input type="checkbox" id="fmShuffle" ${st.shuffle ? "checked" : ""}> Blanda ordningen</label>
        </div>
        <div class="quiz fl-quiz" id="fmBody"></div>`);
      ui.onViewClick(onClick);
      buildDeck();
      paint();
    }

    function paint() {
      const body = document.getElementById("fmBody");
      const f = st.deck[st.pos];
      if (!f) {
        body.innerHTML = `<article class="card"><p class="muted" style="margin:0">${st.sub === "extra"
          ? "Inget sparat än. Klicka på ☆ Träna extra på en affisch för att samla de filmer du behöver öva mer på."
          : "Inga affischer att visa."}</p></article>`;
        return;
      }
      const isSaved = saved().has(f.id);
      const nxt = st.deck[st.pos + 1]; if (nxt && nxt.img) new Image().src = nxt.img; // förladda nästa affisch
      const same = !f.sv || f.sv === f.orig;
      const poster = f.img
        ? `<div class="fm-poster"><img alt="Filmaffisch" src="${esc(f.img)}" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('fm-missing');this.remove()"><span class="fm-none">Ingen affisch hittades</span></div>`
        : `<div class="fm-poster fm-missing"><span class="fm-none">Ingen affisch hittades</span></div>`;
      body.innerHTML = `
        <div class="quiz-top"><div class="progress"><div style="width:${100 * (st.pos + 1) / st.deck.length}%"></div></div><div class="quiz-count">${st.pos + 1} / ${st.deck.length}</div></div>
        <article class="card">
          <div class="card-meta">
            <span class="pill">${f.g === "sve" ? "Svensk film" : "Internationell film"} · plats ${f.rank}</span>
            <span class="spacer"></span>
            <button class="btn small ${isSaved ? "accent" : ""}" type="button" data-act="star" aria-pressed="${isSaved}">${isSaved ? "★ Sparad" : "☆ Träna extra"}</button>
          </div>
          ${poster}
          <div class="fl-text">${st.revealed
            ? `<div class="fl-answer">${esc(f.orig)}</div>${same ? "" : `<div class="fm-sv">På svenska: <b>${esc(f.sv)}</b></div>`}<div class="muted">${f.year}</div>`
            : `<div class="muted">Vilken film är det här?</div>`}</div>
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
      const f = st.deck[st.pos]; if (!f) return;
      const on = toggleSaved(f);
      if (st.sub === "extra" && !on) { st.deck.splice(st.pos, 1); st.pos = Math.min(st.pos, Math.max(st.deck.length - 1, 0)); st.revealed = false; }
      const keepDeck = st.deck, keepPos = st.pos, keepRev = st.revealed;
      frame(); st.deck = keepDeck; st.pos = keepPos; st.revealed = keepRev; paint();
    }

    const onClick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.sub) { st.sub = b.dataset.sub; st.pos = 0; frame(); }
      else if (b.dataset.act === "reveal") reveal();
      else if (b.dataset.act === "prev") step(-1);
      else if (b.dataset.act === "next") step(1);
      else if (b.dataset.act === "star") star();
    };
    const view = document.getElementById("view");
    const onChange = (e) => { if (e.target.id === "fmShuffle") { st.shuffle = e.target.checked; st.pos = 0; frame(); } };
    if (view._fmChange) view.removeEventListener("change", view._fmChange);
    view._fmChange = onChange;
    view.addEventListener("change", onChange);

    ui.setKeys((e) => {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter") { e.preventDefault(); reveal(); }
      else if (k === "arrowright") step(1);
      else if (k === "arrowleft") step(-1);
      else if (k === "s") star();
    });

    st.pos = 0;
    frame();
  }

  PQ.views.affischer = () => render();
  PQ.films = { count: () => ALL.length };
})();
