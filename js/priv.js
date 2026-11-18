/*
 * Läser in den krypterade privata frågesamlingen (data/p.bin) i den publicerade appen.
 * Första gången frågar appen efter lösenordet. Det sparas bara i den här webbläsaren.
 * Utan rätt lösenord fungerar appen som vanligt, men utan de privata frågorna.
 */
(function () {
  const PQ = window.PQ;
  const KEY = "pq_priv_pw";
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function decrypt(bytes, pw) {
    const salt = bytes.slice(0, 16), iv = bytes.slice(16, 32);
    const mac = bytes.slice(bytes.length - 32), ct = bytes.slice(32, bytes.length - 32);
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" }, base, 512));
    const macKey = await crypto.subtle.importKey("raw", bits.slice(32), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signed = new Uint8Array(iv.length + ct.length); signed.set(iv); signed.set(ct, iv.length);
    if (!(await crypto.subtle.verify("HMAC", macKey, mac, signed))) return null;
    const encKey = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-CBC", false, ["decrypt"]);
    const zipped = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, encKey, ct);
    const stream = new Blob([zipped]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  async function run() {
    if (!window.crypto || !crypto.subtle || typeof DecompressionStream === "undefined") return;
    let res;
    try { res = await fetch("data/p.bin"); } catch (e) { return; }
    if (!res.ok) return;
    const bytes = b64((await res.text()).trim());
    let pw = null;
    try { pw = localStorage.getItem(KEY); } catch (e) { /* ingen lagring */ }
    for (let tries = 0; tries < 3; tries++) {
      if (!pw) { pw = window.prompt(tries ? "Fel lösenord. Försök igen (avbryt för att hoppa över):" : "Lösenord för den privata frågesamlingen (avbryt för att hoppa över):"); if (!pw) return; }
      const text = await decrypt(bytes, pw.trim()).catch(() => null);
      if (text) {
        try { localStorage.setItem(KEY, pw.trim()); } catch (e) { /* ignorera */ }
        const s = document.createElement("script");
        s.textContent = text;
        document.head.appendChild(s);
        if (PQ.app && PQ.app.refresh) PQ.app.refresh();
        return;
      }
      try { localStorage.removeItem(KEY); } catch (e) { /* ignorera */ }
      pw = null;
    }
  }
  run();
})();
