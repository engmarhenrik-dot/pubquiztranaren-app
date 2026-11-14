/*
 * Onsdagsquizen, avsnitt 37 (Knutbar, 2024-06-19): frågor från avsnittet (tagg "onsdagsquizen")
 * och liknande frågor på samma teman (tagg "liknande").
 * Utelämnade: Ales stenar, Värmland, Njupeskär, Kay Pollak, Sarah Sjöström, drottning Elizabeths ordningstal,
 * Elvis Presleys barn, "Mina drömmars stad", "Gentlemen", Valletta och Patti Smith (fanns redan eller avslöjas av
 * andra frågor). Frågorna om europeiska premiärministrar är omgjorda, eftersom Kaja Kallas lämnade posten 2024.
 */
PQ.bank.addSet({
  verified: "2026-11-05",
  origin: "onsdagsquizen",
  questions: [
    // ---------- Gamla ord ----------
    { id: "oq37-bland-01", category: "blandat", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket kvinnonamn brukar följa efter utropet \"jösses\"?", answer: "Amalia", explanation: "\"Jösses Amalia\" är ett gammaldags utrop av förvåning.", more: "Jösses är en förvanskning av Jesus.", sources: ["sv:Jösses"] },
    { id: "oq37-bland-02", category: "blandat", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad betyder slangordet pluska?", answer: "Plånbok", accept: ["Portmonnä", "Börs"], explanation: "Ordet är gammal svensk slang.", more: "Det förekommer bland annat i äldre Stockholmsslang.", sources: ["sv:Lista_över_svenska_slangord"] },
    { id: "oq37-bland-03", category: "blandat", difficulty: "svår", tags: ["onsdagsquizen"], question: "Vad gör man om man tar en jamare?", answer: "Tar en drink", accept: ["Dricker en grogg", "Tar en sup", "Dricker sprit", "Grogg", "Drink"], explanation: "En jamare är en grogg eller en sup.", more: "Andra gamla ord för samma sak är stänkare och pilleknarkare.", sources: ["sv:Lista_över_svenska_slangord"] },

    // ---------- Italien ----------
    { id: "oq37-hist-01", category: "historia", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Enligt myten diade Roms grundare Romulus och Remus hos ett djur. Vilket?", answer: "En varg", accept: ["Varg", "Varghona", "Vargtik"], explanation: "Varghonan hittade tvillingarna vid floden Tibern.", more: "Statyn av varghonan med tvillingarna är en symbol för Rom.", sources: ["sv:Romulus_och_Remus"] },
    { id: "oq37-geo-01", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilken italiensk region ligger Portofino och Genua?", answer: "Ligurien", accept: ["Liguria"], explanation: "Regionen ligger vid Liguriska havet i nordvästra Italien.", more: "Huvudstaden är Genua.", sources: ["sv:Ligurien"] },
    { id: "oq37-geo-02", category: "geografi", difficulty: "medel", tags: ["liknande"], question: "Vad kallas de fem färgglada byarna vid kusten nära La Spezia som är världsarv?", answer: "Cinque Terre", explanation: "Namnet betyder \"fem länder\".", more: "Byarna förbinds av vandringsleder längs klipporna.", sources: ["sv:Cinque_Terre"] },
    { id: "oq37-sport-01", category: "sport", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilken italiensk klubb avslutade Zlatan Ibrahimović sin spelarkarriär?", answer: "AC Milan", accept: ["Milan"], explanation: "Han slutade 2023, 41 år gammal.", more: "Han vann italienska ligan med Milan både 2011 och 2022.", sources: ["sv:Zlatan_Ibrahimović"] },
    { id: "oq37-sport-02", category: "sport", difficulty: "medel", tags: ["liknande"], question: "I vilken amerikansk klubb spelade Zlatan Ibrahimović 2018–2019?", answer: "LA Galaxy", accept: ["Los Angeles Galaxy", "Galaxy"], explanation: "Han gjorde mål med en klack-volley i debuten.", more: "Han kom dit från Manchester United.", sources: ["sv:Zlatan_Ibrahimović"] },

    // ---------- Personer ----------
    { id: "oq37-mus-01", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad hette pianisten som 1964 gav ut \"Jazz på svenska\", Sveriges mest sålda jazzskiva?", answer: "Jan Johansson", explanation: "Han spelade svenska folkvisor i jazzarrangemang.", more: "Han kom från Söderhamn och dog i en bilolycka 1968.", sources: ["sv:Jan_Johansson_(musiker)"] },
    { id: "oq37-mus-02", category: "musik", difficulty: "svår", tags: ["liknande"], question: "Vilken folkvisa från Hälsingland är den mest kända låten på \"Jazz på svenska\"?", answer: "Visa från Utanmyra", accept: ["Utanmyra"], explanation: "Melodin kommer från en by i Hälsingland.", more: "Skivan spelades in med basisten Georg Riedel.", sources: ["sv:Jazz_på_svenska"] },

    // ---------- Blandat ----------
    { id: "oq37-bland-04", category: "blandat", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Om någon har gjort en okulär besiktning, vad har de använt för att göra sin bedömning?", answer: "Ögonen", accept: ["Synen", "Ögat"], explanation: "Okulär kommer från latinets oculus, \"öga\".", more: "Det betyder att man bara tittat, utan mätningar eller tester.", sources: ["sv:Okulärbesiktning"] },
    { id: "oq37-sport-03", category: "sport", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilket nummer bar Diego Maradona på tröjan i Argentinas landslag och i Napoli?", answer: "10", accept: ["Tio"], explanation: "Napoli pensionerade numret efter honom.", more: "Napolis arena bytte namn till Stadio Diego Armando Maradona efter hans död 2020.", sources: ["sv:Diego_Maradona"] },

    // ---------- Europeiska politiker ----------
    { id: "oq37-geo-03", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket land har Donald Tusk varit premiärminister?", answer: "Polen", explanation: "Han tillträdde första gången 2007 och igen 2023.", more: "Han var också ordförande för Europeiska rådet 2014–2019.", sources: ["sv:Donald_Tusk"] },
    { id: "oq37-geo-04", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket land var Kaja Kallas premiärminister 2021–2024?", answer: "Estland", explanation: "Hon var landets första kvinnliga premiärminister.", more: "Hennes pappa Siim Kallas hade också varit premiärminister.", sources: ["sv:Kaja_Kallas"] },
    { id: "oq37-hist-02", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vilken tung EU-post tog Kaja Kallas över i december 2024?", answer: "Utrikesrepresentant", accept: ["EU:s utrikeschef", "Hög representant för utrikes frågor", "Utrikeschef"], explanation: "Posten heter formellt unionens höga representant för utrikes frågor och säkerhetspolitik.", more: "Hon efterträdde spanjoren Josep Borrell.", sources: ["sv:Kaja_Kallas"] },
    { id: "oq37-geo-05", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket land blev Mette Frederiksen premiärminister 2019?", answer: "Danmark", explanation: "Hon leder Socialdemokratiet.", more: "Hon var landets yngsta premiärminister när hon tillträdde.", sources: ["sv:Mette_Frederiksen"] },

    // ---------- Historia ----------
    { id: "oq37-hist-03", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Mot vilket lands armé stred de amerikanska nybyggarna vid slaget om Alamo 1836?", answer: "Mexiko", explanation: "Texas ville bryta sig loss från Mexiko.", more: "\"Remember the Alamo\" blev ett stridsrop i kriget.", sources: ["sv:Slaget_vid_Alamo"] },
    { id: "oq37-geo-06", category: "geografi", difficulty: "lätt", tags: ["liknande"], question: "I vilken amerikansk delstat ligger missionsstationen Alamo?", answer: "Texas", explanation: "Den ligger i San Antonio.", more: "Texas var en självständig republik 1836–1845.", sources: ["sv:Alamo"] },

    // ---------- Litteratur ----------
    { id: "oq37-pers-01", category: "kanda-personer", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad heter P.C. Jersilds roman från 1976 om elvaårige Reine, som skippar kollot och stannar ensam i Stockholm?", answer: "Barnens ö", explanation: "Romanen filmades av Kay Pollak 1980.", more: "Reine vill hinna lära sig hur vuxenvärlden fungerar innan han kommer i puberteten.", sources: ["sv:Barnens_ö"] },

    // ---------- Huvudstäder ----------
    { id: "oq37-geo-07", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter Kroatiens huvudstad?", answer: "Zagreb", explanation: "Staden ligger vid floden Sava.", more: "Kroatien gick med i EU 2013.", sources: ["sv:Zagreb"] },
    { id: "oq37-geo-08", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vad heter Bulgariens huvudstad?", answer: "Sofia", explanation: "Staden ligger vid foten av berget Vitosja.", more: "Bulgarien införde euron 2026.", sources: ["sv:Sofia"] },

    // ---------- Musik ----------
    { id: "oq37-mus-03", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken Broder Daniel-låt gjorde Anna Ternheim en känd cover på 2004?", answer: "Shoreline", explanation: "Hennes version blev nästan mer känd än originalet.", more: "Originalet kom 1998.", sources: ["sv:Shoreline"] },
    { id: "oq37-mus-04", category: "musik", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken amerikansk sångerska slog igenom 1983 med covern \"Girls Just Want to Have Fun\"?", answer: "Cyndi Lauper", accept: ["Lauper"], explanation: "Originalet spelades in av Robert Hazard.", more: "Hon skrev senare musiken till musikalen \"Kinky Boots\".", sources: ["sv:Cyndi_Lauper"] },

    // ---------- Natur och samhälle ----------
    { id: "oq37-vet-01", category: "vetenskap-natur", difficulty: "medel", tags: ["onsdagsquizen"], question: "De fem stora rovdjuren i Sverige är björn, varg, kungsörn och två till. Vilka?", answer: "Lodjur och järv", accept: ["Järv och lodjur"], explanation: "Alla fem är fredade och övervakas.", more: "Järven är det ovanligaste av dem.", sources: ["sv:Stora_rovdjur"] },
    { id: "oq37-bland-05", category: "blandat", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken bank handlar boken \"Honungsfällan\" om, med dess påstådda penningtvätt i Baltikum?", answer: "Swedbank", explanation: "Boken skrevs av journalister som granskat banken.", more: "Banken fick 2020 en sanktionsavgift på 4 miljarder kronor av Finansinspektionen.", sources: ["sv:Swedbank"] },
    { id: "oq37-vet-02", category: "vetenskap-natur", difficulty: "medel", tags: ["onsdagsquizen"], question: "Universums två vanligaste grundämnen är väte och vilket?", answer: "Helium", explanation: "Tillsammans utgör de nästan all vanlig materia.", more: "Båda bildades till största delen strax efter big bang.", sources: ["sv:Helium"] },
    { id: "oq37-vet-03", category: "vetenskap-natur", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad kallas förberedelserna inför en förlossning, med bland annat andningsövningar?", answer: "Profylax", explanation: "Ordet betyder förebyggande åtgärder.", more: "Metoden ska hjälpa den födande att hantera smärtan.", sources: ["sv:Profylax"] },
    { id: "oq37-sport-04", category: "sport", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Ett fotbollslag gör mål och går från 1–3 till 2–3. Vad har de gjort, med ett ord?", answer: "Reducerat", accept: ["Reducerade", "Reducera"], explanation: "Att reducera betyder att minska motståndarens ledning.", more: "Att utjämna betyder att göra det lika.", sources: ["sv:Fotboll"] },
    { id: "oq37-sport-05", category: "sport", difficulty: "lätt", tags: ["liknande"], question: "Vad kallas det när en spelare gör tre mål i samma match?", answer: "Hattrick", explanation: "Uttrycket kommer från cricket.", more: "Ett \"perfekt hattrick\" görs med vänsterfot, högerfot och huvud.", sources: ["sv:Hattrick"] },
    { id: "oq37-bland-06", category: "blandat", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket gammalt ord, ursprungligen från franskan via engelskan, betyder oäkting, ett barn fött utanför äktenskapet?", answer: "Bastard", explanation: "Ordet används i dag mest som skällsord.", more: "Det användes också om blandraser bland djur och växter.", sources: ["sv:Oäkta_barn"] },
  ],
});
