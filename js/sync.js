/*
 * Synk via Claude-kontot. Gäller bara när appen körs som publicerad sida i claude.ai
 * (webb eller mobilapp). Lokalt (index.html) gör filen ingenting.
 *
 * Datan ligger i artefaktens databas under data/users/<id>/, som bara du själv kan läsa:
 *   state       svarsposter per fråga, spelade omgångar, för lätta frågor, antal loggdelar
 *   log-NNNN    svarshistoriken i delar om LOG_CHUNK svar
 *   custom      egna och godkända frågor
 *   pending     granskningskön
 * localStorage används fortfarande som snabb lokal kopia. Vid start och när fliken blir
 * synlig igen slås lokal och sparad data ihop, så att telefon och dator visar samma statistik.
 */
(function () {
  const PQ = window.PQ;
  const LOG_CHUNK = 1500;
  const LOG_CAP = 50000;
  const SESSION_CAP = 400;

  const host = PQ.host = {
    inClaude: !!(window.claude && typeof window.claude.use === "function"),
    status: "local", // local | connecting | synced | offline | error
    lastSync: null,
    downloads: null,
    onStatus: null,
    onRemoteChange: null,
  };
  if (!host.inClaude) return;

  let db = null, base = null;
  let pushed = {};          // senast skickade JSON per dokument
  let remoteChunks = 0;     // antal loggdelar som finns i databasen
  let timer = null, pushing = false, dirty = false, lastPull = 0;
  let ready = false;        // inget skrivs förrän databasen har lästs, annars kan annan enhets data skrivas över

  function setStatus(s) { host.status = s; if (s === "synced") host.lastSync = Date.now(); if (host.onStatus) host.onStatus(s); }

  const packLog = (e) => [e.t, e.id, e.c, e.d, e.ok, e.m || ""];
  const unpackLog = (a) => ({ t: a[0], id: a[1], c: a[2], d: a[3], ok: a[4], m: a[5] || undefined });

  function withTimeout(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]);
  }

  // ---------- Sammanslagning ----------
  function merge(local, remote) {
    const resetAt = Math.max(local.progress.resetAt || 0, remote.resetAt || 0);
    const keep = (ts) => !ts || ts >= resetAt; // en nollställning på en enhet gäller alla

    const records = {};
    const addRec = (id, r) => {
      if (!r || !keep(r.last)) return;
      const cur = records[id];
      if (!cur || (r.last || 0) > (cur.last || 0) || ((r.last || 0) === (cur.last || 0) && r.seen > cur.seen)) records[id] = r;
    };
    Object.entries(remote.records || {}).forEach(([id, r]) => addRec(id, r));
    Object.entries(local.progress.records).forEach(([id, r]) => addRec(id, r));

    const seen = new Set(), log = [];
    remote.log.concat(local.progress.log).forEach((e) => {
      const k = e.t + "|" + e.id;
      if (seen.has(k) || !keep(e.t)) return;
      seen.add(k); log.push(e);
    });
    log.sort((a, b) => a.t - b.t);
    if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);

    const sSeen = new Set(), sessions = [];
    (remote.sessions || []).concat(local.progress.sessions).forEach((s) => {
      const k = s.started + "|" + s.mode;
      if (sSeen.has(k) || !keep(s.started)) return;
      sSeen.add(k); sessions.push(s);
    });
    sessions.sort((a, b) => a.started - b.started);

    // För lätta frågor: den senaste ändringen per fråga vinner (borttagen eller återställd).
    const hidden = Object.assign({}, remote.hidden || {});
    Object.entries(local.progress.hidden || {}).forEach(([id, h]) => {
      if (!hidden[id] || (h.t || 0) >= (hidden[id].t || 0)) hidden[id] = h;
    });

    const byId = (a, b) => { const m = new Map(); a.concat(b).forEach((x) => { const id = x.id || (x.raw && x.raw.id); if (id && !m.has(id)) m.set(id, x); }); return Array.from(m.values()); };
    const custom = byId(local.custom, remote.custom || []);
    const customIds = new Set(custom.map((r) => r.id));
    const pending = byId(local.pending, remote.pending || []).filter((p) => !customIds.has(p.raw && p.raw.id));

    return {
      progress: Object.assign({}, local.progress, {
        created: Math.min(local.progress.created || Infinity, remote.created || Infinity) || Date.now(),
        resetAt, records, log, sessions: sessions.slice(-1000), hidden,
      }),
      custom, pending,
    };
  }

  const sameData = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // ---------- Läsa ----------
  let pulling = null;
  function pull() {
    if (!pulling) pulling = doPull().finally(() => { pulling = null; });
    return pulling;
  }

  async function doPull() {
    lastPull = Date.now();
    const [stateSnap, customSnap, pendingSnap] = await Promise.all(["state", "custom", "pending"].map((d) => base.doc(d).get()));
    const state = stateSnap.exists ? stateSnap.data() : null;
    const chunks = state ? state.logChunks || 0 : 0;
    const logSnaps = await Promise.all(Array.from({ length: chunks }, (_, i) => base.doc(chunkId(i)).get()));
    const remote = {
      created: state ? state.created : 0,
      resetAt: state ? state.resetAt || 0 : 0,
      records: state ? state.records : {},
      sessions: state ? state.sessions : [],
      hidden: state ? state.hidden || {} : {},
      log: [].concat(...logSnaps.map((s) => (s.exists ? s.data().entries || [] : []))).map(unpackLog),
      custom: customSnap.exists ? customSnap.data().list || [] : [],
      pending: pendingSnap.exists ? pendingSnap.data().list || [] : [],
    };
    remoteChunks = chunks;
    // Det som redan ligger i databasen behöver inte skickas igen.
    pushed = {};
    logSnaps.forEach((s, i) => { if (s.exists) pushed[chunkId(i)] = JSON.stringify(s.data().entries || []); });
    if (customSnap.exists) pushed.custom = JSON.stringify(remote.custom);
    if (pendingSnap.exists) pushed.pending = JSON.stringify(remote.pending);

    const local = PQ.store.snapshot();
    const merged = merge(local, remote);
    const changedLocally = !sameData(merged.progress, local.progress) || !sameData(merged.custom, local.custom) || !sameData(merged.pending, local.pending);
    if (changedLocally) {
      PQ.store.adopt(merged);
      merged.custom.forEach((raw) => { if (!PQ.bank.has(raw.id)) PQ.bank.addCustom(raw); });
    }
    ready = true;
    await push();
    setStatus("synced");
    if (changedLocally && host.onRemoteChange) host.onRemoteChange();
  }

  const chunkId = (i) => "log-" + String(i).padStart(4, "0");

  // ---------- Skriva (ett dokument i taget) ----------
  async function writeIfChanged(id, body, key) {
    const json = JSON.stringify(key ? body[key] : body);
    if (pushed[id] === json) return;
    await base.doc(id).set(body);
    pushed[id] = json;
  }

  async function push() {
    if (!ready) return;
    if (pushing) { dirty = true; return; }
    pushing = true;
    try {
      do {
        dirty = false;
        const { progress, custom, pending } = PQ.store.snapshot();
        const packed = progress.log.map(packLog);
        const n = Math.ceil(packed.length / LOG_CHUNK);
        for (let i = 0; i < n; i++) {
          const entries = packed.slice(i * LOG_CHUNK, (i + 1) * LOG_CHUNK);
          await writeIfChanged(chunkId(i), { entries }, "entries");
        }
        for (let i = n; i < remoteChunks; i++) { await base.doc(chunkId(i)).delete(); delete pushed[chunkId(i)]; }
        remoteChunks = n;
        await writeIfChanged("state", {
          v: 1, created: progress.created, resetAt: progress.resetAt || 0, logChunks: n,
          records: progress.records, sessions: progress.sessions.slice(-SESSION_CAP), hidden: progress.hidden || {},
        });
        await writeIfChanged("custom", { list: custom }, "list");
        await writeIfChanged("pending", { list: pending }, "list");
      } while (dirty);
      setStatus("synced");
    } catch (e) {
      console.warn("Synken misslyckades", e);
      setStatus(e && e.code === "quota_exceeded" ? "error" : "offline");
    } finally { pushing = false; }
  }

  function schedule() {
    if (!ready) return;
    clearTimeout(timer);
    timer = setTimeout(push, 1500);
  }

  PQ.store.onSave = (key) => { if (key !== "pq.settings.v1") schedule(); };

  document.addEventListener("visibilitychange", () => {
    if (!base) return;
    if (document.visibilityState === "hidden") { if (ready) { clearTimeout(timer); push(); } }
    else if ((!ready || Date.now() - lastPull > 30000) && !pushing) pull().catch(() => setStatus("offline"));
  });

  // ---------- Start ----------
  (async function start() {
    setStatus("connecting");
    try {
      const [dbNs, user, downloads] = await Promise.all([
        window.claude.use("db"), window.claude.use("user"), window.claude.use("downloads"),
      ]);
      host.downloads = downloads;
      const uid = user ? await user.id() : null;
      if (!dbNs || !uid) { setStatus("local"); return; }
      db = dbNs;
      base = db.collection("data/users/" + uid);
      await withTimeout(pull(), 12000);
    } catch (e) {
      console.warn("Kunde inte starta synken", e);
      setStatus("offline");
    }
  })();
})();
