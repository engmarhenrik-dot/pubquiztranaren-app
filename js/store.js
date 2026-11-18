/*
 * Beständig lagring i webbläsarens localStorage:
 *  - pq.progress.v1  statistik och svarshistorik
 *  - pq.custom.v1    egna/godkända researchfrågor
 *  - pq.pending.v1   granskningskö för nya frågor
 *  - pq.settings.v1  tema och inställningar
 * Allt kan exporteras/importeras som en JSON-backup från Statistik-sidan.
 */
(function () {
  const PQ = window.PQ;
  const K = { progress: "pq.progress.v1", custom: "pq.custom.v1", pending: "pq.pending.v1", settings: "pq.settings.v1" };
  const LOG_CAP = 50000;

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  let quiet = false;
  function write(key, val) {
    if (!quiet && PQ.store && PQ.store.onSave) { try { PQ.store.onSave(key); } catch (e) { /* synken får inte stoppa sparandet */ } }
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.warn("Kunde inte spara", key, e); PQ.store.lastError = e; return false; }
  }

  function freshProgress() { return { version: 1, created: Date.now(), records: {}, log: [], sessions: [], hidden: {} }; }

  let progress = read(K.progress, null);
  if (!progress || !progress.records) progress = freshProgress();
  if (!progress.hidden) progress.hidden = {};
  // hidden: { id: { h: 1|0, t: tidpunkt } } – frågor markerade som "för lätt". h: 0 = återställd.
  // Tidpunkten gör att synken kan avgöra vilken ändring som är senast.
  function setHidden(id, on) { progress.hidden[id] = { h: on ? 1 : 0, t: Date.now() }; }
  let custom = read(K.custom, []);
  let pending = read(K.pending, []);
  let settings = read(K.settings, {});
  let undoStack = [];

  function saveProgress() { return write(K.progress, progress); }

  PQ.store = {
    available: (function () { try { localStorage.setItem("pq.test", "1"); localStorage.removeItem("pq.test"); return true; } catch (e) { return false; } })(),

    // ---- Svar och statistik ----
    // opts.hide: frågan var för lätt och tas bort från kommande omgångar.
    record(q, ok, mode, opts) {
      const prev = progress.records[q.id] ? Object.assign({}, progress.records[q.id]) : null;
      const prevHidden = progress.hidden[q.id] ? Object.assign({}, progress.hidden[q.id]) : null;
      const hide = !!(opts && opts.hide);
      if (hide) setHidden(q.id, true);
      const r = progress.records[q.id] || (progress.records[q.id] = { seen: 0, right: 0, wrong: 0, streak: 0, first: Date.now() });
      r.seen++;
      if (ok) { r.right++; r.streak++; } else { r.wrong++; r.streak = 0; }
      r.last = Date.now();
      r.lastResult = ok ? "right" : "wrong";
      progress.log.push({ t: r.last, id: q.id, c: q.category, d: q.difficulty, ok: ok ? 1 : 0, m: mode });
      if (progress.log.length > LOG_CAP) progress.log.splice(0, progress.log.length - LOG_CAP);
      undoStack.push({ id: q.id, prev, hide, prevHidden });
      if (undoStack.length > 20) undoStack.shift();
      saveProgress();
    },
    canUndo() { return undoStack.length > 0; },
    undo() {
      const u = undoStack.pop();
      if (!u) return null;
      if (u.prev) progress.records[u.id] = u.prev; else delete progress.records[u.id];
      // Ett ångrat "för lätt" återställs med ny tidpunkt, så att synken inte tar tillbaka borttagningen.
      if (u.hide) setHidden(u.id, !!(u.prevHidden && u.prevHidden.h));
      for (let i = progress.log.length - 1; i >= 0; i--) {
        if (progress.log[i].id === u.id) { progress.log.splice(i, 1); break; }
      }
      saveProgress();
      return u.id;
    },
    rec(id) { return progress.records[id] || null; },
    records() { return progress.records; },
    log() { return progress.log; },
    sessions() { return progress.sessions; },
    addSession(s) {
      progress.sessions.push(s);
      if (progress.sessions.length > 1000) progress.sessions.shift();
      saveProgress();
    },
    // resetAt gör att nollställningen följer med till andra enheter via synken.
    // Borttagna (för lätta) frågor följer med över en nollställning – de återställs i Frågebanken.
    resetProgress() { const hidden = progress.hidden; progress = freshProgress(); progress.hidden = hidden; progress.resetAt = Date.now(); undoStack = []; saveProgress(); },

    // ---- För lätta frågor ----
    isHidden(id) { const h = progress.hidden[id]; return !!(h && h.h); },
    hiddenIds() { return Object.keys(progress.hidden).filter((id) => progress.hidden[id].h); },
    unhide(ids) { [].concat(ids).forEach((id) => setHidden(id, false)); undoStack = undoStack.filter((u) => !u.hide); saveProgress(); },

    // ---- Egna frågor ----
    custom() { return custom; },
    saveCustom(list) { custom = list; return write(K.custom, custom); },

    // ---- Granskningskö ----
    pending() { return pending; },
    savePending(list) { pending = list; return write(K.pending, pending); },

    // ---- Inställningar ----
    setting(key, fallback) { return key in settings ? settings[key] : fallback; },
    setSetting(key, val) { settings[key] = val; write(K.settings, settings); },

    // ---- Backup ----
    exportAll() {
      return { app: "pubquiz-tranaren", exported: new Date().toISOString(), progress, custom, pending, settings: Object.assign({}, settings, { apiKey: undefined }) };
    },
    importAll(obj) {
      if (!obj || obj.app !== "pubquiz-tranaren" || !obj.progress || !obj.progress.records) throw new Error("Filen ser inte ut som en backup från Pubquiztränaren.");
      progress = obj.progress;
      if (!progress.hidden) progress.hidden = {};
      custom = Array.isArray(obj.custom) ? obj.custom : [];
      pending = Array.isArray(obj.pending) ? obj.pending : [];
      if (obj.settings) settings = Object.assign(settings, obj.settings);
      undoStack = [];
      write(K.progress, progress); write(K.custom, custom); write(K.pending, pending); write(K.settings, settings);
    },

    // ---- Synk (js/sync.js) ----
    onSave: null,
    snapshot() { return { progress, custom, pending }; },
    // Ersätter data med en sammanslagen version utan att trigga onSave.
    adopt(next) {
      quiet = true;
      try {
        if (next.progress) { progress = next.progress; if (!progress.hidden) progress.hidden = {}; write(K.progress, progress); undoStack = []; }
        if (next.custom) { custom = next.custom; write(K.custom, custom); }
        if (next.pending) { pending = next.pending; write(K.pending, pending); }
      } finally { quiet = false; }
    },
  };
})();
