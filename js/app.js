/*
 * Gränssnittet: routing, vyer (start, inställning, quiz, resultat, statistik, frågebank).
 */
(function () {
  const PQ = window.PQ;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const view = $("#view");
  PQ.views = PQ.views || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const fmtDate = (iso) => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" }) : "");
  const fmtMonth = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  const cat = (id) => PQ.CATEGORY[id] || { id, name: id, icon: "❔", hue: 0 };
  const hue = (id) => `style="--h:${cat(id).hue}"`;
  const DIFF_NUM = { "lätt": 1, "medel": 2, "svår": 3 };
  const diffBadge = (d) => `<span class="diff d${DIFF_NUM[d]}"><i><b></b><b></b><b></b></i>${esc(d.charAt(0).toUpperCase() + d.slice(1))}</span>`;

  const MODES = {
    pubquiz:  { name: "Blandat pubquiz",   icon: "🍻", desc: "En realistisk quizkväll: alla kategorier, från lätt till svårt." },
    fritt:    { name: "Träna fritt",       icon: "🎯", desc: "Välj kategorier och nivå. Spela så länge du vill." },
    svaga:    { name: "Svaga kategorier",  icon: "📈", desc: "Prioriterar kategorierna där du har sämst resultat." },
    repetera: { name: "Repetera missade",  icon: "🔁", desc: "Bara frågor du markerat som KUNDE INTE SVARET." },
    aktuellt: { name: "Dagens quiz",       icon: "📰", desc: "Ett nytt quiz om dagens nyheter varje dag kl. 15. Sparas i en vecka." },
  };
  // Lägen som inte har ett eget kort på startsidan, men som visas på resultatsidan.
  const RESULT_MODES = Object.assign({}, MODES, {
    aktuellt: { name: "Äldre aktuella frågor", icon: "📰" },
    dagsquiz: { name: "Dagens quiz", icon: "📰" },
  });
  const WEEKDAY = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("sv-SE", { weekday: "long" });
  const dayTitle = (iso) => { const d = new Date(iso + "T12:00:00"); return d.toLocaleDateString("sv-SE", { day: "numeric", month: "long" }); };

  let session = null;
  let lastSummary = null;
  let keyHandler = null;

  // ---------- Hjälpare ----------
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  async function download(filename, text, type) {
    const host = PQ.host || {};
    if (host.inClaude) {
      // I claude.ai får sidan inte ladda ner själv; downloads-funktionen frågar användaren först.
      if (!host.downloads) { toast("Nedladdning är inte tillgänglig här."); return; }
      try { await host.downloads.save({ filename, data: text }); toast("Filen är sparad."); }
      catch (e) { if (e && e.code !== "declined") toast("Kunde inte spara filen."); }
      return;
    }
    const blob = new Blob([text], { type: type || "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // Egen bekräftelseruta: confirm() fungerar inte när sidan visas i claude.ai.
  function askConfirm(message, okLabel) {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.className = "modal-back";
      wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalMsg">
        <p id="modalMsg">${esc(message).replace(/\n/g, "<br>")}</p>
        <div class="row"><span class="spacer"></span><button class="btn ghost" type="button" data-r="0">Avbryt</button>
        <button class="btn accent" type="button" data-r="1">${esc(okLabel || "OK")}</button></div></div>`;
      const done = (r) => { document.removeEventListener("keydown", onKey, true); wrap.remove(); resolve(r); };
      const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
      wrap.addEventListener("click", (e) => {
        const b = e.target.closest("[data-r]");
        if (b) done(b.dataset.r === "1"); else if (e.target === wrap) done(false);
      });
      document.addEventListener("keydown", onKey, true);
      document.body.appendChild(wrap);
      wrap.querySelector('[data-r="1"]').focus();
    });
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* ignoreras */ }
      ta.remove(); return ok;
    }
  }

  function setupFor(mode) {
    const defaults = {
      fritt: { categories: [], difficulty: "alla", length: 0 },
      pubquiz: { length: 30 },
      svaga: { categories: [], difficulty: "alla", length: 20 },
      repetera: { scope: "last", categories: [], length: 0 },
      aktuellt: { length: 0 },
    };
    return Object.assign({}, defaults[mode], PQ.store.setting("setup." + mode, {}));
  }

  function totals() {
    const log = PQ.store.log();
    const right = log.reduce((a, e) => a + e.ok, 0);
    return { answered: log.length, right, wrong: log.length - right };
  }

  // ---------- Routing ----------
  // Vyn hålls i en egen variabel så att navigeringen fungerar även där sidans
  // adress inte kan ändras (som inbäddad sida i claude.ai).
  let current = location.hash.startsWith("#/") ? location.hash : "#/";
  function go(h) {
    current = h;
    try { if (location.hash !== h) history[PQ.host && PQ.host.inClaude ? "replaceState" : "pushState"](null, "", h); } catch (e) { /* adressen kan vara låst */ }
    route();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });

  function route() {
    const hash = current.replace(/^#\/?/, "");
    const [path, query] = hash.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = new URLSearchParams(query || "");
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    $$(".nav a").forEach((a) => a.classList.toggle("active",
      a.dataset.nav === (parts[0] === "statistik" ? "statistik" : parts[0] === "fragebank" ? "fragebank" : PQ.views[parts[0]] ? parts[0] : "hem")));

    if (PQ.views[parts[0]]) { PQ.views[parts[0]](params); window.scrollTo(0, 0); return; }
    switch (parts[0]) {
      case undefined: renderHome(); break;
      case "lage": parts[1] === "aktuellt" ? renderDaily() : MODES[parts[1]] ? renderSetup(parts[1], params) : renderHome(); break;
      case "quiz": session ? renderQuiz() : go("#/"); break;
      case "resultat": lastSummary ? renderResult() : go("#/"); break;
      case "statistik": renderStats(); break;
      case "fragebank": renderBank(); break;
      default: renderHome();
    }
    window.scrollTo(0, 0);
  }

  function mount(html) {
    if (view._click) { view.removeEventListener("click", view._click); view._click = null; }
    view.innerHTML = `<div class="view">${html}</div>`;
  }

  // Varje vy har en klicklyssnare på #view; den ersätts när vyn byts.
  function onViewClick(fn) {
    if (view._click) view.removeEventListener("click", view._click);
    view._click = fn;
    view.addEventListener("click", fn);
  }

  // ---------- Startsida ----------
  function renderHome() {
    const t = totals();
    const missed = PQ.engine.missedQuestions("last").length;
    const fresh = PQ.daily.unplayed();
    const bankSize = PQ.bank.active().length;
    const counts = {};
    PQ.bank.active().forEach((q) => (counts[q.category] = (counts[q.category] || 0) + 1));

    const modeCard = (id, extra) => {
      const m = MODES[id];
      return `<a class="mode ${id === "pubquiz" ? "featured" : ""}" href="#/lage/${id}">
        <span class="ico" aria-hidden="true">${m.icon}</span>
        ${extra ? `<span class="badge" title="${id === "aktuellt" ? "Ospelade quiz" : "Antal frågor"}">${extra}</span>` : ""}
        <h3>${m.name}</h3><p>${m.desc}</p></a>`;
    };

    mount(`
      <section class="hero">
        <div class="hero-text">
          <span class="pill">Träning inför svenska pubquiz</span>
          <h1 style="margin-top:14px">Bli lagets<br>säkra kort.</h1>
          <p>Flashcards med ${bankSize} källbelagda frågor om musik, film, sport, Sverige och allt däremellan. Ingen tidspress: tänk efter, visa svaret och bedöm dig själv ärligt.</p>
          <div class="row">
            <a class="btn accent" href="#/lage/pubquiz">Starta ett pubquiz</a>
            <a class="btn" href="#/lage/fritt">Träna fritt</a>
          </div>
        </div>
        <div class="kpis">
          <div class="kpi"><div class="v">${t.answered}</div><div class="l">besvarade frågor</div></div>
          <div class="kpi"><div class="v">${t.answered ? pct(t.right, t.answered) + "%" : "–"}</div><div class="l">andel du kunde</div></div>
          <div class="kpi"><div class="v">${missed}</div><div class="l">att repetera</div></div>
          <div class="kpi"><div class="v">${bankSize}</div><div class="l">frågor i banken</div></div>
        </div>
      </section>

      <h2 class="section-title">Spellägen</h2>
      <div class="modes">
        ${modeCard("pubquiz")}${modeCard("fritt")}${modeCard("svaga")}
        ${modeCard("repetera", missed || "")}${modeCard("aktuellt", fresh || "")}
        <a class="mode" href="#/flaggor"><span class="ico" aria-hidden="true">🏳️</span><h3>Flaggor</h3><p>Känn igen ${PQ.flagData ? PQ.flagData.tiers.reduce((n, t) => n + t.items.trim().split("|").length, 0) : ""} flaggor, sorterade efter hur troliga de är på ett pubquiz.</p></a>
        <a class="mode" href="#/huvudstader"><span class="ico" aria-hidden="true">🏛️</span><h3>Huvudstäder</h3><p>Se flaggan och landet, svara med huvudstaden.</p></a>
      </div>

      <h2 class="section-title">Kategorier <span class="muted">välj en för att träna direkt</span></h2>
      <div class="cat-grid">
        ${PQ.CATEGORIES.map((c) => `
          <a class="cat-card cat" ${hue(c.id)} href="#/lage/fritt?kat=${c.id}">
            <div class="top"><span class="emo" aria-hidden="true">${c.icon}</span><span class="name">${esc(c.name)}</span></div>
            <div class="sub">${esc(c.blurb)}</div>
            <div class="cnt">${counts[c.id] || 0} frågor</div>
          </a>`).join("")}
      </div>
    `);
  }

  // ---------- Inställning före omgång ----------
  function renderSetup(mode, params) {
    const m = MODES[mode];
    const cfg = setupFor(mode);
    if (params && params.get("kat") && PQ.CATEGORY[params.get("kat")]) cfg.categories = [params.get("kat")];

    const segment = (name, options, value) => `
      <div class="seg" role="group" data-seg="${name}">
        ${options.map(([v, label]) => `<button type="button" data-v="${v}" aria-pressed="${String(v) === String(value)}">${label}</button>`).join("")}
      </div>`;

    let body = "";
    if (mode === "fritt" || mode === "svaga" || mode === "repetera") {
      body += `
        <div class="field">
          <div class="row" style="margin-bottom:10px">
            <span class="label" style="font-weight:650">Kategorier</span>
            <span class="muted small" id="catHint"></span>
            <span class="spacer"></span>
            <button class="btn small ghost" type="button" data-act="all">Välj alla</button>
            <button class="btn small ghost" type="button" data-act="none">Rensa</button>
          </div>
          <div class="cat-grid" id="catGrid"></div>
        </div>`;
    }
    if (mode === "fritt" || mode === "svaga") {
      body += `<div class="field"><span class="label">Svårighetsgrad</span>
        ${segment("difficulty", [["alla", "Alla (realistisk mix)"], ["lätt", "Endast lätt"], ["medel", "Endast medel"], ["svår", "Endast svår"]], cfg.difficulty)}
        <div class="hint">"Alla" blandar ungefär 30 % lätta, 50 % medel och 20 % svåra frågor, som på en vanlig quizkväll.</div></div>`;
    }
    if (mode === "repetera") {
      const last = PQ.engine.missedQuestions("last").length, ever = PQ.engine.missedQuestions("ever").length;
      body += `<div class="field"><span class="label">Vilka frågor?</span>
        ${segment("scope", [["last", `Senast markerade KUNDE INTE (${last})`], ["ever", `Någon gång missade (${ever})`]], cfg.scope)}
        <div class="hint">Missar du en fråga igen kommer den tillbaka en gång till längre fram i omgången.</div></div>`;
    }
    if (mode === "svaga") body += `<div class="field"><span class="label">Så prioriteras kategorierna just nu</span><div class="panel" id="weakPanel"></div></div>`;
    if (mode === "pubquiz") {
      body += `<div class="panel" style="margin-top:8px">
        <p style="margin:0 0 12px">Slumpade frågor från alla kategorier, viktade som ett vanligt svenskt pubquiz: lite övervikt för nöje (musik, film/TV, populärkultur), sedan geografi, sport, historia och resten. Aktuellt samt mat, dryck och bakverk ingår inte. Lätta frågor i början och svårare mot slutet.</p>
        <div class="row">${Object.entries(PQ.PUBQUIZ_WEIGHTS).map(([id, w]) => `<span class="chip cat" ${hue(id)}>${cat(id).icon} ${esc(cat(id).name)} · ${w}%</span>`).join("")}</div>
      </div>`;
    }
    if (mode === "aktuellt") {
      const fresh = PQ.engine.freshNews();
      const newest = fresh[0];
      body += `<div class="panel" style="margin-top:8px">
        ${fresh.length ? `<p style="margin:0">${fresh.length} aktuella frågor om händelser de senaste ${PQ.FRESH_DAYS} dagarna. Senaste händelsen: <b>${fmtDate(newest.eventDate)}</b>. Varje fråga visar händelsedatum och när uppgiften kontrollerades. Äldre nyheter och frågor vars svar kan ha ändrats sorteras bort automatiskt.</p>`
          : `<p style="margin:0">Det finns inga färska aktuella frågor just nu. Gå till <a href="#/fragebank">Frågebanken</a> och hämta nya med research.</p>`}
      </div>`;
    }
    const lengthOpts = {
      fritt: [[0, "Obegränsat"], [10, "10"], [20, "20"], [50, "50"]],
      svaga: [[0, "Obegränsat"], [10, "10"], [20, "20"], [40, "40"]],
      pubquiz: [[10, "10"], [20, "20"], [30, "30"], [40, "40"], [50, "50"]],
      repetera: [[0, "Alla"], [10, "10"], [20, "20"]],
      aktuellt: [[0, "Alla"], [10, "10"], [20, "20"]],
    }[mode];
    body += `<div class="field"><span class="label">Antal frågor</span>${segment("length", lengthOpts, cfg.length)}</div>`;

    mount(`
      <a class="back" href="#/">← Tillbaka</a>
      <div class="page-head"><h1>${m.icon} ${m.name}</h1><p>${m.desc}</p></div>
      ${body}
      <div class="start-bar"><div class="info" id="availInfo"></div><button class="btn accent" id="startBtn" type="button">Starta omgången →</button></div>
    `);

    function availableFor(c) {
      switch (mode) {
        case "pubquiz": return Math.min(c.length, PQ.engine.pool({}).filter((q) => PQ.PUBQUIZ_WEIGHTS[q.category]).length);
        case "aktuellt": return c.length ? Math.min(c.length, PQ.engine.freshNews().length) : PQ.engine.freshNews().length;
        case "repetera": {
          let list = PQ.engine.missedQuestions(c.scope);
          if (c.categories.length) list = list.filter((q) => c.categories.includes(q.category));
          return c.length ? Math.min(c.length, list.length) : list.length;
        }
        default: return PQ.engine.pool(c).length;
      }
    }

    function drawCats() {
      const grid = $("#catGrid");
      if (!grid) return;
      let source;
      if (mode === "repetera") source = PQ.engine.missedQuestions(cfg.scope);
      else source = PQ.engine.pool({ difficulty: cfg.difficulty });
      const counts = {};
      source.forEach((q) => (counts[q.category] = (counts[q.category] || 0) + 1));
      grid.innerHTML = PQ.CATEGORIES.map((c) => `
        <button type="button" class="cat-card cat" ${hue(c.id)} data-cat="${c.id}" aria-pressed="${cfg.categories.includes(c.id)}">
          <span class="check" aria-hidden="true">✓</span>
          <div class="top"><span class="emo" aria-hidden="true">${c.icon}</span><span class="name">${esc(c.name)}</span></div>
          <div class="cnt">${counts[c.id] || 0} frågor</div>
        </button>`).join("");
      $("#catHint").textContent = cfg.categories.length ? `${cfg.categories.length} valda` : "Inga valda = alla kategorier";
    }

    function drawWeak() {
      const panel = $("#weakPanel");
      if (!panel) return;
      const w = PQ.engine.weakCategoryWeights(cfg.categories.length ? cfg.categories : null);
      const rows = Object.entries(w).sort((a, b) => b[1].weight - a[1].weight);
      const maxW = Math.max(...rows.map((r) => r[1].weight));
      const total = rows.reduce((a, r) => a + r[1].weight, 0);
      panel.innerHTML = `<div class="bars">${rows.map(([id, r]) => `
        <div class="bar-row">
          <div class="lbl"><span>${cat(id).icon}</span><span>${esc(cat(id).name)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(100 * r.weight) / maxW}%"></div></div>
          <div class="num">${Math.round((100 * r.weight) / total)}% <small>av frågorna</small></div>
        </div>`).join("")}</div>
        <p class="muted small" style="margin:14px 0 0">Baserat på din andel rätt per kategori. Kategorier med färre än 5 besvarade frågor får en extra knuff så att de också testas.</p>`;
    }

    function update() {
      PQ.store.setSetting("setup." + mode, cfg);
      $$(".seg").forEach((seg) => $$("button", seg).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v) === String(cfg[seg.dataset.seg]))));
      drawCats(); drawWeak();
      const n = availableFor(cfg);
      const info = $("#availInfo");
      if (mode === "fritt" || mode === "svaga") info.innerHTML = `<b>${n}</b> frågor i urvalet${cfg.length ? ` · omgång om ${Math.min(cfg.length, n)}` : " · spela så länge du vill"}`;
      else info.innerHTML = `<b>${n}</b> frågor i omgången`;
      $("#startBtn").disabled = n === 0;
    }

    onViewClick((e) => {
      const segBtn = e.target.closest(".seg button");
      if (segBtn) {
        const key = segBtn.parentElement.dataset.seg;
        cfg[key] = key === "length" ? Number(segBtn.dataset.v) : segBtn.dataset.v;
        update(); return;
      }
      const card = e.target.closest("[data-cat]");
      if (card) {
        const id = card.dataset.cat;
        cfg.categories = cfg.categories.includes(id) ? cfg.categories.filter((x) => x !== id) : cfg.categories.concat(id);
        update(); return;
      }
      const act = e.target.closest("[data-act]");
      if (act) { cfg.categories = act.dataset.act === "all" ? PQ.CATEGORIES.map((c) => c.id) : []; update(); return; }
      if (e.target.closest("#startBtn")) startSession(Object.assign({ mode }, cfg));
    });
    update();
  }

  // ---------- Dagens quiz ----------
  function renderDaily() {
    const quizzes = PQ.daily.list();
    const today = PQ.bank.today();
    const older = PQ.engine.freshNews().length;
    const row = (z) => {
      const st = PQ.daily.status(z);
      const isToday = z.date === today;
      const badge = st.state === "ny" ? `<span class="dq-state new">Inte spelat</span>`
        : st.state === "klar" ? `<span class="dq-state done">✓ Spelat · ${st.right}/${st.total} rätt</span>`
        : `<span class="dq-state part">Påbörjat · ${st.answered}/${st.total}</span>`;
      return `<button type="button" class="dq-item ${st.state === "klar" ? "done" : ""}" data-date="${z.date}">
        <span class="dq-date"><b><i>${esc(WEEKDAY(z.date))}</i>${isToday ? " · i dag" : ""}</b><span>${esc(dayTitle(z.date))}</span></span>
        <span class="dq-body"><b>${esc(z.title || "Quiz " + z.date)}</b>${z.intro ? `<small>${esc(z.intro)}</small>` : ""}
          <span class="dq-meta">${st.total} frågor ${badge}</span></span>
        <span class="dq-go" aria-hidden="true">${st.state === "klar" ? "↻" : "→"}</span>
      </button>`;
    };
    const hasToday = quizzes.some((z) => z.date === today);
    const hour = new Date().getHours();
    mount(`
      <a class="back" href="#/">← Tillbaka</a>
      <div class="page-head"><h1>📰 Dagens quiz</h1><p>Ett nytt quiz varje dag kl. 15, byggt på dagens nyheter: Omni, SVT, Sveriges Radio, mest lästa på Wikipedia, Google-trender, musik, film och Jämtland. Varje quiz finns kvar i en vecka.</p></div>
      ${!hasToday ? `<p class="muted small">${hour < 15 ? "Dagens quiz kommer kl. 15." : "Dagens quiz är inte klart än."}</p>` : ""}
      ${quizzes.length ? `<div class="dq-list">${quizzes.map(row).join("")}</div>`
        : `<div class="panel"><p style="margin:0">Det finns inga quiz från den senaste veckan än.</p></div>`}
      ${older ? `<div class="row" style="margin-top:22px"><button class="btn ghost small" id="olderNews" type="button">Spela äldre aktuella frågor ur banken (${older})</button></div>` : ""}
    `);
    onViewClick((e) => {
      const item = e.target.closest("[data-date]");
      if (item) {
        const z = PQ.daily.get(item.dataset.date);
        if (z) startSession({ mode: "dagsquiz", date: z.date, ids: PQ.daily.idsOf(z), length: 0 });
        return;
      }
      if (e.target.closest("#olderNews")) startSession({ mode: "aktuellt", length: 0 });
    });
  }

  function startSession(config) {
    const s = PQ.engine.createSession(config);
    if (!s.poolSize || (s.queue && !s.queue.length)) { toast("Inga frågor matchar urvalet."); return; }
    session = s;
    session.next();
    go("#/quiz");
  }

  // ---------- Quiz ----------
  function renderQuiz() {
    const s = session;
    mount(`
      <div class="quiz">
        <div class="quiz-top">
          <button class="btn small ghost" id="quitBtn" type="button" title="Avsluta omgången">✕ Avsluta</button>
          <div class="progress ${s.total ? "" : "endless"}"><div id="progFill"></div></div>
          <div class="tally" id="tally"></div>
          <div class="quiz-count" id="qcount"></div>
        </div>
        <div id="cardSlot"></div>
        <div class="quiz-foot">
          <span class="prev-note" id="prevNote"></span>
          <span class="kbd-hints"><kbd>Mellanslag</kbd> visa svar · <kbd>1</kbd> för lätt · <kbd>2</kbd> kunde · <kbd>3</kbd> kunde inte</span>
        </div>
      </div>`);

    let revealed = false;
    let busy = false;

    function updateTop() {
      const sc = s.score();
      const n = s.asked.length;
      $("#qcount").textContent = s.total ? `${n} / ${s.total}` : `Fråga ${n}`;
      $("#progFill").style.width = s.total ? `${(100 * (n - 1)) / s.total}%` : "100%";
      $("#tally").innerHTML = `<span class="g" title="Kunde">✓ ${sc.right}</span><span class="b" title="Kunde inte">✕ ${sc.wrong}</span>`;
      const note = $("#prevNote");
      note.innerHTML = PQ.store.canUndo() && s.results.length ? `<button class="btn small ghost" id="undoBtn" type="button">↶ Ångra senaste bedömningen</button>` : "";
    }

    function showCard(q, opts) {
      opts = opts || {};
      revealed = !!opts.revealed;
      const c = cat(q.category);
      let dated = "";
      if (q.type === "aktuell") {
        dated = PQ.bank.isFresh(q)
          ? `<div class="dated">📅 Händelse ${fmtDate(q.eventDate)} · kontrollerad ${fmtDate(q.verified)}</div>`
          : `<div class="dated">🗓️ Nyhet från ${fmtMonth(q.eventDate)}</div>`;
      }
      const sources = q.sources.map((src) => `<li>${src.url ? `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.label)}</a>` : esc(src.label)}</li>`).join("");
      $("#cardSlot").innerHTML = `
        <article class="card enter ${revealed ? "revealed" : ""}" id="card">
          <div class="card-meta">
            <span class="chip cat" ${hue(q.category)}>${c.icon} ${esc(c.name)}</span>
            <span class="qnum">Fråga ${s.asked.length}</span>
            <span class="spacer"></span>
            ${diffBadge(q.difficulty)}
          </div>
          <h1 class="question">${esc(q.question)}</h1>
          ${dated}
          <div class="answer-box"><div>
            <div class="answer-inner">
              <div class="answer-label">Svar</div>
              <div class="answer">${esc(q.answer)}</div>
              ${q.image ? `<figure class="q-img" id="qImg" data-src="${esc(q.image.src)}"><img alt=""><figcaption><a href="${esc(q.image.page)}" target="_blank" rel="noopener noreferrer">Bild: ${esc(q.image.credit || "Wikimedia Commons")}</a></figcaption></figure>` : ""}
              ${q.accept.length ? `<div class="accept">Godkänns även: ${q.accept.map(esc).join(", ")}</div>` : ""}
              ${q.explanation ? `<p class="explanation">${esc(q.explanation)}</p>` : ""}
              ${q.more ? `<p class="more"><b>Mer om svaret</b>${esc(q.more)}</p>` : ""}
              ${q.spotify ? `<a class="spotify-link" href="${esc(PQ.bank.spotifyUrl(q.spotify))}" target="_blank" rel="noopener noreferrer"><span class="spotify-play" aria-hidden="true">▶</span><span><b>Lyssna på Spotify</b><small>${esc(q.spotify)}</small></span></a>` : ""}
              <details class="sources"><summary>Källor · kontrollerad ${fmtDate(q.verified)}</summary><ul>${sources}</ul></details>
            </div>
          </div></div>
          <div class="reveal-zone" id="actionZone"></div>
        </article>`;
      drawActions();
      if (revealed) showImage();
      updateTop();
    }

    function drawActions() {
      const zone = $("#actionZone");
      if (!revealed) {
        zone.innerHTML = `<button class="btn primary reveal" id="revealBtn" type="button">VISA SVAR</button>`;
        $("#revealBtn").focus({ preventScroll: true });
      } else {
        zone.innerHTML = `<div class="grade three">
          <button class="btn easy" id="easyBtn" type="button" title="Räknas som rätt, och frågan kommer inte tillbaka">⤫ FÖR LÄTT<small>ta bort frågan</small></button>
          <button class="btn good" id="goodBtn" type="button">✓ KUNDE SVARET</button>
          <button class="btn bad" id="badBtn" type="button">✕ KUNDE INTE SVARET</button></div>`;
      }
    }

    function reveal() {
      if (revealed || busy) return;
      revealed = true;
      $("#card").classList.add("revealed");
      drawActions();
      showImage();
    }

    // Bilden laddas först när svaret visas (på Claude-sidan ur ett bildpaket).
    function showImage() {
      const fig = $("#qImg");
      if (!fig) return;
      const img = fig.querySelector("img");
      img.onerror = () => fig.remove();
      PQ.bank.imageUrl(fig.dataset.src).then((u) => { img.src = u; }, () => fig.remove());
    }

    function grade(ok, tooEasy) {
      if (!revealed || busy) return;
      busy = true;
      const card = $("#card");
      card.classList.remove("enter");
      card.classList.add(tooEasy ? "leave-easy" : ok ? "leave-good" : "leave-bad");
      s.answer(ok, tooEasy);
      if (tooEasy) toast("Frågan är borttagen. Ångra med Z eller återställ den i Frågebanken.");
      setTimeout(() => {
        busy = false;
        const q = s.next();
        if (!q) finish();
        else showCard(q);
      }, 280);
    }

    function undo() {
      if (busy) return;
      const q = s.undo();
      if (q) { showCard(q, { revealed: true }); toast("Bedömningen ångrades – välj igen."); }
    }

    onViewClick((e) => {
      if (e.target.closest("#revealBtn")) reveal();
      else if (e.target.closest("#easyBtn")) grade(true, true);
      else if (e.target.closest("#goodBtn")) grade(true);
      else if (e.target.closest("#badBtn")) grade(false);
      else if (e.target.closest("#undoBtn")) undo();
      else if (e.target.closest("#quitBtn")) finish();
    });

    keyHandler = (e) => {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (!revealed && (k === " " || k === "enter")) { e.preventDefault(); reveal(); }
      else if (revealed && (k === "1" || k === "l")) { e.preventDefault(); grade(true, true); }
      else if (revealed && (k === "2" || k === "j")) { e.preventDefault(); grade(true); }
      else if (revealed && (k === "3" || k === "n")) { e.preventDefault(); grade(false); }
      else if (k === "z" && s.results.length) { e.preventDefault(); undo(); }
    };
    document.addEventListener("keydown", keyHandler);

    if (s.current) showCard(s.current);
    else finish();
  }

  function finish() {
    const s = session;
    if (!s) return;
    const sc = s.score();
    lastSummary = {
      mode: s.mode, config: s.config, started: s.started, ended: Date.now(),
      answered: sc.answered, right: sc.right, wrong: sc.wrong, results: s.results.slice(),
    };
    if (sc.answered) PQ.store.addSession({ mode: s.mode, started: s.started, ended: lastSummary.ended, answered: sc.answered, right: sc.right });
    session = null;
    go(sc.answered ? "#/resultat" : "#/");
  }

  // ---------- Resultat ----------
  function renderResult() {
    const r = lastSummary;
    const p = pct(r.right, r.answered);
    const missedIds = [...new Set(r.results.filter((x) => !x.ok).map((x) => x.id))];
    const perCat = {};
    r.results.forEach((x) => {
      const q = PQ.bank.get(x.id); if (!q) return;
      const o = perCat[q.category] || (perCat[q.category] = { n: 0, right: 0 });
      o.n++; o.right += x.ok ? 1 : 0;
    });
    const verdict = p >= 85 ? "Vinnarlag! 🏆" : p >= 65 ? "Starkt jobbat!" : p >= 45 ? "Godkänt – fortsätt nöta." : "Bra träning – nu vet du vad du ska repetera.";
    const C = 2 * Math.PI * 62;

    mount(`
      <div class="panel">
        <div class="result-hero">
          <svg class="ring" viewBox="0 0 150 150" role="img" aria-label="${p} procent rätt">
            <circle class="track" cx="75" cy="75" r="62" fill="none" stroke-width="12"/>
            <circle class="val" cx="75" cy="75" r="62" fill="none" stroke-width="12" stroke-linecap="round"
              stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 75 75)" id="ringVal"/>
            <text x="75" y="84" text-anchor="middle">${p}%</text>
          </svg>
          <div>
            <span class="pill">${RESULT_MODES[r.mode] ? RESULT_MODES[r.mode].icon + " " + RESULT_MODES[r.mode].name + (r.mode === "dagsquiz" ? " · " + dayTitle(r.config.date) : "") : ""}</span>
            <h1 style="margin-top:10px">${verdict}</h1>
            <p class="muted" style="margin:6px 0 16px">Du kunde <b style="color:var(--ink)">${r.right}</b> av ${r.answered} frågor på ${Math.max(1, Math.round((r.ended - r.started) / 60000))} min.</p>
            <div class="row">
              ${missedIds.length ? `<button class="btn accent" id="redoMissed" type="button">🔁 Repetera de ${missedIds.length} missade</button>` : ""}
              <button class="btn" id="again" type="button">Spela igen</button>
              ${r.mode === "dagsquiz" ? `<a class="btn ghost" href="#/lage/aktuellt">Alla dagens quiz</a>` : ""}
              <a class="btn ghost" href="#/statistik">Se statistik</a>
            </div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Per kategori</h2>
      <div class="panel"><div class="bars">${Object.entries(perCat).sort((a, b) => b[1].n - a[1].n).map(([id, o]) => `
        <div class="bar-row"><div class="lbl"><span>${cat(id).icon}</span><span>${esc(cat(id).name)}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct(o.right, o.n)}%"></div></div>
        <div class="num">${o.right}/${o.n}</div></div>`).join("")}</div></div>

      ${missedIds.length ? `<h2 class="section-title">Det här kunde du inte <span class="muted">${missedIds.length} frågor</span></h2>
        <ul class="qlist">${missedIds.map((id) => PQ.bank.get(id)).filter(Boolean).map(questionItem).join("")}</ul>` : ""}
    `);
    requestAnimationFrame(() => setTimeout(() => { const el = $("#ringVal"); if (el) el.style.strokeDashoffset = C * (1 - p / 100); }, 60));

    onViewClick((e) => {
      if (e.target.closest("#redoMissed")) startSession({ mode: "repetera", ids: missedIds, length: 0 });
      else if (e.target.closest("#again")) startSession(Object.assign({}, r.config));
    });
  }

  function questionItem(q) {
    const r = PQ.store.rec(q.id);
    return `<li><div class="q">${esc(q.question)}</div><div class="a">→ <b>${esc(q.answer)}</b>${q.explanation ? ` <span class="muted">– ${esc(q.explanation)}</span>` : ""}</div>
      <div class="m"><span class="chip cat" ${hue(q.category)}>${cat(q.category).icon} ${esc(cat(q.category).name)}</span>${diffBadge(q.difficulty)}${r ? `<span>missad ${r.wrong} av ${r.seen} gånger</span>` : ""}</div></li>`;
  }

  // ---------- Statistik ----------
  function renderStats() {
    const log = PQ.store.log();
    const recs = PQ.store.records();
    const t = totals();
    const seen = Object.keys(recs).length;
    const mastered = Object.values(recs).filter((r) => r.lastResult === "right" && r.streak >= 2).length;
    const missed = PQ.engine.missedQuestions("last");

    const perCat = PQ.engine.categoryPerformance();
    const perDiff = { "lätt": { n: 0, right: 0 }, "medel": { n: 0, right: 0 }, "svår": { n: 0, right: 0 } };
    log.forEach((e) => { if (perDiff[e.d]) { perDiff[e.d].n++; perDiff[e.d].right += e.ok; } });
    const rated = PQ.CATEGORIES.filter((c) => perCat[c.id].n >= 5).map((c) => ({ c, rate: perCat[c.id].right / perCat[c.id].n }));
    rated.sort((a, b) => b.rate - a.rate);

    if (!log.length) {
      mount(`<div class="page-head"><h1>Statistik</h1><p>Här ser du hur du utvecklas över tid.</p></div>
        <div class="panel empty"><div class="big">📊</div><p>Inga besvarade frågor än. Spela en omgång så dyker statistiken upp här.</p>
        <a class="btn accent" href="#/lage/pubquiz">Starta ett pubquiz</a></div>${dataPanel()}`);
      bindDataPanel();
      return;
    }

    const catRows = PQ.CATEGORIES.map((c) => ({ c, ...perCat[c.id] })).sort((a, b) => (b.n ? b.right / b.n : -1) - (a.n ? a.right / a.n : -1));

    mount(`
      <div class="page-head"><h1>Statistik</h1><p>Allt bygger på din egen bedömning: KUNDE SVARET eller KUNDE INTE SVARET.</p></div>
      <div class="stat-grid">
        <div class="kpi"><div class="v">${t.answered}</div><div class="l">besvarade totalt</div></div>
        <div class="kpi"><div class="v" style="color:var(--good)">${t.right}</div><div class="l">kunde svaret</div></div>
        <div class="kpi"><div class="v" style="color:var(--bad)">${t.wrong}</div><div class="l">kunde inte</div></div>
        <div class="kpi"><div class="v">${pct(t.right, t.answered)}%</div><div class="l">andel du kunde</div></div>
        <div class="kpi"><div class="v">${seen}</div><div class="l">unika frågor sedda</div></div>
        <div class="kpi"><div class="v">${mastered}</div><div class="l">sitter (rätt 2+ i rad)</div></div>
      </div>

      <div class="callouts" style="margin-top:12px">
        <div class="callout"><div class="t">Starkast</div><div class="v">${rated.length ? `${rated[0].c.icon} ${esc(rated[0].c.name)} · ${Math.round(rated[0].rate * 100)}%` : `<span class="muted small">Svara på minst 5 frågor i en kategori</span>`}</div></div>
        <div class="callout"><div class="t">Svagast</div><div class="v">${rated.length > 1 ? `${rated[rated.length - 1].c.icon} ${esc(rated[rated.length - 1].c.name)} · ${Math.round(rated[rated.length - 1].rate * 100)}%` : `<span class="muted small">Behöver minst två kategorier med 5+ svar</span>`}</div>
          ${rated.length > 1 ? `<a class="btn small" style="margin-top:10px" href="#/lage/svaga">Träna svaga kategorier →</a>` : ""}</div>
      </div>

      <h2 class="section-title">Utveckling över tid</h2>
      <div class="two-col">
        <div class="panel"><div style="font-weight:650">Besvarade frågor per dag</div><div class="muted small">Senaste 30 dagarna</div><div class="chart-wrap" id="chartDaily"></div></div>
        <div class="panel"><div style="font-weight:650">Andel du kunde per vecka</div><div class="muted small">Senaste 12 veckorna (veckor utan svar hoppas över)</div><div class="chart-wrap" id="chartWeekly"></div></div>
      </div>

      <h2 class="section-title">Resultat per kategori <span class="muted">andel rätt</span></h2>
      <div class="panel"><div class="bars">${catRows.map((r) => `
        <div class="bar-row ${r.n ? "" : "nodata"}">
          <div class="lbl"><span>${r.c.icon}</span><span>${esc(r.c.name)}</span></div>
          <div class="bar-track" title="${r.n ? `${r.right} av ${r.n} rätt` : "Inga svar än"}"><div class="bar-fill" style="width:${pct(r.right, r.n)}%"></div></div>
          <div class="num">${r.n ? `${pct(r.right, r.n)}% <small>(${r.n})</small>` : `<small>–</small>`}</div>
        </div>`).join("")}</div></div>

      <h2 class="section-title">Resultat per svårighetsgrad</h2>
      <div class="panel"><div class="bars">${Object.entries(perDiff).map(([d, o]) => `
        <div class="bar-row ${o.n ? "" : "nodata"}"><div class="lbl">${diffBadge(d)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct(o.right, o.n)}%"></div></div>
        <div class="num">${o.n ? `${pct(o.right, o.n)}% <small>(${o.n})</small>` : "<small>–</small>"}</div></div>`).join("")}</div></div>

      <h2 class="section-title">Frågor du missat <span class="muted">senast markerade KUNDE INTE SVARET · ${missed.length} st</span></h2>
      ${missed.length ? `<div class="row" style="margin-bottom:12px"><a class="btn accent" href="#/lage/repetera">🔁 Träna på dessa</a></div>
        <ul class="qlist">${missed.sort((a, b) => recs[b.id].wrong - recs[a.id].wrong).slice(0, 60).map((q) => `
          <li><details><summary><div class="q">${esc(q.question)}</div><div class="m"><span class="chip cat" ${hue(q.category)}>${cat(q.category).icon} ${esc(cat(q.category).name)}</span><span>missad ${recs[q.id].wrong} av ${recs[q.id].seen}</span><span>· klicka för svar</span></div></summary>
          <div class="a" style="margin-top:8px">→ <b>${esc(q.answer)}</b> ${q.explanation ? `<span class="muted">– ${esc(q.explanation)}</span>` : ""}</div>
          ${q.more ? `<div class="muted small" style="margin-top:6px">${esc(q.more)}</div>` : ""}</details></li>`).join("")}</ul>`
        : `<div class="panel muted">Inga missade frågor just nu. Snyggt!</div>`}

      ${dataPanel()}
    `);

    drawDailyChart($("#chartDaily"), log);
    drawWeeklyChart($("#chartWeekly"), log);
    bindDataPanel();
  }

  function syncNote() {
    const h = PQ.host || {};
    const time = h.lastSync ? new Date(h.lastSync).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) : "";
    const text = {
      connecting: "Ansluter till ditt Claude-konto…",
      synced: `✓ Synkad med ditt Claude-konto${time ? " kl. " + time : ""}. Samma statistik visas på telefon och dator.`,
      offline: "Kunde inte nå synken just nu. Allt sparas på den här enheten och synkas nästa gång du öppnar sidan.",
      error: "Synkutrymmet är fullt. Statistiken sparas bara på den här enheten.",
      local: "Synk kräver att du är inloggad i Claude. Statistiken sparas på den här enheten.",
    }[h.status] || "";
    return `<p id="syncStatus" class="note ${h.status === "synced" ? "" : "warn"}" style="margin:0 0 12px">${esc(text)}</p>`;
  }

  function dataPanel() {
    const inClaude = PQ.host && PQ.host.inClaude;
    return `<h2 class="section-title">Dina data</h2>
      <div class="panel">
        ${inClaude ? syncNote() : ""}
        <p style="margin:0 0 12px" class="muted">${inClaude
          ? "Statistik, egna frågor och granskningskö sparas på ditt Claude-konto och bara du kan se dem. En backup-fil kan du läsa in i den lokala versionen av appen."
          : "Statistik, egna frågor och granskningskö sparas i den här webbläsaren och finns kvar när du stänger sidan. Ta en backup om du vill flytta till en annan dator eller webbläsare."}</p>
        <div class="row">
          <button class="btn" id="exportBtn" type="button">⬇ Exportera backup</button>
          <label class="btn" style="cursor:pointer">⬆ Importera backup<input type="file" id="importFile" accept=".json,application/json" hidden></label>
          <span class="spacer"></span>
          <button class="btn danger ghost" id="resetBtn" type="button">Nollställ statistik</button>
        </div>
        ${PQ.store.available ? "" : `<p class="note warn" style="margin-top:12px">Webbläsaren blockerar lokal lagring – statistiken sparas inte mellan sessioner.</p>`}
      </div>`;
  }

  function bindDataPanel() {
    onViewClick(async (e) => {
      if (e.target.closest("#exportBtn")) {
        download(`pubquiz-backup-${PQ.bank.today()}.json`, JSON.stringify(PQ.store.exportAll(), null, 1));
      } else if (e.target.closest("#resetBtn")) {
        if (await askConfirm("Nollställa all statistik och svarshistorik? Egna frågor behålls.", "Nollställ")) { PQ.store.resetProgress(); toast("Statistiken är nollställd."); renderStats(); }
      }
    });
    const f = $("#importFile");
    if (f) f.addEventListener("change", async () => {
      const file = f.files[0]; if (!file) return;
      try {
        PQ.store.importAll(JSON.parse(await file.text()));
        PQ.store.custom().forEach((raw) => { if (!PQ.bank.has(raw.id)) PQ.bank.addCustom(raw); });
        toast("Backupen är importerad."); renderStats();
      } catch (err) { toast(err.message || "Kunde inte läsa filen."); }
    });
  }

  // ---------- Diagram (SVG) ----------
  function dayKey(ts) { return PQ.bank.isoDate(new Date(ts)); }

  function bindTooltips(wrap) {
    let tip = null;
    const show = (el) => {
      if (!tip) { tip = document.createElement("div"); tip.className = "tooltip"; wrap.appendChild(tip); }
      tip.innerHTML = el.getAttribute("data-tip");
      const wr = wrap.getBoundingClientRect(), r = el.getBoundingClientRect();
      tip.style.left = Math.min(Math.max(r.left + r.width / 2 - wr.left, 60), wr.width - 60) + "px";
      tip.style.top = (r.top - wr.top + (el.dataset.top ? Number(el.dataset.top) * r.height : 0)) + "px";
      tip.style.display = "block";
      $$(".hover-col", wrap).forEach((h) => h.setAttribute("opacity", "0"));
      const col = el.previousElementSibling;
      if (col && col.classList.contains("hover-col")) col.setAttribute("opacity", "1");
    };
    const hide = () => { if (tip) tip.style.display = "none"; $$(".hover-col", wrap).forEach((h) => h.setAttribute("opacity", "0")); };
    wrap.addEventListener("mouseover", (e) => { const el = e.target.closest("[data-tip]"); if (el) show(el); });
    wrap.addEventListener("mouseleave", hide);
    wrap.addEventListener("click", (e) => { const el = e.target.closest("[data-tip]"); el ? show(el) : hide(); });
  }

  function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / p) * p; }

  function drawDailyChart(wrap, log) {
    const days = [];
    const today = new Date(); today.setHours(12, 0, 0, 0);
    for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push({ key: PQ.bank.isoDate(d), n: 0, right: 0 }); }
    const idx = Object.fromEntries(days.map((d, i) => [d.key, i]));
    log.forEach((e) => { const i = idx[dayKey(e.t)]; if (i !== undefined) { days[i].n++; days[i].right += e.ok; } });
    const W = 560, H = 190, L = 34, R = 8, T = 12, B = 26;
    const max = niceMax(Math.max(1, ...days.map((d) => d.n)));
    const step = (W - L - R) / days.length, bw = Math.max(4, step - 4);
    const y = (v) => T + (H - T - B) * (1 - v / max);
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Antal besvarade frågor per dag de senaste 30 dagarna">`;
    [0, max / 2, max].forEach((v) => { svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`; });
    days.forEach((d, i) => {
      const x = L + i * step + (step - bw) / 2;
      if (d.n) {
        const top = y(d.n), base = y(0), r = Math.min(4, bw / 2, base - top);
        svg += `<path class="mark" d="M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${base} Z"/>`;
      }
      if (i % 5 === 4 || i === 0) { const dd = new Date(d.key + "T12:00:00"); svg += `<text class="axis" x="${x + bw / 2}" y="${H - 8}" text-anchor="middle">${dd.getDate()}/${dd.getMonth() + 1}</text>`; }
      svg += `<rect class="hover-col" opacity="0" x="${L + i * step}" y="${T}" width="${step}" height="${H - T - B}"/>`;
      svg += `<rect class="hit" x="${L + i * step}" y="${T}" width="${step}" height="${H - T - B}" data-tip="<b>${fmtDate(d.key)}</b><br>${d.n} besvarade${d.n ? ` · ${pct(d.right, d.n)}% kunde` : ""}"/>`;
    });
    wrap.innerHTML = svg + "</svg>";
    bindTooltips(wrap);
  }

  function drawWeeklyChart(wrap, log) {
    const monday = (ts) => { const d = new Date(ts); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return PQ.bank.isoDate(d); };
    const weeks = [];
    const start = new Date(); start.setHours(12, 0, 0, 0);
    for (let i = 11; i >= 0; i--) { const d = new Date(start); d.setDate(d.getDate() - 7 * i); weeks.push({ key: monday(d.getTime()), n: 0, right: 0 }); }
    const idx = Object.fromEntries(weeks.map((w, i) => [w.key, i]));
    log.forEach((e) => { const i = idx[monday(e.t)]; if (i !== undefined) { weeks[i].n++; weeks[i].right += e.ok; } });
    const W = 560, H = 190, L = 40, R = 14, T = 14, B = 26;
    const step = (W - L - R) / (weeks.length - 1);
    const x = (i) => L + i * step, y = (v) => T + (H - T - B) * (1 - v / 100);
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Andel rätt per vecka de senaste 12 veckorna">`;
    [0, 50, 100].forEach((v) => { svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`; });
    const pts = weeks.map((w, i) => (w.n ? { i, v: (100 * w.right) / w.n, w } : null)).filter(Boolean);
    if (pts.length > 1) svg += `<path class="line" d="${pts.map((p, k) => (k ? "L" : "M") + x(p.i) + "," + y(p.v)).join(" ")}"/>`;
    weeks.forEach((w, i) => {
      if (i % 3 === 0 || i === weeks.length - 1) { const d = new Date(w.key + "T12:00:00"); svg += `<text class="axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">v. ${isoWeek(d)}</text>`; }
    });
    pts.forEach((p) => { svg += `<circle class="dot" cx="${x(p.i)}" cy="${y(p.v)}" r="5"/>`; });
    weeks.forEach((w, i) => {
      svg += `<rect class="hover-col" opacity="0" x="${x(i) - step / 2}" y="${T}" width="${step}" height="${H - T - B}"/>`;
      svg += `<rect class="hit" x="${x(i) - step / 2}" y="${T}" width="${step}" height="${H - T - B}" data-tip="<b>Vecka ${isoWeek(new Date(w.key + "T12:00:00"))}</b><br>${w.n ? `${pct(w.right, w.n)}% kunde (${w.n} svar)` : "Inga svar"}"/>`;
    });
    wrap.innerHTML = svg + "</svg>" + (pts.length < 2 ? `<p class="muted small" style="margin:6px 0 0">Kurvan dyker upp när du spelat under minst två olika veckor.</p>` : "");
    bindTooltips(wrap);
  }

  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y0) / 864e5 + 1) / 7);
  }

  // ---------- Frågebank ----------
  function renderBank() {
    const all = PQ.bank.all();
    const active = PQ.bank.active();
    const t = PQ.bank.today();
    const news = all.filter((q) => q.type === "aktuell");
    const freshN = news.filter((q) => PQ.bank.isFresh(q, t)).length;
    const expiredN = all.filter((q) => PQ.bank.isExpired(q, t)).length;
    const pending = PQ.store.pending();
    const custom = PQ.store.custom();
    const hiddenQs = PQ.store.hiddenIds().map((id) => PQ.bank.get(id)).filter(Boolean);
    const inClaude = !!(PQ.host && PQ.host.inClaude);
    const hasKey = !inClaude && !!PQ.research.getKey();
    const rcfg = PQ.research.config();
    const rs = PQ.store.setting("researchForm", { category: "musik", kind: "tidlös", count: 10, difficulty: "alla", days: 14 });

    const table = PQ.CATEGORIES.map((c) => {
      const qs = active.filter((q) => q.category === c.id);
      const by = (d) => qs.filter((q) => q.difficulty === d).length;
      return `<tr><td>${c.icon} ${esc(c.name)}</td><td>${by("lätt")}</td><td>${by("medel")}</td><td>${by("svår")}</td><td><b>${qs.length}</b></td></tr>`;
    }).join("");
    const catOptions = (sel) => PQ.CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === sel ? "selected" : ""}>${esc(c.name)}</option>`).join("");

    mount(`
      <div class="page-head"><h1>Frågebank</h1><p>Se vad som finns, hämta nya frågor via research på webben, granska dem innan de läggs till och lägg till egna frågor.</p></div>

      <div class="stat-grid">
        <div class="kpi"><div class="v">${active.length}</div><div class="l">aktiva frågor</div></div>
        <div class="kpi"><div class="v">${all.length - news.length}</div><div class="l">tidlösa</div></div>
        <div class="kpi"><div class="v">${freshN}</div><div class="l">aktuella (≤ ${PQ.FRESH_DAYS} dagar)</div></div>
        <div class="kpi"><div class="v">${custom.length}</div><div class="l">egna/researchade</div></div>
        <div class="kpi"><div class="v">${pending.length}</div><div class="l">väntar på granskning</div></div>
        <div class="kpi"><div class="v">${hiddenQs.length}</div><div class="l">borttagna som för lätta</div></div>
      </div>
      ${expiredN ? `<p class="muted small">${expiredN} aktuella frågor har passerat sitt giltighetsdatum och visas inte längre.</p>` : ""}

      <div class="panel" style="margin-top:16px"><div class="table-scroll"><table class="tbl">
        <thead><tr><th>Kategori</th><th>Lätt</th><th>Medel</th><th>Svår</th><th>Totalt</th></tr></thead><tbody>${table}</tbody>
      </table></div>
      ${PQ.bank.problems.length ? `<details class="disclosure"><summary>${PQ.bank.problems.length} frågor kunde inte läsas in</summary><ul class="small">${PQ.bank.problems.map((p) => `<li><code>${esc(p.id)}</code> (${esc(p.origin)}): ${esc(p.errors.join(", "))}</li>`).join("")}</ul></details>` : ""}
      </div>

      <h2 class="section-title">🔎 Hämta nya frågor med research</h2>
      <div class="panel">
        <p style="margin:0 0 6px">Claude söker på webben efter fakta och typiska svenska pubquizämnen, skriver nya frågor, faktagranskar dem med nya, oberoende sökningar och sorterar bort dubbletter. Allt hamnar sedan i granskningskön nedan, där du godkänner frågorna innan de läggs till.</p>
        ${inClaude ? `<p class="note" style="margin:8px 0 0">I Claude-appen kan sidan inte själv söka på webben. Tryck <b>Kopiera research-prompt</b>, klistra in den i en ny chatt med Claude och klistra sedan in svaret under <b>Importera frågor (JSON)</b>. Automatisk research med API-nyckel finns i den lokala versionen av appen.</p>` : `
        <p class="muted small" style="margin:0">Det kräver en API-nyckel från Anthropic (console.anthropic.com). Utan nyckel kan du köra samma research-prompt i Claude och klistra in svaret längre ner.</p>

        <details class="disclosure" ${hasKey ? "" : "open"}><summary>API-inställningar ${hasKey ? "· ✓ nyckel angiven" : "· ingen nyckel"}</summary>
          <div class="form-grid" style="margin-top:12px">
            <div><label class="small" for="apiKey">API-nyckel</label><input class="input" id="apiKey" type="password" autocomplete="off" placeholder="${hasKey ? "•••••••• (sparad)" : "sk-ant-…"}"></div>
            <div><label class="small" for="model">Modell</label><select class="input" id="model">${PQ.research.MODELS.map((m) => `<option value="${m.id}" ${m.id === rcfg.model ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div>
            <div><label class="small" for="effort">Noggrannhet</label><select class="input" id="effort">${[["low", "Snabb"], ["medium", "Normal"], ["high", "Grundlig"]].map(([v, l]) => `<option value="${v}" ${v === rcfg.effort ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          </div>
          <label class="check-row"><input type="checkbox" id="rememberKey" ${PQ.research.keyRemembered() ? "checked" : ""}> Kom ihåg nyckeln i den här webbläsaren (annars glöms den när fliken stängs)</label>
          <div class="row" style="margin-top:12px"><button class="btn" id="saveKey" type="button">Spara inställningar</button>${hasKey ? `<button class="btn ghost danger" id="forgetKey" type="button">Glöm nyckeln</button>` : ""}</div>
          <p class="muted small" style="margin:10px 0 0">Nyckeln sparas bara lokalt i webbläsaren och skickas enbart till api.anthropic.com. Den hamnar aldrig i någon fil eller backup. Servern kan byta till en annan modell om den första avböjer en förfrågan.</p>
        </details>`}

        <div class="form-grid" style="margin-top:18px">
          <div><label class="small" for="rCat">Kategori</label><select class="input" id="rCat">${catOptions(rs.category)}</select></div>
          <div><label class="small" for="rKind">Typ</label><select class="input" id="rKind"><option value="tidlös" ${rs.kind === "tidlös" ? "selected" : ""}>Tidlösa frågor</option><option value="aktuell" ${rs.kind === "aktuell" ? "selected" : ""}>Aktuella nyheter</option></select></div>
          <div id="daysWrap" class="${rs.kind === "aktuell" ? "" : "hidden"}"><label class="small" for="rDays">Tidsfönster</label><select class="input" id="rDays">${[7, 14, 30, 60].map((d) => `<option value="${d}" ${d === rs.days ? "selected" : ""}>Senaste ${d} dagarna</option>`).join("")}</select></div>
          <div><label class="small" for="rCount">Antal</label><select class="input" id="rCount">${[5, 10, 15].map((n) => `<option ${n === rs.count ? "selected" : ""}>${n}</option>`).join("")}</select></div>
          <div><label class="small" for="rDiff">Svårighet</label><select class="input" id="rDiff">${[["alla", "Realistisk mix"], ["lätt", "Lätt"], ["medel", "Medel"], ["svår", "Svår"]].map(([v, l]) => `<option value="${v}" ${v === rs.difficulty ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        </div>
        <div class="row" style="margin-top:14px">
          ${inClaude ? "" : `<button class="btn accent" id="runResearch" type="button" ${hasKey ? "" : "disabled"}>Researcha och faktagranska</button>`}
          <button class="btn ${inClaude ? "accent" : ""}" id="copyPrompt" type="button">📋 Kopiera research-prompt</button>
        </div>
        <div class="logbox hidden" id="rLog"></div>

        <details class="disclosure"><summary>Importera frågor (JSON)</summary>
          <p class="small muted">Klistra in svaret från Claude (eller en egen JSON-lista med frågor). Frågorna valideras, dubblettkontrolleras och läggs i granskningskön. Kategori som saknas i JSON:en sätts till den valda ovan.</p>
          <textarea class="input" id="importText" placeholder='{"questions":[{"question":"…","answer":"…","difficulty":"medel","sources":["https://…"]}]}'></textarea>
          <div class="row" style="margin-top:10px"><button class="btn" id="importBtn" type="button">Lägg i granskningskön</button></div>
        </details>
      </div>

      <h2 class="section-title">✅ Granskningskö <span class="muted">${pending.length} frågor</span></h2>
      ${pending.length ? `<div class="row" style="margin-bottom:12px"><button class="btn accent small" id="approveAll" type="button">Godkänn alla</button><button class="btn small ghost danger" id="rejectAll" type="button">Avvisa alla</button></div>
        <div>${pending.map((p, i) => pendingCard(p, i)).join("")}</div>`
        : `<div class="panel muted">Inga frågor väntar på granskning.</div>`}

      <h2 class="section-title">✍️ Lägg till en egen fråga</h2>
      <div class="panel">
        <div class="form-grid">
          <div><label class="small" for="nCat">Kategori</label><select class="input" id="nCat">${catOptions(rs.category)}</select></div>
          <div><label class="small" for="nDiff">Svårighet</label><select class="input" id="nDiff"><option>lätt</option><option selected>medel</option><option>svår</option></select></div>
          <div><label class="small" for="nType">Typ</label><select class="input" id="nType"><option value="tidlös">Tidlös</option><option value="aktuell">Aktuell</option></select></div>
          <div><label class="small" for="nDate">Händelsedatum (aktuella)</label><input class="input" id="nDate" type="date"></div>
        </div>
        <div style="margin-top:12px"><label class="small" for="nQ">Fråga</label><input class="input" id="nQ"></div>
        <div class="form-grid" style="margin-top:12px">
          <div><label class="small" for="nA">Svar</label><input class="input" id="nA"></div>
          <div><label class="small" for="nAlt">Godkänns även (kommaseparerat)</label><input class="input" id="nAlt"></div>
        </div>
        <div style="margin-top:12px"><label class="small" for="nE">Förklaring</label><input class="input" id="nE"></div>
        <div style="margin-top:12px"><label class="small" for="nS">Källa (URL)</label><input class="input" id="nS" placeholder="https://sv.wikipedia.org/wiki/…"></div>
        <div class="row" style="margin-top:14px"><button class="btn accent" id="addOwn" type="button">Lägg till fråga</button></div>
      </div>

      <h2 class="section-title">⤫ Borttagna som för lätta <span class="muted">${hiddenQs.length} st</span></h2>
      <div class="panel">
        <p class="muted small" style="margin:0 0 12px">Frågor du markerat som FÖR LÄTT visas inte i några spellägen. Återställ dem här om du vill få dem igen.</p>
        ${hiddenQs.length ? `<div class="row" style="margin-bottom:10px"><button class="btn small" id="unhideAll" type="button">Återställ alla</button></div>
          <details class="disclosure"><summary>Visa frågorna</summary><ul class="qlist" style="margin-top:10px">${hiddenQs.map((q) => `
          <li><div class="q">${esc(q.question)}</div><div class="a">→ <b>${esc(q.answer)}</b></div>
          <div class="m"><span class="chip cat" ${hue(q.category)}>${cat(q.category).icon} ${esc(cat(q.category).name)}</span>${diffBadge(q.difficulty)}
          <button class="btn small ghost" data-unhide="${esc(q.id)}" type="button">Återställ</button></div></li>`).join("")}</ul></details>`
          : `<p class="muted" style="margin:0">Inga borttagna frågor.</p>`}
      </div>

      <h2 class="section-title">📁 Egna och godkända frågor <span class="muted">${custom.length} st</span></h2>
      <div class="panel">
        <p class="muted small" style="margin:0 0 12px">${inClaude ? "Sparas på ditt Claude-konto. Exportera som datafil (spara som .txt och döp om till egna-fragor.js)" : "Sparas i webbläsaren. Exportera som datafil"} och lägg den i <code>data/egna-fragor.js</code> för att göra dem permanenta i projektet (ersätt filens innehåll).</p>
        <div class="row"><button class="btn" id="exportOwn" type="button" ${custom.length ? "" : "disabled"}>⬇ Exportera som egna-fragor.js</button></div>
        ${custom.length ? `<details class="disclosure"><summary>Visa frågorna</summary><ul class="qlist" style="margin-top:10px">${custom.slice().reverse().map((raw) => `
          <li><div class="q">${esc(raw.question)}</div><div class="a">→ <b>${esc(raw.answer)}</b></div>
          <div class="m"><span class="chip cat" ${hue(raw.category)}>${cat(raw.category).icon} ${esc(cat(raw.category).name)}</span>${raw.type === "aktuell" ? `<span>📅 ${esc(raw.eventDate)}</span>` : ""}
          <button class="btn small ghost danger" data-del="${esc(raw.id)}" type="button">Ta bort</button></div></li>`).join("")}</ul></details>` : ""}
      </div>
    `);

    const log = (msg) => { const el = $("#rLog"); el.classList.remove("hidden"); el.textContent += msg + "\n"; el.scrollTop = el.scrollHeight; };
    const formValues = () => ({
      category: $("#rCat").value, kind: $("#rKind").value, count: Number($("#rCount").value),
      difficulty: $("#rDiff").value, days: Number($("#rDays").value),
    });
    const saveForm = () => PQ.store.setSetting("researchForm", formValues());
    ["#rCat", "#rKind", "#rCount", "#rDiff", "#rDays"].forEach((sel) => $(sel).addEventListener("change", () => {
      saveForm(); $("#daysWrap").classList.toggle("hidden", $("#rKind").value !== "aktuell");
    }));

    onViewClick(async (e) => {
      const el = e.target.closest("button");
      if (!el) return;
      switch (el.id) {
        case "saveKey": {
          const k = $("#apiKey").value.trim();
          const remember = $("#rememberKey").checked;
          if (k) PQ.research.setKey(k, remember);
          else if (PQ.research.getKey()) PQ.research.setKey(PQ.research.getKey(), remember);
          PQ.store.setSetting("model", $("#model").value);
          PQ.store.setSetting("effort", $("#effort").value);
          toast("Inställningarna är sparade."); renderBank(); return;
        }
        case "forgetKey": PQ.research.setKey("", false); toast("Nyckeln är borttagen."); renderBank(); return;
        case "copyPrompt": {
          const ok = await copyText(PQ.research.manualPrompt(formValues()));
          toast(ok ? "Prompten är kopierad – klistra in den i Claude med webbsökning påslagen." : "Kunde inte kopiera.");
          return;
        }
        case "runResearch": {
          el.disabled = true; el.textContent = "Arbetar… (kan ta några minuter)";
          $("#rLog").textContent = "";
          try {
            const res = await PQ.research.run(formValues(), log);
            log(`\nKlart! ${res.added} nya frågor väntar på granskning.`);
            res.rejected.forEach((r) => log(`  ✕ Underkänd: ${r.raw.question} – ${r.note}`));
            res.duplicates.forEach((d) => log(`  ≈ Dubblett: ${d.raw.question}  (liknar: ${d.of.question})`));
            res.invalid.forEach((d) => log(`  ! Ogiltig: ${d.raw.question || "(tom)"} – ${d.errors.join(", ")}`));
            log(`Tokenåtgång: ${res.usage.input_tokens} in / ${res.usage.output_tokens} ut.`);
            setTimeout(() => { const keep = $("#rLog").textContent; renderBank(); const lb = $("#rLog"); lb.textContent = keep; lb.classList.remove("hidden"); }, 400);
          } catch (err) {
            log("Fel: " + err.message);
            el.disabled = false; el.textContent = "Researcha och faktagranska";
          }
          return;
        }
        case "importBtn": {
          try {
            const res = PQ.research.importText($("#importText").value, $("#rCat").value);
            toast(`${res.ok.length} frågor i kön · ${res.duplicates.length} dubbletter · ${res.invalid.length} ogiltiga`);
            renderBank();
          } catch (err) { toast(err.message); }
          return;
        }
        case "approveAll": approvePending(PQ.store.pending().map((_, i) => i)); return;
        case "rejectAll": if (await askConfirm("Avvisa alla frågor i kön?", "Avvisa alla")) { PQ.store.savePending([]); renderBank(); } return;
        case "unhideAll": PQ.store.unhide(PQ.store.hiddenIds()); toast("Alla borttagna frågor är återställda."); renderBank(); return;
        case "addOwn": addOwnQuestion(); return;
        case "exportOwn": exportOwn(); return;
      }
      if (el.dataset.unhide) { PQ.store.unhide(el.dataset.unhide); toast("Frågan är återställd."); renderBank(); }
      else if (el.dataset.approve !== undefined) approvePending([Number(el.dataset.approve)]);
      else if (el.dataset.reject !== undefined) { const list = PQ.store.pending().slice(); list.splice(Number(el.dataset.reject), 1); PQ.store.savePending(list); renderBank(); }
      else if (el.dataset.del) {
        if (!(await askConfirm("Ta bort frågan?", "Ta bort"))) return;
        PQ.store.saveCustom(PQ.store.custom().filter((r) => r.id !== el.dataset.del));
        PQ.bank.removeById(el.dataset.del); renderBank();
      }
    });
  }

  function pendingCard(p, i) {
    const raw = p.raw;
    const note = raw._note;
    const srcs = (raw.sources || []).map((s) => PQ.bank.expandSource(s)).filter(Boolean);
    return `<div class="pending-card">
      <div class="row small" style="margin-bottom:8px"><span class="chip cat" ${hue(raw.category)}>${cat(raw.category).icon} ${esc(cat(raw.category).name)}</span>
        ${PQ.bank.DIFFS.includes(raw.difficulty) ? diffBadge(raw.difficulty) : ""}
        ${raw.type === "aktuell" ? `<span class="pill">📅 ${esc(raw.eventDate)}${raw.validUntil ? " · giltig t.o.m. " + esc(raw.validUntil) : ""}</span>` : `<span class="pill">tidlös</span>`}
        <span class="pill">${p.meta.source === "research" ? "research" : "import"}</span>
        ${note ? `<span class="pill" title="${esc(note.note)}">${note.verdict === "fix" ? "✎ rättad vid granskning" : "✓ faktagranskad"}</span>` : ""}
      </div>
      <div class="q">${esc(raw.question)}</div>
      <div class="a">→ <b>${esc(raw.answer)}</b>${raw.accept && raw.accept.length ? ` <span class="muted small">(även: ${raw.accept.map(esc).join(", ")})</span>` : ""}</div>
      ${raw.explanation ? `<div class="e">${esc(raw.explanation)}</div>` : ""}
      ${raw.more ? `<div class="e"><b>Mer om svaret:</b> ${esc(raw.more)}</div>` : ""}
      ${note && note.note ? `<div class="e"><i>Granskning: ${esc(note.note)}</i></div>` : ""}
      <div class="s">${srcs.map((s) => s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>` : esc(s.label)).join(" · ")}</div>
      <div class="row actions"><button class="btn small good" data-approve="${i}" type="button">✓ Godkänn</button><button class="btn small bad" data-reject="${i}" type="button">✕ Avvisa</button></div>
    </div>`;
  }

  function approvePending(indexes) {
    const list = PQ.store.pending().slice();
    const custom = PQ.store.custom().slice();
    const keep = [];
    let added = 0;
    const errors = [];
    list.forEach((p, i) => {
      if (!indexes.includes(i)) { keep.push(p); return; }
      const raw = Object.assign({}, p.raw);
      delete raw._note;
      const q = PQ.bank.addCustom(raw);
      if (q) { custom.push(raw); added++; }
      else { const prob = PQ.bank.problems[PQ.bank.problems.length - 1]; errors.push(prob ? prob.errors.join(", ") : "okänt fel"); keep.push(p); }
    });
    PQ.store.saveCustom(custom);
    PQ.store.savePending(keep);
    toast(errors.length ? `${added} tillagda · ${errors.length} kunde inte läggas till (${errors[0]})` : `${added} frågor tillagda i banken.`);
    renderBank();
  }

  async function addOwnQuestion() {
    const type = $("#nType").value;
    const raw = {
      id: "egen-" + Date.now().toString(36),
      category: $("#nCat").value,
      question: $("#nQ").value.trim(),
      answer: $("#nA").value.trim(),
      explanation: $("#nE").value.trim(),
      difficulty: $("#nDiff").value,
      sources: [$("#nS").value.trim()].filter(Boolean),
      verified: PQ.bank.today(),
      type,
    };
    const alt = $("#nAlt").value.split(",").map((s) => s.trim()).filter(Boolean);
    if (alt.length) raw.accept = alt;
    if (type === "aktuell") raw.eventDate = $("#nDate").value;
    const { question, errors } = PQ.bank.validateRaw(raw);
    if (errors.length) { toast("Kontrollera: " + errors.join(", ")); return; }
    const dup = PQ.bank.findDuplicate(question);
    if (dup && !(await askConfirm(`Den här liknar en befintlig fråga:\n\n"${dup.question.question}"\n\nLägga till ändå?`, "Lägg till ändå"))) return;
    PQ.bank.addCustom(raw);
    PQ.store.saveCustom(PQ.store.custom().concat(raw));
    toast("Frågan är tillagd.");
    renderBank();
  }

  function exportOwn() {
    const list = PQ.store.custom();
    const text = "/*\n * Egna och researchade frågor, exporterade från Pubquiztränaren " + PQ.bank.today() + ".\n" +
      " * Varje fråga har sin kategori angiven. Lägg filen i data/ (ersätt egna-fragor.js).\n */\n" +
      "PQ.bank.addSet({\n  origin: \"egen-fil\",\n  questions: " + JSON.stringify(list, null, 2).replace(/\n/g, "\n  ") + ",\n});\n";
    // I claude.ai tillåts inte .js-filer; spara som .txt och döp om filen till egna-fragor.js.
    if (PQ.host && PQ.host.inClaude) download("egna-fragor.txt", text);
    else download("egna-fragor.js", text, "text/javascript");
  }

  // ---------- Tema ----------
  function applyTheme(theme) {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }
  $("#themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    PQ.store.setSetting("theme", next);
  });

  // Hjälpmedel för fristående vyer som js/flaggor.js (flaggor och huvudstäder).
  PQ.ui = {
    mount, onViewClick, esc, toast, go,
    setKeys(fn) { keyHandler = fn; document.addEventListener("keydown", fn); },
  };

  // ---------- Start ----------
  PQ.store.custom().forEach((raw) => { if (!PQ.bank.has(raw.id)) PQ.bank.addCustom(raw); });
  const fromAddress = () => {
    const h = location.hash.startsWith("#/") ? location.hash : "#/";
    if (h !== current) { current = h; route(); }
  };
  window.addEventListener("hashchange", fromAddress);
  window.addEventListener("popstate", fromAddress);
  route();

  // Dagens quiz kan komma in från databasen efter start.
  PQ.daily.onChange = () => {
    clearTimeout(PQ.daily._t);
    PQ.daily._t = setTimeout(() => { if (current === "#/" || current.startsWith("#/lage/aktuellt")) route(); }, 150);
  };

  // Synk via Claude-kontot (js/sync.js): visa status och rita om när data från en annan enhet kommit in.
  if (PQ.host && PQ.host.inClaude) {
    PQ.host.onStatus = () => { const el = $("#syncStatus"); if (el) el.outerHTML = syncNote(); };
    PQ.host.onRemoteChange = () => { if (!current.startsWith("#/quiz")) route(); };
  }
  PQ.app = { startSession, get session() { return session; } };
})();
