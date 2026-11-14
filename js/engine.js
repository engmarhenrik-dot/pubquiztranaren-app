/*
 * Spelmotor: väljer frågor, viktar repetition och bygger omgångar för varje spelläge.
 *
 * Urvalslogik:
 *  - Osedda frågor har hög vikt.
 *  - En fråga du har fått får ett växande intervall (1, 3, 7, 21, 60, 120 dagar)
 *    beroende på hur många gånger du har fått den, och visas sällan innan dess.
 *  - Om du kunde frågan eller inte spelar ingen roll. Missade frågor övas bara i läget
 *    Repetera missade, och Svaga kategorier väljer kategori (inte fråga) efter andel rätt.
 */
(function () {
  const PQ = window.PQ;
  const INTERVALS = [1, 3, 7, 21, 60, 120];

  function weightFor(q, now) {
    const r = PQ.store.rec(q.id);
    if (!r) return 3;
    const days = (now - r.last) / 864e5;
    const seen = Math.max(r.seen || (r.right || 0) + (r.wrong || 0), 1);
    const interval = INTERVALS[Math.min(seen - 1, INTERVALS.length - 1)];
    const ratio = days / interval;
    return ratio >= 1 ? 1.2 : Math.max(0.02, ratio * ratio);
  }

  function weightedPick(items, weightFn) {
    let total = 0;
    const ws = items.map((it) => { const w = Math.max(0, weightFn(it)); total += w; return w; });
    if (!items.length) return null;
    if (total <= 0) return items[Math.floor(Math.random() * items.length)];
    let x = Math.random() * total;
    for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; }
    return items[items.length - 1];
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Grundfilter: kategorier, svårighet, aktuella frågor bara när de fortfarande är giltiga.
  function pool(opts) {
    opts = opts || {};
    const cats = opts.categories && opts.categories.length ? new Set(opts.categories) : null;
    const diff = opts.difficulty && opts.difficulty !== "alla" ? opts.difficulty : null;
    return PQ.bank.active().filter((q) => (!cats || cats.has(q.category)) && (!diff || q.difficulty === diff));
  }

  // Välj fråga: först svårighetsgrad enligt realistisk mix (om alla nivåer valts), sedan viktat.
  function pickFrom(list, exclude, now, useMix) {
    let candidates = list.filter((q) => !exclude.has(q.id));
    if (!candidates.length) return null;
    if (useMix) {
      const levels = PQ.bank.DIFFS.filter((d) => candidates.some((q) => q.difficulty === d));
      if (levels.length > 1) {
        const level = weightedPick(levels, (d) => PQ.DIFF_MIX[d]);
        candidates = candidates.filter((q) => q.difficulty === level);
      }
    }
    return weightedPick(candidates, (q) => weightFor(q, now));
  }

  // ---------- Statistik som motorn behöver ----------
  function categoryPerformance() {
    const per = {};
    PQ.CATEGORIES.forEach((c) => (per[c.id] = { n: 0, right: 0 }));
    PQ.store.log().forEach((e) => { if (per[e.c]) { per[e.c].n++; per[e.c].right += e.ok; } });
    return per;
  }

  // Svaga kategorier: lägre andel rätt => högre vikt. Lite data => måttlig vikt så att den utforskas.
  function weakCategoryWeights(categoryIds) {
    const per = categoryPerformance();
    const out = {};
    (categoryIds || PQ.CATEGORIES.map((c) => c.id)).forEach((id) => {
      const p = per[id] || { n: 0, right: 0 };
      const rate = (p.right + 1) / (p.n + 2);
      out[id] = { weight: Math.pow(1 - rate, 1.6) + (p.n < 5 ? 0.25 : 0.02), rate: p.n ? p.right / p.n : null, n: p.n };
    });
    return out;
  }

  function missedQuestions(scope) {
    const recs = PQ.store.records();
    return PQ.bank.active().filter((q) => {
      const r = recs[q.id];
      if (!r) return false;
      return scope === "ever" ? r.wrong > 0 : r.lastResult === "wrong";
    });
  }

  function freshNews() {
    const t = PQ.bank.today();
    return PQ.bank.active().filter((q) => PQ.bank.isFresh(q, t))
      .sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));
  }

  // ---------- Omgångar ----------
  /*
   * config: { mode, categories, difficulty, length (antal eller 0 = obegränsat), scope, ids }
   * Returnerar ett sessionsobjekt med next()/answer().
   */
  function createSession(config) {
    const now = Date.now();
    const s = {
      mode: config.mode, config, started: now,
      total: config.length || 0, // 0 = obegränsat
      queue: null, asked: [], results: [], current: null, reinserted: new Set(),
    };
    const useMix = !config.difficulty || config.difficulty === "alla";
    let base;

    switch (config.mode) {
      case "pubquiz": {
        base = pool({}).filter((q) => PQ.PUBQUIZ_WEIGHTS[q.category]);
        s.queue = buildPubquiz(base, config.length || 30, now);
        s.total = s.queue.length;
        break;
      }
      case "repetera": {
        base = config.ids ? config.ids.map((id) => PQ.bank.get(id)).filter((q) => q && !PQ.store.isHidden(q.id)) : missedQuestions(config.scope);
        if (config.categories && config.categories.length) base = base.filter((q) => config.categories.includes(q.category));
        // Flest missar först, sedan slumpvis inom samma nivå.
        s.queue = shuffle(base.slice()).sort((a, b) => (PQ.store.rec(b.id) || { wrong: 0 }).wrong - (PQ.store.rec(a.id) || { wrong: 0 }).wrong);
        if (config.length) s.queue = s.queue.slice(0, config.length);
        s.total = s.queue.length;
        break;
      }
      case "dagsquiz": { // ett av dagens quiz, i blandad ordning med de ospelade först
        base = config.ids.map((id) => PQ.bank.get(id)).filter((q) => q && !PQ.store.isHidden(q.id));
        s.queue = shuffle(base.slice()).sort((a, b) => !!PQ.store.rec(a.id) - !!PQ.store.rec(b.id));
        s.total = s.queue.length;
        break;
      }
      case "aktuellt": {
        base = freshNews();
        s.queue = shuffle(base.slice());
        if (config.length) s.queue = s.queue.slice(0, config.length);
        s.total = s.queue.length;
        break;
      }
      case "svaga": {
        base = pool({ categories: config.categories, difficulty: config.difficulty });
        const cw = weakCategoryWeights(config.categories && config.categories.length ? config.categories : null);
        s.weights = cw;
        s.pickNext = (exclude) => {
          const cats = Object.keys(cw).filter((id) => base.some((q) => q.category === id && !exclude.has(q.id)));
          if (!cats.length) return null;
          const cat = weightedPick(cats, (id) => cw[id].weight);
          return pickFrom(base.filter((q) => q.category === cat), exclude, Date.now(), useMix);
        };
        break;
      }
      default: { // "fritt"
        base = pool({ categories: config.categories, difficulty: config.difficulty });
        s.pickNext = (exclude) => pickFrom(base, exclude, Date.now(), useMix);
      }
    }
    s.poolSize = base.length;

    s.next = function () {
      if (s.total && s.asked.length >= s.total) { s.current = null; return null; }
      let q = null;
      if (s.queue) q = s.queue.shift() || null;
      else {
        const hidden = PQ.store.hiddenIds(); // frågor som markerats som för lätta under omgången
        const exclude = new Set(s.asked.map((x) => x.id).concat(hidden));
        q = s.pickNext(exclude);
        if (!q && s.asked.length) {
          // Hela urvalet har visats i omgången: börja om, men undvik de senaste.
          q = s.pickNext(new Set(s.asked.slice(-Math.min(10, Math.floor(s.poolSize / 2))).map((x) => x.id).concat(hidden)));
        }
      }
      s.current = q;
      if (q) s.asked.push(q);
      return q;
    };

    // tooEasy: räknas som "kunde" och frågan tas bort från kommande omgångar.
    s.answer = function (ok, tooEasy) {
      const q = s.current;
      if (!q) return;
      PQ.store.record(q, ok, s.mode, { hide: !!tooEasy });
      s.results.push({ id: q.id, ok, easy: !!tooEasy });
      if (tooEasy && s.queue) {
        const before = s.queue.length;
        s.queue = s.queue.filter((x) => x.id !== q.id);
        s.total -= before - s.queue.length;
      }
      // I repetitionsläget kommer en missad fråga tillbaka en gång till senare i omgången.
      if (!ok && s.mode === "repetera" && !s.reinserted.has(q.id) && s.queue.length >= 2) {
        s.reinserted.add(q.id);
        s.queue.splice(Math.min(s.queue.length, 3 + Math.floor(Math.random() * 3)), 0, q);
        s.total++;
      }
    };

    s.undo = function () {
      const id = PQ.store.undo();
      if (!id || !s.results.length) return null;
      const last = s.results.pop();
      // Lägg tillbaka den nuvarande frågan först i kön och visa den ångrade igen.
      if (s.current) {
        s.asked.pop();
        if (s.queue) s.queue.unshift(s.current);
      }
      if (s.reinserted.has(last.id) && s.queue) {
        const i = s.queue.findIndex((x, idx) => x.id === last.id && idx > 0);
        if (i > 0) { s.queue.splice(i, 1); s.total--; s.reinserted.delete(last.id); }
      }
      s.current = s.asked[s.asked.length - 1];
      return s.current;
    };

    s.score = function () {
      const right = s.results.filter((r) => r.ok).length;
      return { right, wrong: s.results.length - right, answered: s.results.length };
    };
    return s;
  }

  // Blandat pubquiz: kategorikvoter enligt PUBQUIZ_WEIGHTS och svårighetsmix 30/50/20.
  function buildPubquiz(base, n, now) {
    const byCat = {};
    base.forEach((q) => (byCat[q.category] = byCat[q.category] || []).push(q));
    const cats = Object.keys(PQ.PUBQUIZ_WEIGHTS).filter((c) => byCat[c] && byCat[c].length);
    const totalW = cats.reduce((a, c) => a + PQ.PUBQUIZ_WEIGHTS[c], 0);

    // Fördela antal per kategori (största rest-metoden).
    const quotas = cats.map((c) => { const exact = (PQ.PUBQUIZ_WEIGHTS[c] / totalW) * n; return { c, q: Math.floor(exact), rest: exact % 1 }; });
    let left = n - quotas.reduce((a, x) => a + x.q, 0);
    quotas.sort((a, b) => b.rest - a.rest).forEach((x) => { if (left > 0) { x.q++; left--; } });

    const chosen = [];
    const exclude = new Set();
    quotas.forEach(({ c, q }) => {
      for (let i = 0; i < q; i++) {
        const pick = pickFrom(byCat[c], exclude, now, true);
        if (!pick) break;
        exclude.add(pick.id);
        chosen.push(pick);
      }
    });
    // Fyll på om någon kategori tog slut.
    while (chosen.length < n) {
      const pick = pickFrom(base, exclude, now, true);
      if (!pick) break;
      exclude.add(pick.id);
      chosen.push(pick);
    }
    // Lätt i början, svårare mot slutet – som en riktig quizkväll – men blandat inom varje tredjedel.
    const rank = { "lätt": 0, "medel": 1, "svår": 2 };
    return chosen.map((q) => ({ q, key: rank[q.difficulty] + Math.random() * 1.6 }))
      .sort((a, b) => a.key - b.key).map((x) => x.q);
  }

  PQ.engine = {
    pool, createSession, weightFor, categoryPerformance, weakCategoryWeights, missedQuestions, freshNews, shuffle,
  };
})();
