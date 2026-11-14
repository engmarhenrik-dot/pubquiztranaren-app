/*
 * Onsdagsquizen, avsnitt 38 (Knutbar, 2024-06-28, säsongsavslutning): frågor från avsnittet (tagg "onsdagsquizen")
 * och liknande frågor på samma teman (tagg "liknande").
 * Utelämnade: Elon Musks lönepaket (oklart formulerat i quizet), Riksbankens inflationsmål, Andorra, kvintett,
 * archipelago, järn, Israels självständighetsår, Gert Fredriksson, OS i Aten, Drottningholm och filmcitaten
 * (fanns redan eller avslöjas av andra frågor).
 * Kleopatras relation var med Julius Caesar, som var diktator och inte kejsare.
 */
PQ.bank.addSet({
  verified: "2026-11-05",
  origin: "onsdagsquizen",
  questions: [
    // ---------- Sport ----------
    { id: "oq38-sport-01", category: "sport", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilket fotbollslandslag kallas Oranje?", answer: "Nederländerna", accept: ["Holland"], explanation: "Namnet kommer från kungahuset Oranien-Nassau.", more: "Laget spelar i orange tröjor.", sources: ["sv:Nederländernas_herrlandslag_i_fotboll"] },
    { id: "oq38-sport-02", category: "sport", difficulty: "medel", tags: ["liknande"], question: "Vilket fotbollslandslag kallas La Albiceleste, efter sina vit- och himmelsblå tröjor?", answer: "Argentina", explanation: "Namnet betyder ungefär \"den vita och himmelsblå\".", more: "Argentina vann VM 2022 i Qatar.", sources: ["sv:Argentinas_herrlandslag_i_fotboll"] },
    { id: "oq38-sport-03", category: "sport", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket av dessa har aldrig varit en OS-gren: krocket, baklängeslöpning eller dragkamp?", answer: "Baklängeslöpning", explanation: "Krocket fanns med 1900 och dragkamp 1900–1920.", more: "Sverige vann OS-guld i dragkamp 1912.", sources: ["sv:Dragkamp"] },

    // ---------- Musik ----------
    { id: "oq38-mus-01", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vad kallas en ensemble med sju musiker?", answer: "Septett", explanation: "Ordet kommer från latinets septem, sju.", more: "Med fem musiker blir det en kvintett och med sex en sextett.", sources: ["sv:Septett"] },
    { id: "oq38-mus-02", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilket instrument spelar sydkoreanen Yiruma, världsberömd för låten \"River Flows in You\"?", answer: "Piano", explanation: "Låten kom 2001.", more: "Den blev en av de mest spelade pianolåtarna på nätet.", sources: ["en:Yiruma"] },
    { id: "oq38-mus-03", category: "musik", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vilken svensk artist släppte hitsen \"Look Who's Laughing Now\", \"Honeyboy\" och \"Kite\"?", answer: "Benjamin Ingrosso", accept: ["Ingrosso"], explanation: "Låtarna kom 2023–2024.", more: "Han har också vunnit Melodifestivalen.", sources: ["sv:Benjamin_Ingrosso"] },
    { id: "oq38-mus-04", category: "musik", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken artist, född i Los Angeles 2001, gjorde ledmotivet till Bondfilmen \"No Time to Die\" och musik till filmen \"Barbie\"?", answer: "Billie Eilish", accept: ["Eilish"], explanation: "Hon fick Oscar för båda låtarna.", more: "Barbielåten heter \"What Was I Made For?\".", sources: ["sv:Billie_Eilish"] },
    { id: "oq38-mus-05", category: "musik", difficulty: "medel", tags: ["liknande"], question: "Vad heter Billie Eilishs bror, som skriver och producerar hennes låtar?", answer: "Finneas", accept: ["Finneas O'Connell"], explanation: "De spelar in musiken hemma i Los Angeles.", more: "Han har också en egen karriär som artist.", sources: ["sv:Finneas_O'Connell"] },

    // ---------- Film och historia ----------
    { id: "oq38-film-01", category: "film-tv", difficulty: "medel", tags: ["onsdagsquizen"], question: "Vem spelade den kvinnliga huvudrollen i filmen \"Ghost\" från 1990, med den berömda drejscenen?", answer: "Demi Moore", accept: ["Moore"], explanation: "Hon spelar keramikern Molly.", more: "Whoopi Goldberg fick Oscar för sin roll som medium i filmen.", sources: ["sv:Ghost_(film)"] },
    { id: "oq38-mus-06", category: "musik", difficulty: "medel", tags: ["liknande"], question: "Vilken låt med The Righteous Brothers spelas i drejscenen i \"Ghost\"?", answer: "Unchained Melody", explanation: "Låten är från 1965.", more: "Den blev en hit igen tack vare filmen.", sources: ["sv:Unchained_Melody"] },
    { id: "oq38-hist-01", category: "historia", difficulty: "lätt", tags: ["onsdagsquizen"], question: "John F. Kennedy vann presidentvalet 1960. Vilken republikan, som senare själv blev president, slog han?", answer: "Richard Nixon", accept: ["Nixon"], explanation: "Valet var ett av de jämnaste i USA:s historia.", more: "Det var första valet med tv-sända debatter.", sources: ["sv:Presidentvalet_i_USA_1960"] },
    { id: "oq38-hist-02", category: "historia", difficulty: "medel", tags: ["onsdagsquizen"], question: "Under vilket århundrade anlände James Cook till Australien?", answer: "1700-talet", accept: ["1700"], explanation: "Han kom dit 1770.", more: "Han landsteg i Botany Bay.", sources: ["sv:James_Cook"] },
    { id: "oq38-hist-03", category: "historia", difficulty: "svår", tags: ["liknande"], question: "Vad hette fartyget som James Cook seglade med på sin första stora resa?", answer: "Endeavour", accept: ["HMS Endeavour"], explanation: "Resan varade 1768–1771.", more: "Botanisten Joseph Banks var med ombord.", sources: ["sv:HMS_Endeavour"] },
    { id: "oq38-hist-04", category: "historia", difficulty: "lätt", tags: ["onsdagsquizen"], question: "Vilken romersk härskare hade Kleopatra ett förhållande med och fick en son med?", answer: "Julius Caesar", accept: ["Caesar"], explanation: "Sonen hette Caesarion.", more: "Caesar var diktator, inte kejsare.", sources: ["sv:Kleopatra_VII"] },
    { id: "oq38-hist-05", category: "historia", difficulty: "medel", tags: ["liknande"], question: "Vilken romersk fältherre hade Kleopatra ett förhållande med efter Caesars död?", answer: "Marcus Antonius", accept: ["Antonius"], explanation: "De förlorade slaget vid Actium 31 f.Kr.", more: "Båda tog sedan livet av sig.", sources: ["sv:Marcus_Antonius"] },

    // ---------- Öar ----------
    { id: "oq38-geo-01", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "På vilken ö ligger staden Palma?", answer: "Mallorca", explanation: "Palma är huvudstad i regionen Balearerna.", more: "Mallorca är den största av Balearerna.", sources: ["sv:Palma_de_Mallorca"] },
    { id: "oq38-geo-02", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilken ögrupp ligger staden Las Palmas?", answer: "Kanarieöarna", accept: ["Gran Canaria"], explanation: "Staden ligger på Gran Canaria.", more: "Kanarieöarna tillhör Spanien men ligger utanför Afrikas kust.", sources: ["sv:Las_Palmas_de_Gran_Canaria"] },
    { id: "oq38-geo-03", category: "geografi", difficulty: "medel", tags: ["liknande"], question: "Vilken är den största ön i den spanska ögruppen utanför Marockos kust?", answer: "Teneriffa", accept: ["Tenerife"], explanation: "Den hör till Kanarieöarna, och där ligger Spaniens högsta berg, Teide.", more: "Teide är en vulkan på drygt 3 700 meter.", sources: ["sv:Teneriffa"] },
    { id: "oq38-geo-04", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "På vilken ö ligger staden Funchal?", answer: "Madeira", explanation: "Ön tillhör Portugal.", more: "Ön är känd för sitt vin med samma namn.", sources: ["sv:Funchal"] },

    // ---------- Berg ----------
    { id: "oq38-geo-05", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket nordiskt land ligger Galdhøpiggen, landets högsta berg?", answer: "Norge", explanation: "Berget ligger i Jotunheimen.", more: "Det är omkring 2 470 meter högt.", sources: ["sv:Galdhøpiggen"] },
    { id: "oq38-geo-06", category: "geografi", difficulty: "lätt", tags: ["onsdagsquizen"], question: "I vilket land ligger berget Fuji, landets högsta?", answer: "Japan", explanation: "Det är en vulkan.", more: "Det senaste utbrottet var 1707.", sources: ["sv:Fuji"] },
    { id: "oq38-geo-07", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "I vilket av Storbritanniens länder ligger Ben Nevis, landets högsta berg?", answer: "Skottland", explanation: "Det ligger nära staden Fort William.", more: "Det är drygt 1 340 meter högt.", sources: ["sv:Ben_Nevis"] },
    { id: "oq38-geo-08", category: "geografi", difficulty: "svår", tags: ["liknande"], question: "Vad heter Englands högsta berg?", answer: "Scafell Pike", explanation: "Det ligger i Lake District.", more: "Det är knappt 980 meter högt.", sources: ["sv:Scafell_Pike"] },

    // ---------- New York ----------
    { id: "oq38-geo-09", category: "geografi", difficulty: "medel", tags: ["onsdagsquizen"], question: "New York City har fem stadsdelar. Två är Staten Island och Brooklyn. Vilka är de andra tre?", answer: "Manhattan, Queens och Bronx", accept: ["Manhattan, Bronx och Queens"], explanation: "Stadsdelarna kallas boroughs.", more: "Staten Island kallas också Richmond County.", sources: ["sv:New_York"] },
  ],
});
