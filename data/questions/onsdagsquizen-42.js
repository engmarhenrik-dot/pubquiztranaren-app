/*
 * Onsdagsquizen, avsnitt 42 (Knutbar, 2024-10-02): frågor från avsnittet (tagg "onsdagsquizen")
 * och liknande frågor på samma teman (tagg "liknande").
 * Utelämnade: tjog och gross, Tirana, Bratislava, "Tusen och en natt", Kents "Hagnesta Hill", heliga Birgitta,
 * Olivia Newton-John, Sixtinska kapellet och Cristiano Ronaldo (fanns redan eller avslöjas av andra frågor).
 * Nutidsfrågorna från hösten 2024 är omgjorda till dåtid.
 */
PQ.bank.addSet({
  verified: "2026-11-05",
  origin: "onsdagsquizen",
  questions: [
    { id: "oq42-bland-01", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Hur många ägg är ett dussin: 12, 24 eller 48?", answer: "12", accept: ["Tolv"], explanation: "Ett dussin är tolv stycken.", more: "Tolv dussin blir ett gross.", sources: ["sv:Dussin"] },

    // ---------- Norrländska städer ----------
    { id: "oq42-sve-01", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken norrländsk stad kommer David Lindgren, John Houdi, Brolle och Hardy Nilsson ifrån?", answer: "Skellefteå", explanation: "Hardy Nilsson är ishockeytränare och Brolle sångare.", more: "Skellefteå AIK är stadens kända hockeylag.", sources: ["sv:Skellefteå"] },
    { id: "oq42-sve-02", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken norrländsk stad kommer Gina Dirawi, Ellinor Persson, Svante Grundberg och Nils Knaust ifrån?", answer: "Sundsvall", explanation: "Staden ligger i Medelpad.", more: "Nils Knaust var länge målvakt i GIF Sundsvall.", sources: ["sv:Sundsvall"] },
    { id: "oq42-sve-03", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken norrländsk stad kommer Nicklas Bäckström, Rock-Olga, Anita Lindblom och Rickard Olsson ifrån?", answer: "Gävle", explanation: "Gävle räknas som Norrlands sydligaste stad.", more: "Nicklas Bäckström spelade länge i NHL för Washington Capitals.", sources: ["sv:Gävle"] },
    { id: "oq42-sve-04", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket landskap ligger Arboga, Fagersta och Köping?", answer: "Västmanland", explanation: "Residensstaden är Västerås.", more: "Arboga är känt för medeltida riksmöten.", sources: ["sv:Västmanland"] },
    { id: "oq42-sve-05", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket landskap ligger skidanläggningarna Branäs och Hovfjället och staden Filipstad?", answer: "Värmland", explanation: "Branäs ligger i Klarälvdalen.", more: "Filipstad är John Ericssons födelsebygd.", sources: ["sv:Värmland"] },

    // ---------- Utland ----------
    { id: "oq42-geo-01", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket land är Bukarest huvudstad?", answer: "Rumänien", explanation: "Staden ligger på slätten norr om Donau.", more: "Parlamentspalatset där är en av världens största byggnader.", sources: ["sv:Bukarest"] },
    { id: "oq42-bland-02", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Från vilket land kommer designföretaget Marimekko?", answer: "Finland", explanation: "Det grundades 1951.", more: "Det är känt för det stora blommönstret Unikko.", sources: ["sv:Marimekko"] },

    // ---------- Händelser 2024 ----------
    { id: "oq42-hist-01", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad höll Donald Trump på med när en beväpnad man upptäcktes vid ett andra mordförsök mot honom i Florida i september 2024?", answer: "Spelade golf", accept: ["Golf"], explanation: "Secret Service sköt mot mannen i buskarna vid banan.", more: "Det första mordförsöket skedde vid ett valmöte i juli.", sources: ["en:Attempted_assassination_of_Donald_Trump_in_Florida"] },
    { id: "oq42-sve-06", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket parti hamnade i blåsväder 2024 när det granskades hur telemarketingbolaget Kombispel sålde partiets lotter?", answer: "Socialdemokraterna", accept: ["S"], explanation: "Granskningen visade aggressiva försäljningsmetoder mot äldre.", more: "Kombispel sålde lotter för partiets räkning.", sources: ["sv:Kombispel"] },
    { id: "oq42-pop-01", category: "popkultur", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter dejtingprogrammet där deltagarna väljer partner efter att först ha sett dem nakna?", answer: "Naked Attraction", explanation: "Formatet kommer från Storbritannien.", more: "Den svenska versionen sänds på Kanal 5.", sources: ["en:Naked_Attraction"] },
    { id: "oq42-pers-01", category: "kanda-personer", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken svensk artist red in på en svart häst och gifte sig 2024 med Christian Bauer under ett tredagarsbröllop i Marbella?", answer: "Pernilla Wahlgren", accept: ["Wahlgren"], explanation: "Christian Bauer är dansk skådespelare.", more: "Hon är dotter till Hans Wahlgren och Christina Schollin.", sources: ["sv:Pernilla_Wahlgren"] },
    { id: "oq42-sport-01", category: "sport", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken ljusblå engelsk fotbollsklubb anklagades för 115 brott mot ligans ekonomiska regler?", answer: "Manchester City", accept: ["City"], explanation: "Utredningen kallades århundradets inom engelsk fotboll.", more: "Klubben ägs av ett bolag från Abu Dhabi.", sources: ["sv:Manchester_City_FC"] },

    // ---------- Musik ----------
    { id: "oq42-mus-01", category: "musik", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad hette den mytomspunna inspelningsstudion på Kungsholmen där Britney Spears spelade in med Max Martin 1999?", answer: "Cheiron", accept: ["Cheiron Studios"], explanation: "Studion grundades av Denniz Pop.", more: "Där gjordes också hits åt Backstreet Boys och Ace of Base.", sources: ["sv:Cheiron_Studios"] },

    // ---------- Norsk tv ----------
    { id: "oq42-film-01", category: "film-tv", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter den norska tv-serien om finansmän i Oslo med droger, våld och extrema fester, där Simon J. Berger spelar en av rollerna?", answer: "Exit", explanation: "Serien bygger på intervjuer med verkliga finansmän.", more: "Den hade premiär 2019.", sources: ["en:Exit_(Norwegian_TV_series)"] },
    { id: "oq42-film-02", category: "film-tv", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Handlar den norska tv-serien \"Skam\" om lågstadieelever, gymnasieelever eller universitetsstudenter?", answer: "Gymnasieelever", explanation: "Den följer elever på Hartvig Nissens skole i Oslo.", more: "Varje säsong har en ny huvudperson.", sources: ["sv:Skam_(TV-serie)"] },
    { id: "oq42-film-03", category: "film-tv", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad hette den norska humorserien om de äventyrslystna bröderna Gaus, Roms och Brumund med var sin hatt?", answer: "Brødrene Dal", accept: ["Bröderna Dal", "Brødrene Dahl"], explanation: "Bröderna spelades av Trond Kirkvaag, Knut Lystad och Lars Mjøen.", more: "Serierna gick i NRK från 1970-talet och framåt.", sources: ["en:Brødrene_Dal"] },

    // ---------- 1300-talet ----------
    { id: "oq42-hist-02", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken ö invaderade den danske kungen Valdemar Atterdag 1361, där han enligt sägnen brandskattade invånarna?", answer: "Gotland", explanation: "Visby skulle ha fått fylla stora kar med silver och guld.", more: "Händelsen är känd från många målningar och berättelser.", sources: ["sv:Valdemar_Atterdags_brandskattning_av_Visby"] },
    { id: "oq42-hist-03", category: "historia", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad hette förbundet mellan Sverige, Norge och Danmark som bildades 1397 och varade till 1523?", answer: "Kalmarunionen", explanation: "Den bildades i Kalmar.", more: "Den upplöstes när Gustav Vasa blev kung.", sources: ["sv:Kalmarunionen"] },
    { id: "oq42-hist-04", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vilken drottning låg bakom unionen mellan de tre nordiska rikena 1397?", answer: "Margareta", accept: ["Drottning Margareta", "Margrete"], explanation: "Hon var dansk drottning och styrde alla tre rikena.", more: "Hennes systerdotterson Erik av Pommern kröntes till unionskung.", sources: ["sv:Margareta_(1353–1412)"] },

    // ---------- Film ----------
    { id: "oq42-film-04", category: "film-tv", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken kampsportsstjärna, som blev bara 32 år, slog igenom med \"Enter the Dragon\" och vars son Brandon dödades vid en filminspelning 1993?", answer: "Bruce Lee", explanation: "Han dog 1973.", more: "Han grundade kampsporten jeet kune do.", sources: ["sv:Bruce_Lee"] },
    { id: "oq42-film-05", category: "film-tv", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter boxaren Balboas flickvän, vars namn han ropar efter titelmatchen i filmen från 1976?", answer: "Adrian", explanation: "Hon spelas av Talia Shire.", more: "Talia Shire är syster till Francis Ford Coppola.", sources: ["sv:Rocky"] },

    // ---------- Stockholm ----------
    { id: "oq42-sve-07", category: "sverige-norden", difficulty: "medel", tags: ["onsdagsquizen"], question: "Utanför vilken känd byggnad i Stockholm står statyn av skådespelerskan Margaretha Krook?", answer: "Dramaten", accept: ["Kungliga Dramatiska teatern"], explanation: "Hon var en av Dramatens stora skådespelare.", more: "Statyn sägs vara ständigt uppvärmd.", sources: ["sv:Margaretha_Krook"] },
    { id: "oq42-sve-08", category: "sverige-norden", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilken stadsdel i Stockholm ligger Västerlånggatan?", answer: "Gamla stan", explanation: "Det är en av Gamla stans huvudgator.", more: "Den följer den gamla stadsmurens sträckning.", sources: ["sv:Västerlånggatan"] },
    { id: "oq42-hist-05", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket år skedde Norrmalmstorgsdramat i Stockholm, samma år som kung Gustaf VI Adolf dog?", answer: "1973", explanation: "Det var ett bankrån med gisslan i augusti.", more: "Carl XVI Gustaf blev kung samma höst.", sources: ["sv:Norrmalmstorgsdramat"] },

    // ---------- Sport och ekonomi ----------
    { id: "oq42-sport-02", category: "sport", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken sport handlar det om: Valsarna, Masarna och Rospiggarna?", answer: "Speedway", explanation: "Det är svenska speedwaylag.", more: "Masarna kommer från Avesta och Rospiggarna från Hallstavik.", sources: ["sv:Speedway"] },
    { id: "oq42-pers-02", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vem är Sveriges rikaste kvinna, med ett ärvt familjeföretag där bland annat Axfood ingår?", answer: "Antonia Ax:son Johnson", accept: ["Antonia Axson Johnson", "Antonia Johnson"], explanation: "Familjeföretaget heter Axel Johnson.", more: "Axfood äger bland annat Willys och Hemköp.", sources: ["sv:Antonia_Ax:son_Johnson"] },
  ],
});
