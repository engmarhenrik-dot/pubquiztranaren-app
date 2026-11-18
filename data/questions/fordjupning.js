/* Fördjupning – fler medelsvåra och svåra frågor i alla kategorier (kategori anges per fråga). */
PQ.bank.addSet({
  verified: "2026-10-30",
  questions: [
    // Musik
    { id: "fdj-mus-01", category: "musik", difficulty: "svår", question: "Vilken svensk artist kom femma i Eurovision 2016 i Stockholm med \"If I Were Sorry\"?", answer: "Frans", accept: ["Frans Jeppsson Wall"], explanation: "Han var 17 år och hade som barn haft en hit med \"Who's da Man\".", sources: ["sv:Frans_Jeppsson_Wall", "sv:If_I_Were_Sorry"] },
    { id: "fdj-mus-02", category: "musik", difficulty: "medel", question: "Med vilken låt vann Carola Eurovision 1991?", answer: "Fångad av en stormvind", explanation: "Tävlingen i Rom avgjordes först efter att Sverige och Frankrike fått lika många poäng.", sources: ["sv:Fångad_av_en_stormvind"] },
    { id: "fdj-mus-03", category: "musik", difficulty: "svår", question: "Vad hette ABBA:s sista studioalbum innan gruppen tog paus, släppt 1981?", answer: "The Visitors", explanation: "Nästa album, \"Voyage\", kom först 2021.", sources: ["sv:The_Visitors_(album)"] },
    { id: "fdj-mus-04", category: "musik", difficulty: "medel", question: "Vad hette ABBA:s comebackalbum från 2021?", answer: "Voyage", explanation: "Det följdes av den digitala konsertshowen ABBA Voyage i London.", sources: ["sv:Voyage_(album)"] },
    { id: "fdj-mus-05", category: "musik", difficulty: "svår", question: "Vad hette Queens sångare Freddie Mercury från födseln?", answer: "Farrokh Bulsara", explanation: "Han föddes 1946 på Zanzibar.", sources: ["en:Freddie_Mercury"] },
    { id: "fdj-mus-06", category: "musik", difficulty: "medel", question: "Vilket band släppte albumet \"Nevermind\" 1991?", answer: "Nirvana", explanation: "Albumet innehåller \"Smells Like Teen Spirit\".", sources: ["en:Nevermind"] },
    { id: "fdj-mus-07", category: "musik", difficulty: "svår", question: "I vilken tysk stad bildades elektroniska pionjärerna Kraftwerk?", answer: "Düsseldorf", explanation: "Bandet bildades 1970.", sources: ["en:Kraftwerk"] },
    // Film och TV
    { id: "fdj-film-01", category: "film-tv", difficulty: "svår", question: "Vilken film av Ingmar Bergman från 1982 vann fyra Oscars?", answer: "Fanny och Alexander", explanation: "Bland annat för bästa utländska film.", sources: ["sv:Fanny_och_Alexander"] },
    { id: "fdj-film-02", category: "film-tv", difficulty: "svår", question: "Vilken skådespelare spelade Döden i \"Det sjunde inseglet\"?", answer: "Bengt Ekerot", explanation: "Bilden av Döden i svart kåpa har blivit en av filmhistoriens mest kända.", sources: ["sv:Bengt_Ekerot"] },
    // Geografi
    { id: "fdj-geo-01", category: "geografi", difficulty: "svår", question: "Vad heter Kazakstans huvudstad?", answer: "Astana", explanation: "Staden hette Nur-Sultan 2019–2022. Almaty var huvudstad fram till 1997.", sources: ["sv:Astana"] },
    { id: "fdj-geo-02", category: "geografi", difficulty: "svår", question: "Vilket land är helt omslutet av Sydafrika?", answer: "Lesotho", explanation: "Det är ett av tre länder i världen som helt omges av ett enda annat land, tillsammans med San Marino och Vatikanstaten.", sources: ["sv:Lesotho"] },
    { id: "fdj-geo-03", category: "geografi", difficulty: "medel", question: "Vilket land har flest invånare i Afrika?", answer: "Nigeria", explanation: "Nigeria har över 200 miljoner invånare.", sources: ["sv:Nigeria"] },
    { id: "fdj-geo-04", category: "geografi", difficulty: "medel", question: "Vilken är världens största ö, om man inte räknar Australien?", answer: "Grönland", explanation: "Grönland är ett självstyrande område inom Danmarks rike.", sources: ["sv:Grönland"] },
    // Historia
    { id: "fdj-hist-01", category: "historia", difficulty: "svår", question: "Vilket år slöts westfaliska freden som avslutade trettioåriga kriget?", answer: "1648", explanation: "Sverige fick bland annat Vorpommern, Wismar och Bremen-Verden.", sources: ["sv:Westfaliska_freden"] },
    { id: "fdj-hist-02", category: "historia", difficulty: "medel", question: "Vilken svensk kung sköts på en maskeradbal på Operan 1792?", answer: "Gustav III", explanation: "Mördaren hette Jacob Johan Anckarström.", sources: ["sv:Mordet_på_Gustav_III"] },
    { id: "fdj-hist-03", category: "historia", difficulty: "svår", question: "Vad kallas perioden 1719–1772 i svensk historia, då riksdagen hade makten?", answer: "Frihetstiden", explanation: "Den avslutades med Gustav III:s statskupp 1772.", sources: ["sv:Frihetstiden"] },
    { id: "fdj-hist-04", category: "historia", difficulty: "svår", question: "Vilket år ägde slaget vid Hastings rum?", answer: "1066", explanation: "Vilhelm Erövraren besegrade den engelske kungen Harald Godwinson.", sources: ["sv:Slaget_vid_Hastings"] },
    { id: "fdj-hist-05", category: "historia", difficulty: "medel", question: "Vilket år inträffade Kubakrisen?", answer: "1962", explanation: "Krisen gällde sovjetiska kärnvapenrobotar på Kuba.", sources: ["sv:Kubakrisen"] },
    { id: "fdj-hist-06", category: "historia", difficulty: "medel", question: "Vilket år blev Finland självständigt?", answer: "1917", explanation: "Självständighetsdagen firas den 6 december.", sources: ["sv:Finlands_självständighetsförklaring"] },
    { id: "fdj-hist-07", category: "historia", difficulty: "medel", question: "Vilken fransk kung kallades \"Solkungen\"?", answer: "Ludvig XIV", explanation: "Han regerade i 72 år och lät bygga slottet i Versailles.", sources: ["sv:Ludvig_XIV"] },
    // Sport
    { id: "fdj-sport-01", category: "sport", difficulty: "svår", question: "Vilket år vann Sverige sitt första VM-guld i ishockey?", answer: "1953", explanation: "Turneringen spelades i Schweiz.", sources: ["sv:Världsmästerskapet_i_ishockey_1953"] },
    { id: "fdj-sport-02", category: "sport", difficulty: "medel", question: "Vilket land arrangerade och vann det första fotbolls-VM 1930?", answer: "Uruguay", explanation: "Uruguay slog Argentina med 4–2 i finalen i Montevideo.", sources: ["sv:Världsmästerskapet_i_fotboll_1930"] },
    // Mat och dryck
    { id: "fdj-mat-01", category: "mat-dryck", difficulty: "svår", question: "Vilken fransk blåmögelost görs av fårmjölk och lagras i grottor?", answer: "Roquefort", explanation: "Osten lagras i grottor vid Roquefort-sur-Soulzon.", sources: ["sv:Roquefort"] },
    { id: "fdj-mat-02", category: "mat-dryck", difficulty: "svår", question: "Från vilket land kommer bakverket pastel de nata?", answer: "Portugal", explanation: "Den krispiga smördegsformen med äggkräm kommer från Lissabontrakten.", sources: ["en:Pastel_de_nata"] },
    { id: "fdj-mat-03", category: "mat-dryck", difficulty: "medel", question: "Vilken krydda utvinns ur pistillerna från en krokusart?", answer: "Saffran", explanation: "Saffran är världens dyraste krydda per vikt.", sources: ["sv:Saffran"] },
    { id: "fdj-mat-04", category: "mat-dryck", difficulty: "medel", question: "Vilken spritdryck smaksätts framför allt med enbär?", answer: "Gin", explanation: "Namnet kommer från nederländska genever.", sources: ["sv:Gin"] },
    { id: "fdj-mat-05", category: "mat-dryck", difficulty: "medel", question: "Vad heter den italienska förrätten med rått, tunt skivat nötkött?", answer: "Carpaccio", explanation: "Rätten skapades på Harry's Bar i Venedig.", sources: ["sv:Carpaccio"] },
    { id: "fdj-mat-06", category: "mat-dryck", difficulty: "svår", question: "Vilket bär används i den finska likören Lakka?", answer: "Hjortron", explanation: "Hjortron heter lakka eller suomuurain på finska.", sources: ["en:Lakka_(liqueur)"] },
    // Kända personer
    { id: "fdj-pers-01", category: "kanda-personer", difficulty: "svår", question: "Vilken svensk kemist införde de moderna kemiska beteckningarna som H, O och Fe?", answer: "Jöns Jacob Berzelius", accept: ["Berzelius"], explanation: "Han upptäckte också flera grundämnen, bland annat selen och cerium.", sources: ["sv:Jöns_Jacob_Berzelius"] },
    { id: "fdj-pers-02", category: "kanda-personer", difficulty: "svår", question: "Vilken svensk ingenjör uppfann det självinställande kullagret och grundade SKF 1907?", answer: "Sven Wingquist", explanation: "SKF står för Svenska Kullagerfabriken.", sources: ["sv:Sven_Wingquist"] },
    { id: "fdj-pers-03", category: "kanda-personer", difficulty: "svår", question: "Vem skrev romanen \"Doktor Glas\" (1905)?", answer: "Hjalmar Söderberg", explanation: "Romanen utspelar sig i Stockholm och skrivs i dagboksform.", sources: ["sv:Doktor_Glas"] },
    { id: "fdj-pers-04", category: "kanda-personer", difficulty: "svår", question: "Vilken svensk kemist fick Nobelpriset i kemi 1903 för teorin om elektrolytisk dissociation?", answer: "Svante Arrhenius", explanation: "Han var också tidig med att beskriva växthuseffekten.", sources: ["sv:Svante_Arrhenius"] },
    // Sverige och Norden
    { id: "fdj-sve-01", category: "sverige-norden", difficulty: "svår", question: "I vilket landskap ligger världsarvet Höga kusten?", answer: "Ångermanland", explanation: "Landhöjningen där är bland de största i världen.", sources: ["sv:Höga_kusten"] },
    { id: "fdj-sve-02", category: "sverige-norden", difficulty: "svår", question: "Vilken är Sveriges största nationalpark till ytan?", answer: "Padjelanta", explanation: "Nationalparken i Lappland är cirka 1 984 km².", sources: ["sv:Padjelanta_nationalpark"] },
    { id: "fdj-sve-03", category: "sverige-norden", difficulty: "svår", question: "Vilket år antogs den regeringsform som i huvudsak gäller i Sverige i dag?", answer: "1974", explanation: "Den trädde i kraft den 1 januari 1975.", sources: ["sv:Regeringsformen"] },
    // Vetenskap och natur
    { id: "fdj-vet-01", category: "vetenskap-natur", difficulty: "svår", question: "Hur många grundämnen har fått namn efter Ytterby gruva på Resarö?", answer: "Fyra", accept: ["4"], explanation: "Yttrium, ytterbium, terbium och erbium.", sources: ["sv:Ytterby_gruva"] },
    { id: "fdj-vet-02", category: "vetenskap-natur", difficulty: "medel", question: "Vilket grundämne har atomnummer 1?", answer: "Väte", explanation: "Väte är universums vanligaste grundämne.", sources: ["sv:Väte"] },
    { id: "fdj-vet-03", category: "vetenskap-natur", difficulty: "medel", question: "Vad heter enheten för elektriskt motstånd?", answer: "Ohm", explanation: "Uppkallad efter den tyske fysikern Georg Simon Ohm.", sources: ["sv:Ohm"] },
    // Populärkultur
    { id: "fdj-pop-01", category: "popkultur", difficulty: "svår", question: "Vilket år släpptes de första Pokémon-spelen i Japan?", answer: "1996", explanation: "Pokémon Red och Green släpptes till Game Boy.", sources: ["en:Pokémon_Red_and_Blue"] },
    { id: "fdj-pop-02", category: "popkultur", difficulty: "svår", question: "Vilken svensk spelstudio skapade överlevnadsspelet \"Valheim\" (2021)?", answer: "Iron Gate", accept: ["Iron Gate Studio"], explanation: "Spelet sålde miljontals exemplar inom några veckor.", sources: ["en:Valheim"] },
    { id: "fdj-pop-03", category: "popkultur", difficulty: "medel", question: "I vilken fiktiv stad utspelar sig \"Grand Theft Auto V\"?", answer: "Los Santos", explanation: "Staden bygger på Los Angeles.", sources: ["en:Grand_Theft_Auto_V"] },
    { id: "fdj-pop-04", category: "popkultur", difficulty: "medel", question: "Vilken svenskgrundad fildelningssajt låg i centrum för en uppmärksammad rättegång 2009?", answer: "The Pirate Bay", accept: ["Pirate Bay"], explanation: "Grundarna dömdes för medhjälp till brott mot upphovsrättslagen.", sources: ["sv:The_Pirate_Bay"] },
    // Blandat
    { id: "fdj-bland-01", category: "blandat", difficulty: "medel", question: "Hur många bokstäver har det svenska alfabetet?", answer: "29", explanation: "Sedan 2006 räknas w som en egen bokstav.", sources: ["sv:Svenska_alfabetet"] },
    { id: "fdj-bland-02", category: "blandat", difficulty: "medel", question: "Vad heter den sista bokstaven i det grekiska alfabetet?", answer: "Omega", explanation: "Uttrycket \"alfa och omega\" betyder början och slutet.", sources: ["sv:Omega"] },
    { id: "fdj-bland-03", category: "blandat", difficulty: "svår", question: "Vad kallas en musikensemble med nio musiker?", answer: "Nonett", explanation: "Sju musiker kallas septett och åtta oktett.", sources: ["sv:Nonett"] },
  ],
});
