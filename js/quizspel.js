/*
 * Quizspel (#/quizspel): färdiga quiz med flervalsalternativ, spelade som på sajten de kommer från.
 * Välj kategori, välj quiz, klicka på ett alternativ och se direkt om det var rätt.
 * Data läggs in av data/quiz/*.js via PQ.quizspel.add(id, namn, ikon, [quiz]).
 * Resultat sparas i inställningen "quizspel.res" (bästa resultat per quiz).
 */
(function () {
  const PQ = window.PQ;
  PQ.views = PQ.views || {};
  const cats = []; // { id, name, icon, quizzes: [{ i, t, d, dt, q:[[fråga, [alt], rätt index, förklaring]] }] }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const UI = () => PQ.ui;
  const LETTERS = "ABCDEFGH";

  const st = { screen: "cats", cat: null, diff: "alla", sort: "nyast", quiz: null, idx: 0, picked: null, answers: [] };

  function results() { return PQ.store.setting("quizspel.res", {}); }
  function saveResult(cat, quiz, right) {
    const all = results(), k = cat.id + "/" + quiz.i, prev = all[k];
    all[k] = { right, total: quiz.q.length, best: Math.max(right, prev ? prev.best : 0), plays: (prev ? prev.plays : 0) + 1, last: new Date().toISOString().slice(0, 10) };
    PQ.store.setSetting("quizspel.res", all);
  }

  PQ.quizspel = {
    add(id, name, icon, quizzes) {
      let c = cats.find((x) => x.id === id);
      if (!c) { c = { id, name, icon, quizzes: [] }; cats.push(c); }
      c.quizzes.push(...quizzes);
      if (PQ.quizspel.onChange) PQ.quizspel.onChange();
    },
    count() { return cats.reduce((n, c) => n + c.quizzes.length, 0); },
    categories: cats,
  };

  const fmtDate = (s) => { if (!s) return ""; const [y, m, d] = s.split("-"); return d + "/" + m + " " + y; };
  const dots = (d) => ({ "lätt": "●○○", "medel": "●●○", "svår": "●●●" }[d] || "●●○");

  function render() {
    const ui = UI();
    if (!cats.length) {
      ui.mount(`<a class="back" href="#/">← Startsidan</a><div class="page-head"><h1>🧩 Quizspel</h1><p>Inga quiz inlästa.</p></div>`);
      return;
    }
    if (st.screen === "list" && !st.cat) st.screen = "cats";
    if (st.screen === "play" && !st.quiz) st.screen = "list";
    ({ cats: renderCats, list: renderList, play: renderPlay, done: renderDone }[st.screen] || renderCats)();
  }

  // ---- 1. Kategorier ----
  function renderCats() {
    const ui = UI(), res = results();
    ui.mount(`
      <a class="back" href="#/">← Startsidan</a>
      <div class="page-head"><h1>🧩 Quizspel</h1><p>Spela färdiga quiz med alternativ. Välj en kategori.</p></div>
      <div class="cat-grid">
        ${cats.map((c) => {
          const played = c.quizzes.filter((q) => res[c.id + "/" + q.i]).length;
          return `<button type="button" class="cat-card" data-cat="${esc(c.id)}">
            <div class="top"><span class="emo" aria-hidden="true">${c.icon}</span><span class="name">${esc(c.name)}</span></div>
            <div class="cnt">${c.quizzes.length} quiz${played ? ` · ${played} spelade` : ""}</div>
          </button>`;
        }).join("")}
      </div>`);
    ui.onViewClick((e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      st.cat = cats.find((c) => c.id === b.dataset.cat); st.screen = "list"; render(); window.scrollTo(0, 0);
    });
  }

  // ---- 2. Quizlista ----
  function renderList() {
    const ui = UI(), res = results(), c = st.cat;
    let list = c.quizzes.filter((q) => st.diff === "alla" || q.d === st.diff);
    if (st.sort === "nyast") list = list.slice().sort((a, b) => (b.dt || "").localeCompare(a.dt || ""));
    else if (st.sort === "aldst") list = list.slice().sort((a, b) => (a.dt || "").localeCompare(b.dt || ""));
    else if (st.sort === "ospelade") list = list.slice().sort((a, b) => !!res[c.id + "/" + a.i] - !!res[c.id + "/" + b.i]);
    const seg = (name, opts, val) => `<div class="seg" role="group" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === val}">${l}</button>`).join("")}</div>`;
    ui.mount(`
      <button type="button" class="back" data-act="cats" style="background:none;border:0;cursor:pointer;padding:0">← Alla kategorier</button>
      <div class="page-head"><h1>${c.icon} ${esc(c.name)}</h1><p>${list.length} av ${c.quizzes.length} quiz</p></div>
      <div class="row" style="gap:12px;margin-bottom:16px;flex-wrap:wrap">
        ${seg("diff", [["alla", "Alla"], ["lätt", "Lätt"], ["medel", "Medel"], ["svår", "Svår"]], st.diff)}
        ${seg("sort", [["nyast", "Nyast"], ["aldst", "Äldst"], ["ospelade", "Ospelade först"]], st.sort)}
      </div>
      <div class="qs-list">
        ${list.map((q) => {
          const r = res[c.id + "/" + q.i];
          return `<button type="button" class="qs-item" data-quiz="${esc(q.i)}">
            <span class="qs-title">${esc(q.t)}</span>
            <span class="qs-meta"><span title="${esc(q.d)}">${dots(q.d)}</span> · ${q.q.length} frågor${q.dt ? " · " + fmtDate(q.dt) : ""}</span>
            ${r ? `<span class="pill qs-best">Bäst ${r.best}/${r.total}</span>` : ""}
          </button>`;
        }).join("") || `<p class="muted">Inga quiz med de valen.</p>`}
      </div>`);
    ui.onViewClick((e) => {
      const seg = e.target.closest("[data-seg] button");
      if (seg) { st[seg.parentNode.dataset.seg] = seg.dataset.v; render(); return; }
      if (e.target.closest("[data-act='cats']")) { st.screen = "cats"; render(); window.scrollTo(0, 0); return; }
      const b = e.target.closest("[data-quiz]"); if (!b) return;
      st.quiz = c.quizzes.find((q) => q.i === b.dataset.quiz); st.idx = 0; st.picked = null; st.answers = []; st.screen = "play"; render(); window.scrollTo(0, 0);
    });
  }

  // ---- 3. Spela ----
  function renderPlay() {
    const ui = UI(), quiz = st.quiz, [text, opts, correct, expl] = quiz.q[st.idx];
    const answered = st.picked != null, last = st.idx >= quiz.q.length - 1;
    ui.mount(`
      <button type="button" class="back" data-act="quit" style="background:none;border:0;cursor:pointer;padding:0">← Avbryt quiz</button>
      <div class="quiz-top"><div class="progress"><div style="width:${100 * (st.idx + (answered ? 1 : 0)) / quiz.q.length}%"></div></div><div class="quiz-count">${st.idx + 1} / ${quiz.q.length}</div></div>
      <article class="card">
        <div class="card-meta"><span class="pill">${esc(st.cat.name)}</span><span class="pill">${esc(quiz.t)}</span></div>
        <div class="qs-q">${esc(text)}</div>
        <div class="qs-opts">
          ${opts.map((o, i) => {
            let cls = "";
            if (answered) cls = i === correct ? "right" : i === st.picked ? "wrong" : "dim";
            return `<button type="button" class="qs-opt ${cls}" data-opt="${i}" ${answered ? "disabled" : ""}>
              <span class="qs-key">${LETTERS[i]}</span><span>${esc(o)}</span>${answered && i === correct ? `<span class="qs-mark">✓</span>` : answered && i === st.picked ? `<span class="qs-mark">✗</span>` : ""}
            </button>`;
          }).join("")}
        </div>
        ${answered ? `<div class="qs-result ${st.picked === correct ? "ok" : "no"}"><b>${st.picked === correct ? "Rätt!" : "Fel."}</b> ${st.picked === correct ? "" : "Rätt svar: " + esc(opts[correct]) + "."}${expl ? `<p>${esc(expl)}</p>` : ""}</div>
          <button type="button" class="btn primary reveal" data-act="next">${last ? "SE RESULTAT" : "NÄSTA FRÅGA"}</button>` : ""}
      </article>
      <div class="quiz-foot"><span class="kbd-hints"><kbd>A</kbd>–<kbd>D</kbd> eller <kbd>1</kbd>–<kbd>4</kbd> välj · <kbd>Mellanslag</kbd> nästa</span></div>`);

    const pick = (i) => { if (st.picked != null || i < 0 || i >= opts.length) return; st.picked = i; st.answers.push(i); renderPlay(); };
    const next = () => {
      if (st.picked == null) return;
      if (last) finish(); else { st.idx++; st.picked = null; renderPlay(); window.scrollTo(0, 0); }
    };
    ui.onViewClick((e) => {
      const o = e.target.closest("[data-opt]"); if (o) { pick(+o.dataset.opt); return; }
      const a = e.target.closest("[data-act]"); if (!a) return;
      if (a.dataset.act === "next") next();
      else if (a.dataset.act === "quit") { st.screen = "list"; st.quiz = null; render(); }
    });
    ui.setKeys((e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter") { e.preventDefault(); next(); return; }
      const i = LETTERS.toLowerCase().indexOf(k) >= 0 && k.length === 1 ? LETTERS.toLowerCase().indexOf(k) : "12345678".indexOf(k);
      if (i >= 0) pick(i);
    });
  }

  function finish() {
    const right = st.quiz.q.reduce((n, q, i) => n + (st.answers[i] === q[2] ? 1 : 0), 0);
    saveResult(st.cat, st.quiz, right);
    st.screen = "done"; render(); window.scrollTo(0, 0);
  }

  // ---- 4. Resultat ----
  function renderDone() {
    const ui = UI(), quiz = st.quiz;
    const right = quiz.q.reduce((n, q, i) => n + (st.answers[i] === q[2] ? 1 : 0), 0);
    const r = results()[st.cat.id + "/" + quiz.i];
    ui.mount(`
      <a class="back" href="#/">← Startsidan</a>
      <div class="page-head"><h1>${esc(quiz.t)}</h1><p>${esc(st.cat.name)}</p></div>
      <div class="panel qs-score"><div class="qs-big">${right} / ${quiz.q.length}</div><div class="muted">rätt${r ? ` · bästa resultat ${r.best}/${r.total}` : ""}</div></div>
      <h2 class="section-title">Dina svar</h2>
      <div class="qs-review">
        ${quiz.q.map(([text, opts, correct], i) => {
          const ok = st.answers[i] === correct;
          return `<div class="qs-rev ${ok ? "ok" : "no"}"><div class="qs-rev-q">${ok ? "✓" : "✗"} ${esc(text)}</div>
            <div class="small">${ok ? "Rätt: " + esc(opts[correct]) : `Du svarade <b>${esc(opts[st.answers[i]])}</b>. Rätt: <b>${esc(opts[correct])}</b>`}</div></div>`;
        }).join("")}
      </div>
      <div class="row" style="gap:10px;margin-top:20px;flex-wrap:wrap">
        <button type="button" class="btn accent" data-act="again">Spela om</button>
        <button type="button" class="btn" data-act="list">Fler quiz i ${esc(st.cat.name)}</button>
        <button type="button" class="btn ghost" data-act="cats">Alla kategorier</button>
      </div>`);
    ui.onViewClick((e) => {
      const a = e.target.closest("[data-act]"); if (!a) return;
      if (a.dataset.act === "again") { st.idx = 0; st.picked = null; st.answers = []; st.screen = "play"; }
      else if (a.dataset.act === "list") { st.screen = "list"; st.quiz = null; }
      else if (a.dataset.act === "cats") { st.screen = "cats"; st.quiz = null; }
      render(); window.scrollTo(0, 0);
    });
  }

  PQ.views.quizspel = (params) => {
    if (params && params.get("ny")) { st.screen = "cats"; st.quiz = null; }
    render();
  };
})();
