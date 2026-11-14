/*
 * Onsdagsquizen, avsnitt 35 (Knutbar, 2024-06-05): frågor från avsnittet (tagg "onsdagsquizen")
 * och liknande frågor på samma teman (tagg "liknande").
 * Utelämnade: Kenny Bräck, San José, Kingston, Laleh, Veronica Maggio, "Robin Hood – Prince of Thieves", Björn Borgs
 * Wimbledontitlar, schackbrädets rutor, Algeriet, Idi Amin, Thatcher, Västtyska ambassaden, Ulf Lundells "Jack" och
 * PewDiePie och Harrisburg (fanns redan eller avslöjas av andra frågor) samt antalet kvinnliga partiledare i Centerpartiet (har ändrats).
 * Haiti ligger i Karibien, inte i Centralamerika som det sades i quizet.
 */
PQ.bank.addSet({
  verified: "2026-11-05",
  origin: "onsdagsquizen",
  questions: [
    // ---------- Förkortningar ----------
    { id: "oq35-vet-01", category: "vetenskap-natur", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad står B för i IBS, en vanlig diagnos för problem med magen?", answer: "Bowel", explanation: "IBS står för irritable bowel syndrome.", more: "På svenska kallas det ofta känslig tarm.", sources: ["sv:Irritabel_tarm"] },
    { id: "oq35-bland-01", category: "blandat", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad står D för i GDPR?", answer: "Data", explanation: "GDPR står för General Data Protection Regulation.", more: "EU:s dataskyddsförordning började gälla i maj 2018.", sources: ["sv:Dataskyddsförordningen"] },
    { id: "oq35-bland-02", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad står S för när det står OSA i en inbjudan?", answer: "Svar", explanation: "OSA betyder \"om svar anhålles\".", more: "Den franska motsvarigheten är RSVP.", sources: ["sv:OSA"] },
    { id: "oq35-bland-03", category: "blandat", difficulty: "medel", tags: ["liknande"], question: "Vilka franska ord står förkortningen RSVP för på en inbjudan?", answer: "Répondez s'il vous plaît", accept: ["Repondez s'il vous plait"], explanation: "Det betyder \"svara, tack\".", more: "Förkortningen används också på engelska inbjudningar.", sources: ["en:RSVP"] },

    // ---------- Nutid 2024 ----------
    { id: "oq35-sport-01", category: "sport", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken position spelade Hedvig Lindahl i Sveriges damlandslag i fotboll?", answer: "Målvakt", explanation: "Hon spelade över 180 landskamper.", more: "Hon tog OS-silver 2016 och 2021.", sources: ["sv:Hedvig_Lindahl"] },
    { id: "oq35-hist-01", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Varför kallade Israel 2024 hem sina ambassadörer från Norge och Irland?", answer: "De erkände Palestina", accept: ["Länderna erkände Palestina", "Erkännande av Palestina"], explanation: "Spanien erkände Palestina samtidigt.", more: "Erkännandena trädde i kraft i maj 2024.", sources: ["en:International_recognition_of_Palestine"] },
    { id: "oq35-hist-02", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vilket land blev 2014 det första i Västeuropa inom EU att erkänna Palestina som stat?", answer: "Sverige", explanation: "Beslutet togs av regeringen Löfven.", more: "Israel kallade då hem sin ambassadör från Stockholm för en tid.", sources: ["en:International_recognition_of_Palestine"] },
    { id: "oq35-pers-01", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vem utsågs av tidningen Café till Sveriges bäst klädda man 2024?", answer: "Benjamin Ingrosso", accept: ["Ingrosso"], explanation: "Året innan vann Omar Rudberg.", more: "Ingrosso representerade Sverige i Eurovision 2018.", sources: ["sv:Benjamin_Ingrosso"] },
    { id: "oq35-hist-03", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket land röstades en omstridd så kallad agentlag igenom 2024, trots presidentens veto och stora protester?", answer: "Georgien", explanation: "Lagen liknar en rysk lag om utländska agenter.", more: "Kritiker menade att den hotar landets EU-ansökan.", sources: ["en:Georgian_foreign_agents_law"] },

    // ---------- Rymden ----------
    { id: "oq35-vet-02", category: "vetenskap-natur", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad kallas en rysk astronaut?", answer: "Kosmonaut", explanation: "Jurij Gagarin var den förste kosmonauten.", more: "Ordet kommer från grekiskans kosmos.", sources: ["sv:Kosmonaut"] },
    { id: "oq35-vet-03", category: "vetenskap-natur", difficulty: "medel", tags: ["liknande"], question: "Vad kallas en kinesisk astronaut?", answer: "Taikonaut", explanation: "Ordet kommer från kinesiskans taikong, rymd.", more: "Kina skickade sin första taikonaut i rymden 2003.", sources: ["sv:Taikonaut"] },

    // ---------- Geografi ----------
    { id: "oq35-geo-01", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket land i Karibien är Port-au-Prince huvudstad?", answer: "Haiti", explanation: "Haiti delar ön Hispaniola med ett grannland.", more: "Staden drabbades hårt av en jordbävning 2010.", sources: ["sv:Port-au-Prince"] },

    // ---------- USA ----------
    { id: "oq35-pers-02", category: "kanda-personer", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vems företag äger majoriteten av den amerikanska sociala medieappen Truth Social?", answer: "Donald Trump", accept: ["Trump"], explanation: "Appen startades 2022.", more: "Den kom till efter att han stängts av från Twitter och Facebook.", sources: ["sv:Truth_Social"] },
    { id: "oq35-pop-01", category: "popkultur", difficulty: "lätt", tags: ["liknande"], question: "Vad heter Twitter sedan Elon Musk bytte namn på tjänsten 2023?", answer: "X", explanation: "Musk köpte bolaget 2022.", more: "Inläggen kallades tidigare tweets.", sources: ["sv:X_(socialt_nätverk)"] },

    // ---------- Musik ----------
    { id: "oq35-mus-01", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken svensk artist har gjort låtarna \"Hanna\", \"Långa nätter\" och \"Som jag hade dig förut\"?", answer: "Melissa Horn", accept: ["Horn"], explanation: "Hon slog igenom 2008.", more: "Hon har vunnit flera Grammisar.", sources: ["sv:Melissa_Horn"] },
    { id: "oq35-mus-02", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad är titeln på Perssons Packs låt om att bli tagen härifrån, ett visst antal dagar?", answer: "Tusen dagar härifrån", accept: ["Tusen dagar"], explanation: "Låten kom 1991 och sjungs av Jakob Hellman.", more: "Bandet leddes av Per Persson, som skrev låten.", sources: ["sv:Perssons_Pack"] },
    { id: "oq35-mus-03", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken personlig tragedi handlar Eric Claptons \"Tears in Heaven\" från 1992 om?", answer: "Hans sons död", accept: ["Sonen dog", "Hans son", "Sonens död"], explanation: "Hans fyraårige son föll ut genom ett fönster i New York 1991.", more: "Låten vann tre Grammys.", sources: ["sv:Tears_in_Heaven"] },
    { id: "oq35-mus-04", category: "musik", difficulty: "svår", tags: ["liknande"], question: "Vad hette Eric Claptons son, som \"Tears in Heaven\" handlar om?", answer: "Conor", explanation: "Han dog 1991, fyra år gammal.", more: "Låten skrevs till filmen \"Rush\".", sources: ["sv:Tears_in_Heaven"] },

    // ---------- Film ----------
    { id: "oq35-film-01", category: "film-tv", difficulty: "medel", tags: ["onsdagsquizen"], question: "Geena Davis spelar en av huvudrollerna i \"Thelma & Louise\". Vem spelar den andra?", answer: "Susan Sarandon", accept: ["Sarandon"], explanation: "Hon spelar Louise.", more: "Båda Oscarnominerades för sina roller.", sources: ["sv:Thelma_&_Louise"] },
    { id: "oq35-film-02", category: "film-tv", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilken stad utspelar sig filmen \"Falling Down\" från 1993?", answer: "Los Angeles", explanation: "Huvudpersonen tar sig till fots genom staden.", more: "Han fastnar i en bilkö och lämnar bilen.", sources: ["sv:Falling_Down"] },

    // ---------- Samhälle och ord ----------
    { id: "oq35-sve-01", category: "sverige-norden", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad brukar kallas den tredje statsmakten i Sverige, efter riksdag och regering?", answer: "Medierna", accept: ["Media", "Massmedia", "Pressen", "Journalistiken"], explanation: "Medierna granskar makten.", more: "I andra länder kallas medierna ofta den fjärde statsmakten.", sources: ["sv:Tredje_statsmakten"] },
    { id: "oq35-bland-04", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad är roten ur 49?", answer: "7", accept: ["Sju"], explanation: "7 × 7 = 49.", more: "49 är alltså ett kvadrattal.", sources: ["sv:Kvadratrot"] },
    { id: "oq35-bland-05", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Hur översätter du engelska \"superficial\" till svenska med ett ord?", answer: "Ytlig", accept: ["Ytligt"], explanation: "Ordet kommer från latinets superficies, \"yta\".", more: "Det kan beskriva både sår och personer.", sources: ["en:Wiktionary"] },
    { id: "oq35-bland-06", category: "blandat", difficulty: "medel", tags: ["liknande"], question: "Hur översätter du engelska \"ambiguous\" till svenska med ett ord?", answer: "Tvetydig", accept: ["Tvetydigt", "Mångtydig"], explanation: "Något som kan tolkas på flera sätt.", more: "Det svenska ordet ambivalent betyder i stället kluven.", sources: ["en:Wiktionary"] },
    { id: "oq35-bland-07", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad är plogen, delfinen, trädet och solhälsningen exempel på?", answer: "Yogapositioner", accept: ["Yoga", "Yogaställningar"], explanation: "Yogapositioner kallas asanas.", more: "Solhälsningen är en serie positioner i följd.", sources: ["sv:Yoga"] },

    // ---------- Historia ----------
    { id: "oq35-hist-05", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vad heter det amerikanska kärnkraftverk där en härdsmälta skedde 1979?", answer: "Three Mile Island", explanation: "Det ligger på en ö i floden Susquehanna.", more: "Det är den allvarligaste kärnkraftsolyckan i USA:s historia.", sources: ["sv:Three_Mile_Island-olyckan"] },

    // ---------- Influencers ----------
    { id: "oq35-pop-02", category: "popkultur", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter i förnamn youtubern Lindgren som gav ut boken \"Ibland mår jag inte så bra\"?", answer: "Therese", accept: ["Therese Lindgren"], explanation: "Boken handlar om psykisk ohälsa.", more: "Hon var en av Sveriges största youtubers på 2010-talet.", sources: ["sv:Therese_Lindgren"] },
    { id: "oq35-pop-03", category: "popkultur", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken svensk influencer fick kritik efter att ha filmat en person som låg utslagen utanför hennes dörr?", answer: "Margaux Dietz", accept: ["Margaux"], explanation: "Hon lade ut klippet i sina kanaler.", more: "Hon har också varit programledare på tv.", sources: ["sv:Margaux_Dietz"] },
  ],
});
