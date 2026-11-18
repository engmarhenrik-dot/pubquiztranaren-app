/*
 * Dagens quiz: ett nytt quiz om aktuella händelser varje dag kl. 15, som en schemalagd
 * Claude-körning skapar. Quizen sparas i 7 dagar.
 *
 * Varifrån quizen kommer:
 *  - Claude-sidan: artefaktens databas, samlingen "dagsquiz" (ett dokument per datum).
 *  - Lokalt (index.html): data/dagsquiz.js, som anropar PQ.daily.add({...}).
 *
 * Ett quiz: { date: "ÅÅÅÅ-MM-DD", title, intro, created, questions: [fråga, ...] }
 * Frågorna har samma format som i data/questions/*.js, plus category. De hålls utanför
 * de vanliga spellägena. Om ett quiz är spelat räknas fram ur svarsposterna, så det syns
 * på alla enheter som synkar.
 */
(function () {
  const PQ = window.PQ;
  const KEEP_DAYS = 7;
  const quizzes = new Map(); // datum -> quiz

  function idsOf(quiz) { return quiz.questions.map((q) => q.id); }

  function add(raw) {
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date || "") || !Array.isArray(raw.questions)) return;
    const old = quizzes.get(raw.date);
    if (old && (old.created || "") >= (raw.created || "") && old.questions.length) return;
    if (old) idsOf(old).forEach((id) => PQ.bank.removeById(id));
    const questions = raw.questions.map((q, i) => Object.assign({
      id: `dq-${raw.date}-${String(i + 1).padStart(2, "0")}`,
      type: "aktuell", eventDate: raw.date, verified: raw.date,
    }, q, { daily: raw.date }));
    PQ.bank.addSet({ origin: "dagsquiz", questions });
    quizzes.set(raw.date, {
      date: raw.date, title: raw.title || "", intro: raw.intro || "", created: raw.created || "",
      questions: questions.map((q) => PQ.bank.get(q.id)).filter(Boolean),
    });
    if (api.onChange) api.onChange();
  }

  // Quizen från de senaste 7 dagarna, nyast först.
  function list() {
    const today = PQ.bank.today();
    return Array.from(quizzes.values())
      .filter((z) => z.date <= today && PQ.bank.daysBetween(z.date, today) < KEEP_DAYS && z.questions.length)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function status(quiz) {
    let answered = 0, right = 0;
    quiz.questions.forEach((q) => {
      const r = PQ.store.rec(q.id);
      if (r) { answered++; if (r.lastResult === "right") right++; }
    });
    const total = quiz.questions.length;
    return { total, answered, right, state: !answered ? "ny" : answered >= total ? "klar" : "påbörjad" };
  }

  function unplayed() { return list().filter((z) => status(z).state === "ny").length; }

  // Claude-sidan: läs quizen ur databasen och lyssna efter nya.
  async function connect() {
    if (!(window.claude && typeof window.claude.use === "function")) return;
    try {
      const db = await window.claude.use("db");
      if (!db) return;
      db.collection("dagsquiz").onSnapshot(
        (snap) => snap.docs.forEach((d) => add(Object.assign({ date: d.id }, d.data()))),
        (e) => console.warn("Kunde inte läsa dagens quiz", e)
      );
    } catch (e) { console.warn("Kunde inte läsa dagens quiz", e); }
  }

  const api = PQ.daily = { KEEP_DAYS, add, list, status, unplayed, idsOf, get: (date) => quizzes.get(date), onChange: null };
  connect();
})();
