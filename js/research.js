/*
 * Research-modul: hämtar nya frågor från webben via Claude (Anthropic API) med webbsökning.
 *
 * Flöde: 1) generera frågor med webbsökning  2) separat faktagranskning med nya sökningar
 *        3) lokal dubblettkontroll mot banken  4) frågorna hamnar i granskningskön i appen.
 *
 * API-nyckeln skrivs aldrig in i någon fil. Den sparas bara i den här webbläsaren
 * (sessionStorage som standard, localStorage om du kryssar i "Kom ihåg") och skickas
 * endast till api.anthropic.com.
 *
 * Utan nyckel: använd "Kopiera research-prompt", kör den i Claude (med webbsökning)
 * och klistra in JSON-svaret under "Importera frågor".
 */
(function () {
  const PQ = window.PQ;
  const KEY_STORE = "pq.apikey";
  const API_URL = "https://api.anthropic.com/v1/messages";
  const MODELS = [
    { id: "claude-opus-5-5", name: "Claude Opus 5.5 (bäst kvalitet, standard)" },
    { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5 (snabbare, billigare)" },
  ];

  function getKey() {
    try { return sessionStorage.getItem(KEY_STORE) || localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; }
  }
  function setKey(key, remember) {
    try {
      sessionStorage.removeItem(KEY_STORE); localStorage.removeItem(KEY_STORE);
      if (key) (remember ? localStorage : sessionStorage).setItem(KEY_STORE, key);
    } catch (e) { /* lagring blockerad – nyckeln gäller då inte efter omladdning */ }
  }
  function keyRemembered() { try { return !!localStorage.getItem(KEY_STORE); } catch (e) { return false; } }

  function config() {
    return {
      model: PQ.store.setting("model", "claude-opus-5-5"),
      effort: PQ.store.setting("effort", "medium"),
    };
  }

  // ---------- Promptar ----------
  const QUESTION_SCHEMA = `{
  "questions": [
    {
      "question": "Frågetexten på svenska",
      "answer": "Kort, entydigt svar",
      "accept": ["alternativa godkända svar"],
      "explanation": "1–2 meningar med kompletterande fakta",
      "more": "2–3 meningar till med bakgrund om svaret (\\"Mer om svaret\\")",
      "difficulty": "lätt | medel | svår",
      "type": "tidlös | aktuell",
      "eventDate": "ÅÅÅÅ-MM-DD (krävs för aktuella frågor)",
      "validUntil": "ÅÅÅÅ-MM-DD eller null (sista dag svaret garanterat stämmer)",
      "sources": ["https://… (minst två oberoende källor)"]
    }
  ]
}`;

  function buildGeneratePrompt(opts, existing) {
    const cat = PQ.CATEGORY[opts.category];
    const today = PQ.bank.today();
    const isNews = opts.kind === "aktuell";
    const mix = opts.difficulty && opts.difficulty !== "alla"
      ? `Alla frågor ska ha svårighetsgraden "${opts.difficulty}".`
      : "Fördela svårighetsgraden ungefär 30 % lätt, 50 % medel och 20 % svår.";
    const lines = [
      `Dagens datum är ${today}.`,
      `Skriv ${opts.count} nya pubquizfrågor på svenska i kategorin "${cat.name}" (${cat.blurb}).`,
      isNews
        ? `Frågorna ska handla om händelser från de senaste ${opts.days} dagarna (efter ${shiftDate(today, -opts.days)}). Sök efter färska nyheter i svenska och internationella medier (t.ex. SVT, SR, DN, Aftonbladet, Expressen, TT, Reuters, BBC). Använd bara händelser som bekräftas av daterade källor, och sätt eventDate till händelsens datum. Sätt validUntil om svaret kan ändras snart (t.ex. pågående regeringsbildning, tabelledare).`
        : `Frågorna ska vara tidlösa (svaret ändras inte över tid) och av den typ som ofta förekommer på svenska pubquiz.`,
      "",
      "Gör så här:",
      "1. Använd webbsökning för att undersöka vad som brukar förekomma på svenska pubquiz och frågesporter inom kategorin, och för att hitta korrekta fakta.",
      "2. Skriv egna frågor baserade på researchen – kopiera inte färdiga frågesamlingar.",
      "3. Prioritera frågor med hög sannolikhet att dyka upp på en vanlig svensk pubquiz: allmänbildning, populärkultur, Sverige och Norden. Undvik extremt obskyra detaljer.",
      `4. ${mix}`,
      "5. Varje fråga måste ha ett enda tydligt rätt svar. Undvik formuleringar som 'störst', 'först' eller 'bäst' om det finns olika sätt att mäta. Ange alternativa godkända stavningar/namn i accept.",
      "6. Kontrollera varje svar mot minst två oberoende källor och ange källornas URL:er.",
      "7. Svaret får inte stå i frågan.",
      existing.length ? "\nDessa frågor finns redan i banken – skriv INTE frågor som efterfrågar samma fakta:\n" + existing.map((q) => "- " + q).join("\n") : "",
      "",
      "Svara ENDAST med ett JSON-kodblock enligt detta schema:",
      "```json\n" + QUESTION_SCHEMA + "\n```",
    ];
    return lines.join("\n");
  }

  function buildCheckPrompt(questions) {
    return [
      `Dagens datum är ${PQ.bank.today()}. Du är en noggrann faktagranskare för ett svenskt pubquiz.`,
      "Granska varje fråga nedan självständigt. Använd webbsökning för att kontrollera svaret mot oberoende, tillförlitliga källor (inte bara de källor som anges).",
      "Bedöm för varje fråga:",
      '- "ok": svaret är korrekt, entydigt och frågan är rimligt formulerad.',
      '- "fix": frågan är bra men svar, alternativa svar, förklaring, datum eller svårighetsgrad behöver rättas – ange de rättade fälten.',
      '- "reject": svaret är fel och kan inte rättas enkelt, frågan är tvetydig, har flera rimliga svar, bygger på obekräftade uppgifter, eller (för aktuella frågor) händelsen är inte ny.',
      "",
      "Frågor (JSON):",
      "```json\n" + JSON.stringify(questions.map((q) => ({ id: q.id, question: q.question, answer: q.answer, accept: q.accept, explanation: q.explanation, more: q.more, difficulty: q.difficulty, type: q.type, eventDate: q.eventDate, sources: q.sources })), null, 1) + "\n```",
      "",
      "Svara ENDAST med ett JSON-kodblock:",
      '```json\n{"results":[{"id":"…","verdict":"ok|fix|reject","answer":"(vid fix)","accept":["(vid fix)"],"explanation":"(vid fix)","difficulty":"(vid fix)","eventDate":"(vid fix)","sources":["URL:er du själv kontrollerade"],"note":"kort motivering"}]}\n```',
    ].join("\n");
  }

  function shiftDate(iso, days) {
    const d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + days);
    return PQ.bank.isoDate(d);
  }

  function existingSummary(category) {
    return PQ.bank.all().filter((q) => q.category === category).slice(-150).map((q) => q.question + " → " + q.answer);
  }

  // ---------- API-anrop ----------
  async function callClaude(prompt, onStatus) {
    const key = getKey();
    if (!key) throw new Error("Ingen API-nyckel angiven.");
    const cfg = config();
    const messages = [{ role: "user", content: prompt }];
    const content = [];
    let usage = { input_tokens: 0, output_tokens: 0 };
    let useFallbacks = true;

    for (let round = 0; round < 8; round++) {
      const body = {
        model: cfg.model,
        max_tokens: 16000,
        messages,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 12 }],
        output_config: { effort: cfg.effort },
      };
      const headers = {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2026-10-21",
        "anthropic-dangerous-direct-browser-access": "true",
      };
      if (useFallbacks) { body.fallbacks = "default"; headers["anthropic-beta"] = "server-side-fallback-2026-07-01"; }

      let res;
      try { res = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(body) }); }
      catch (e) { throw new Error("Kunde inte nå api.anthropic.com – kontrollera internetanslutningen. (" + e.message + ")"); }
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && data.error && data.error.message) || res.statusText;
        // Om kontot inte har tillgång till fallback-funktionen: försök igen utan den.
        if (res.status === 400 && useFallbacks && /fallback|beta/i.test(msg)) { useFallbacks = false; round--; continue; }
        if (res.status === 401) throw new Error("API-nyckeln godkändes inte (401). Kontrollera nyckeln.");
        if (res.status === 429) throw new Error("För många anrop just nu (429). Vänta en stund och försök igen.");
        throw new Error("API-fel " + res.status + ": " + msg);
      }
      if (data.usage) { usage.input_tokens += data.usage.input_tokens || 0; usage.output_tokens += data.usage.output_tokens || 0; }
      content.push(...(data.content || []));
      const searches = (data.content || []).filter((b) => b.type === "server_tool_use").length;
      if (searches && onStatus) onStatus(`… ${searches} webbsökningar i denna runda`);

      if (data.stop_reason === "refusal") throw new Error("Modellen avböjde förfrågan.");
      if (data.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: data.content });
        continue;
      }
      if (data.stop_reason === "max_tokens") throw new Error("Svaret blev för långt och klipptes av. Prova färre frågor per körning.");
      break;
    }

    const text = content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const urls = [];
    content.forEach((b) => {
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) b.content.forEach((r) => r.url && urls.push(r.url));
      if (b.type === "text" && Array.isArray(b.citations)) b.citations.forEach((c) => c.url && urls.push(c.url));
    });
    return { text, urls: [...new Set(urls)], usage };
  }

  function extractJson(text) {
    const blocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
    const candidates = blocks.length ? blocks.reverse() : [text];
    for (const c of candidates) {
      try { return JSON.parse(c); } catch (e) { /* prova nästa */ }
      const start = c.search(/[\[{]/), end = Math.max(c.lastIndexOf("}"), c.lastIndexOf("]"));
      if (start >= 0 && end > start) { try { return JSON.parse(c.slice(start, end + 1)); } catch (e) { /* prova nästa */ } }
    }
    throw new Error("Kunde inte tolka JSON i svaret.");
  }

  function newId(category) {
    return "r-" + category + "-" + PQ.bank.today().replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 7);
  }

  // Gör om råa frågor (från API eller inklistrad JSON) till kandidater för granskningskön.
  function prepareCandidates(rawList, defaults) {
    const pendingIds = new Set(PQ.store.pending().map((p) => p.raw.id));
    const out = { ok: [], invalid: [], duplicates: [] };
    const accepted = [];
    rawList.forEach((raw) => {
      raw = Object.assign({}, raw);
      raw.category = raw.category || defaults.category;
      if (!raw.id || PQ.bank.has(raw.id) || pendingIds.has(raw.id)) raw.id = newId(raw.category || "blandat");
      raw.verified = raw.verified || PQ.bank.today();
      if (raw.type !== "aktuell") { delete raw.eventDate; }
      if (!raw.validUntil) delete raw.validUntil;
      if (!raw.accept || !raw.accept.length) delete raw.accept;
      const { question, errors } = PQ.bank.validateRaw(raw);
      if (errors.length) { out.invalid.push({ raw, errors }); return; }
      const pendingQs = PQ.store.pending().map((p) => PQ.bank.normalize(p.raw, {}, "kö"));
      const dup = PQ.bank.findDuplicate(question, PQ.bank.all().concat(pendingQs, accepted));
      if (dup) { out.duplicates.push({ raw, of: dup.question }); return; }
      accepted.push(question);
      out.ok.push(raw);
    });
    return out;
  }

  function addToPending(raws, meta) {
    const list = PQ.store.pending().slice();
    raws.forEach((raw) => list.push({ raw, meta: Object.assign({ added: new Date().toISOString() }, meta) }));
    PQ.store.savePending(list);
  }

  // ---------- Hela pipelinen ----------
  async function run(opts, log) {
    log = log || function () {};
    const cat = PQ.CATEGORY[opts.category];
    const usage = { input_tokens: 0, output_tokens: 0 };
    const addUsage = (u) => { usage.input_tokens += u.input_tokens; usage.output_tokens += u.output_tokens; };

    log(`1/3 Researchar ${opts.count} ${opts.kind === "aktuell" ? "aktuella" : "tidlösa"} frågor om ${cat.name} med webbsökning…`);
    const gen = await callClaude(buildGeneratePrompt(opts, existingSummary(opts.category)), log);
    addUsage(gen.usage);
    let raws = (extractJson(gen.text).questions || []).map((r) => Object.assign(r, { category: opts.category, type: opts.kind, id: newId(opts.category) }));
    raws.forEach((r) => { if (!r.sources || !r.sources.length) r.sources = gen.urls.slice(0, 2); });
    log(`   → ${raws.length} frågeförslag.`);
    if (!raws.length) return { added: 0, rejected: [], duplicates: [], invalid: [], usage };

    log("2/3 Faktagranskar varje fråga med nya, oberoende sökningar…");
    const chk = await callClaude(buildCheckPrompt(raws), log);
    addUsage(chk.usage);
    const verdicts = new Map((extractJson(chk.text).results || []).map((v) => [v.id, v]));
    const rejected = [];
    const checked = [];
    raws.forEach((r) => {
      const v = verdicts.get(r.id);
      if (!v) { rejected.push({ raw: r, note: "Fick inget granskningsbesked." }); return; }
      if (v.verdict === "reject") { rejected.push({ raw: r, note: v.note || "Underkänd vid faktagranskning." }); return; }
      if (v.verdict === "fix") {
        ["answer", "accept", "explanation", "more", "difficulty", "eventDate"].forEach((f) => { if (v[f] && (!Array.isArray(v[f]) || v[f].length)) r[f] = v[f]; });
      }
      if (Array.isArray(v.sources) && v.sources.length) r.sources = [...new Set((r.sources || []).concat(v.sources))].slice(0, 4);
      r.verified = PQ.bank.today();
      r._note = { verdict: v.verdict, note: v.note || "" };
      checked.push(r);
    });
    log(`   → ${checked.length} godkända, ${rejected.length} underkända.`);

    log("3/3 Kontrollerar dubbletter mot frågebanken…");
    const prepared = prepareCandidates(checked, { category: opts.category });
    addToPending(prepared.ok, { source: "research", model: config().model });
    log(`   → ${prepared.ok.length} nya frågor i granskningskön, ${prepared.duplicates.length} dubbletter bortsorterade.`);
    return { added: prepared.ok.length, rejected, duplicates: prepared.duplicates, invalid: prepared.invalid, usage };
  }

  // Prompt för manuell research (utan API-nyckel) – klistra in i Claude med webbsökning.
  function manualPrompt(opts) {
    return buildGeneratePrompt(opts, existingSummary(opts.category)) +
      "\n\nInnan du svarar: faktagranska varje fråga en gång till med en ny, oberoende sökning och ta bort frågor du inte är säker på.";
  }

  function importText(text, defaultCategory) {
    const parsed = extractJson(text);
    const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    if (!list.length) throw new Error("Hittade inga frågor i texten.");
    const prepared = prepareCandidates(list, { category: defaultCategory });
    addToPending(prepared.ok, { source: "import" });
    return prepared;
  }

  PQ.research = { MODELS, getKey, setKey, keyRemembered, config, run, manualPrompt, importText, extractJson };
})();
