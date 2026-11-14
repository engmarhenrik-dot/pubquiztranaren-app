/*
 * Onsdagsquizen, avsnitt 40 (Knutbar, 2024-09-04): frågor från avsnittet (tagg "onsdagsquizen")
 * och liknande frågor på samma teman (tagg "liknande").
 * Utelämnade: Franco, Konstantinopel, Zlatans italienska klubbar, "Frost", "Fantomen på Operan", Riga, Tripoli,
 * Vietnamkrigets slut, westfaliska freden, inbördeskrigets slut, klaustrofobi, araknofobi, Sagrada Família och
 * "Måndag hela veckan" (fanns redan eller avslöjas av andra frågor).
 * Självbiografin "Laterna magica" skrevs av Ingmar Bergman, inte "Per Bergman" som det sades i quizet.
 * Orterna i landskapsfrågorna är delvis utbytta för att inte avslöja andra frågor.
 */
PQ.bank.addSet({
  verified: "2026-11-05",
  origin: "onsdagsquizen",
  questions: [
    // ---------- Göteborgare ----------
    { id: "oq40-pers-01", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken göteborgare var programledare för de första säsongerna av \"Expedition: Robinson\" och sedan för \"24 karat\"?", answer: "Harald Treutiger", accept: ["Treutiger"], explanation: "Han ledde de första säsongerna i slutet av 1990-talet.", more: "Han har utsetts till Årets göteborgare.", sources: ["sv:Harald_Treutiger"] },
    { id: "oq40-pers-02", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vem leder tv-programmet \"Historieätarna\" tillsammans med sin partner Erik Haag?", answer: "Lotta Lundgren", explanation: "Hon är kock och författare.", more: "Paret gjorde tidigare \"Landet brunsås\".", sources: ["sv:Lotta_Lundgren"] },
    { id: "oq40-pers-03", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken göteborgsk komiker, gift med Anna Mannheimer, kom tvåa i \"På spåret\" 2023 tillsammans med sonen Hector?", answer: "Peter Apelgren", accept: ["Apelgren"], explanation: "Han är komiker, skådespelare och programledare.", more: "Han har också utsetts till Årets göteborgare.", sources: ["sv:Peter_Apelgren"] },

    // ---------- Landskap ----------
    { id: "oq40-sve-01", category: "sverige-norden", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket landskap ligger Katrineholm, Nyköping och Flen?", answer: "Södermanland", accept: ["Sörmland"], explanation: "Landskapets residensstad är Nyköping.", more: "Där ligger också statsministerns sommarbostad.", sources: ["sv:Södermanland"] },
    { id: "oq40-sve-02", category: "sverige-norden", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket landskap ligger Järvsö, Ljusdal och Hudiksvall?", answer: "Hälsingland", explanation: "Landskapet är känt för sina hälsingegårdar.", more: "Sju hälsingegårdar är världsarv sedan 2012.", sources: ["sv:Hälsingland"] },
    { id: "oq40-sve-03", category: "sverige-norden", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket landskap ligger Ronneby, Karlshamn och Karlskrona?", answer: "Blekinge", explanation: "Det är Sveriges näst minsta landskap.", more: "Blekinge kallas ibland Sveriges trädgård.", sources: ["sv:Blekinge"] },

    // ---------- Historia ----------
    { id: "oq40-hist-01", category: "historia", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad hette den mytiska ö som Platon berättade om, och som enligt myten sjönk i havet?", answer: "Atlantis", explanation: "Platon skrev om den i dialogerna Timaios och Kritias.", more: "Berättelsen har inspirerat otaliga böcker och filmer.", sources: ["sv:Atlantis"] },
    { id: "oq40-hist-02", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vilken sydamerikansk frihetshjälte, född i Venezuela, har gett namn åt ett land?", answer: "Simón Bolívar", accept: ["Bolívar", "Bolivar"], explanation: "Bolivia är uppkallat efter honom.", more: "Han kallas El Libertador, befriaren.", sources: ["sv:Simón_Bolívar"] },
    { id: "oq40-geo-01", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter Venezuelas huvudstad?", answer: "Caracas", explanation: "Staden ligger i en dal nära Karibiska havet.", more: "Den är Venezuelas största stad.", sources: ["sv:Caracas"] },

    // ---------- Musikaler och film ----------
    { id: "oq40-mus-01", category: "musik", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken musikal, som heter samma sak som en amerikansk stad, innehåller låten \"All That Jazz\"?", answer: "Chicago", explanation: "Musikalen hade premiär 1975.", more: "Filmversionen vann Oscar för bästa film 2003.", sources: ["sv:Chicago_(musikal)"] },
    { id: "oq40-pers-04", category: "kanda-personer", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad heter Ingmar Bergmans självbiografi från 1987, uppkallad efter en gammal projektionsapparat? Två ord på latin.", answer: "Laterna magica", explanation: "Han fick en laterna magica som barn.", more: "Apparaten projicerar bilder från målade glasplattor.", sources: ["sv:Laterna_magica_(bok)"] },

    // ---------- Fobier ----------
    { id: "oq40-vet-01", category: "vetenskap-natur", difficulty: "medel", tags: ["onsdagsquizen"], question: "Fobier behandlas ofta med KBT. Vad står KBT för?", answer: "Kognitiv beteendeterapi", explanation: "Man arbetar med tankar och beteenden.", more: "Vid fobier används ofta exponering, där man gradvis möter det man är rädd för.", sources: ["sv:Kognitiv_beteendeterapi"] },

    // ---------- Byggnader ----------
    { id: "oq40-geo-02", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter det världsberömda mausoleet i Agra i Indien, som en mogulhärskare lät bygga åt sin hustru på 1600-talet?", answer: "Taj Mahal", explanation: "Bygget började 1632.", more: "Det är byggt av vit marmor.", sources: ["sv:Taj_Mahal"] },
    { id: "oq40-hist-03", category: "historia", difficulty: "svår", tags: ["liknande"], question: "Vilken mogulhärskare lät bygga mausoleet i Agra åt sin hustru Mumtaz Mahal?", answer: "Shah Jahan", explanation: "Hon dog i barnsäng 1631.", more: "Han begravdes själv bredvid henne.", sources: ["sv:Shah_Jahan"] },
    { id: "oq40-geo-03", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter klaffbron över Themsen, byggd i slutet av 1800-talet nära Tower of London?", answer: "Tower Bridge", explanation: "Den blev klar 1894.", more: "Den förväxlas ofta med London Bridge.", sources: ["sv:Tower_Bridge"] },

    // ---------- Blandat ----------
    { id: "oq40-pers-05", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket yrke hade Alice Timander, känd som premiärlejon och skådespelare?", answer: "Tandläkare", explanation: "Hon arbetade som tandläkare i Stockholm.", more: "Hon blev 92 år och var känd för sina extravaganta kläder.", sources: ["sv:Alice_Timander"] },
    { id: "oq40-pers-06", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter Ulf Lundells långa serie av dagboksböcker?", answer: "Vardagar", explanation: "Böckerna skildrar hans vardag år för år.", more: "Han debuterade som författare med romanen \"Jack\" 1976.", sources: ["sv:Ulf_Lundell"] },
    { id: "oq40-bland-01", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter syskon på engelska med ett ord?", answer: "Sibling", accept: ["Siblings"], explanation: "Ordet är könsneutralt.", more: "Brothers and sisters räknas inte.", sources: ["en:Sibling"] },

    // ---------- Musik ----------
    { id: "oq40-mus-02", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken grupp slog igenom 1996 med låten \"Kräm (så nära får ingen gå)\"?", answer: "Kent", explanation: "Låten finns på albumet \"Verkligen\".", more: "Bandet kom från Eskilstuna.", sources: ["sv:Kent_(musikgrupp)"] },
    { id: "oq40-mus-03", category: "musik", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken låt från 1984 av Bryan Adams handlar om sommaren då han fick sin första riktiga gitarr?", answer: "Summer of '69", accept: ["Summer of 69"], explanation: "Den finns på albumet \"Reckless\".", more: "Adams var själv bara nio år 1969.", sources: ["sv:Summer_of_'69"] },
    { id: "oq40-mus-04", category: "musik", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Hur många strängar har en fiol?", answer: "4", accept: ["Fyra"], explanation: "De stäms i G, D, A och E.", more: "En viola har också fyra strängar, men stämda en kvint lägre.", sources: ["sv:Fiol"] },
    { id: "oq40-mus-05", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken amerikansk tjejgrupp hade en stor hit 1982 med \"I'm So Excited\"?", answer: "Pointer Sisters", accept: ["The Pointer Sisters"], explanation: "Gruppen bestod av systrar från Kalifornien.", more: "De hade också hits med \"Jump (For My Love)\" och \"Automatic\".", sources: ["sv:The_Pointer_Sisters"] },
  ],
});
