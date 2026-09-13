// Dialoghi tenuti separati dal motore di gioco (requisiti, sezione 8).
// Ogni personaggio umano ha qui il proprio array di battute; dove
// narrativamente rilevante, lo stesso personaggio compare anche come
// Pokémon incontrabile/catturabile (vedi data/monsters.js e data/pokemon.js).
const dialogues = {}

// Sere (protagonista) — pensieri introduttivi, non ancora agganciati a un
// trigger specifico nel mondo di gioco.
dialogues.sereIntro = [
  'Le 8:15. Cuffie, treno, silenzio.',
  "Sdeng può aspettare cinque minuti in più oggi.",
  '...',
  "Meowth mi guarda come se sapesse già che qualcosa non torna in questo progetto."
]

// --- Trama "progetto Chiarore" (requisiti, sezione 5 e 14) ---
// Sequenza a tappe (storyState.flags.sdengStage): Zapdos assegna
// l'incarico, Tina nota anomalie nei dati, il Merlo sparisce dopo aver
// visto qualcosa, Gengar spinge Sere verso la Rupe per la verità, la
// scena con Grimer nel dungeon rivela il progetto, Zapdos chiude il
// cerchio. Vedi index.js (storyDialogueFor) per la logica delle tappe.
dialogues.zapdosPlot1 = [
  'Sere, ho un incarico speciale per te. Il progetto "Chiarore".',
  'Non dirlo in giro, ma nemmeno io ho visto tutti i dettagli.',
  "Serve solo la tua parte di design. Il resto... non è affar tuo.",
  'Fidati di me. O almeno, fidati che io mi fido di chi mi paga lo stipendio.'
]

dialogues.tinaPlot = [
  'Il progetto Chiarore, giusto? Ho controllato i flussi dati che mi hai passato.',
  'Ci sono permessi che non dovrebbero esistere per un semplice redesign, Sere.',
  'Non sto dicendo che è sbagliato. Sto dicendo che è strano. E le cose strane io le controllo sempre.',
  'Tienimi aggiornata. E stai attenta.'
]

dialogues.merloPlot = [
  'Ehi Sere! Il progetto Chiarore, vero? Ne so qualcosa anch\'io, sai?',
  'Diciamo che... ho visto un documento che non avrei dovuto vedere.',
  'Non chiedermi altro, okay? Devo... devo proprio andare.',
  '(Il Merlo sparisce dietro l\'angolo prima che tu possa dire altro.)'
]

dialogues.gengarPlot = [
  'So cosa stai cercando di scoprire, Sere.',
  'Chiarore non è un redesign. È un test. E i test hanno bisogno di cavie che non fanno domande.',
  "Se vuoi delle risposte vere, non le troverai in ufficio. Sotto la Rupe c'è chi sa cose che a Sdeng vogliono restino sepolte.",
  'Vai. Ma non da sola con la paura. Affrontala.'
]

dialogues.zapdosPlot2 = [
  'Allora? Hai visto abbastanza, immagino.',
  'Non ti chiederò di stare zitta. Non servirebbe comunque, conoscendoti.',
  'La mia opinione? Chiarore andava fermato mesi fa. La mia autorità, però, finisce prima della loro.',
  'Quello che farai con quello che sai... quello, Sere, è finalmente affar tuo.'
]

// Monologo di chiusura (temporaneo): anticipa il vero finale della storia,
// l'incontro con Mew, non ancora implementato (requisiti, sezione 6 e 14).
dialogues.sereClosure = [
  'Meowth mi guarda come se sapesse che questa storia non è ancora finita.',
  "Da qualche parte, dicono, hanno visto scintillare qualcosa sopra la Rupe.",
  'Qualcosa che, dicono, non è di questo mondo.',
  '(Il traguardo finale della storia — l\'incontro con Mew — arriverà in una fase successiva dello sviluppo.)'
]

// "Il Merlo" — collega/Pidgey, fa sempre promesse e sparisce.
dialogues.merlo = [
  'Ehi Sere! Ti giuro, questa volta il file te lo mando entro stasera.',
  "Anzi no, domani mattina presto. Prestissimo.",
  '...',
  "Comunque bel piumaggio oggi, no? Devo volare, ci sentiamo!"
]
dialogues.merloRepeat = [
  "Ancora io senza il file, lo so, lo so.",
  "Stavolta è colpa del wi-fi, giuro."
]

// Tina — collega/Krabby, pignola, controlla ogni dettaglio del design system.
dialogues.tina = [
  'Quel margine è di 7px, non di 8. Lo vedo da qui.',
  "Non è cattiveria, Sere. È che qualcuno deve controllare i dettagli.",
  '...',
  "Quando sarai pronta a discutere i token di colore, io ci sono. Sempre."
]
dialogues.tinaRepeat = [
  "Quell'ombra che hai messo ha ancora 2px di troppo, lo sai vero?"
]

// Zapdos — manager, autorevole, piena di opinioni su tutto.
dialogues.zapdos = [
  "Allora, la mia opinione? Ne ho diverse, in realtà.",
  'Il progetto ha potenziale, ma la direzione va decisa da chi vede tutto il quadro.',
  '...',
  "Fidati di me, Sere. O almeno, fidati che io mi fido di me stessa."
]
dialogues.zapdosRepeat = [
  'Ho già detto la mia. Due volte, anzi tre, se ricordo bene.'
]

// Gengar — il collega spettro: cattivo con chi attacca, protettivo con i suoi.
dialogues.gengar = [
  '...',
  "Se sei venuta ad attaccare, preparati.",
  "Ma se sei qui per i tuoi, allora resta pure quanto vuoi.",
  "Non tutti capiscono la differenza. Tu sì, vero?"
]
dialogues.gengarRepeat = [
  'Ancora qui? Bene. Vuol dire che non sei venuta per attaccare.'
]

// NPC generici del centro storico (placeholder finché non arrivano sprite
// dedicati a Orvieto — vedi requisiti, sezione 13). Ogni NPC ha una battuta
// "prima volta" più lunga e una "ripetuta" più breve, usando il flag di
// dialoghi visti salvato in localStorage (requisiti, sezione 11).
dialogues.villagerOrvieto = [
  '...',
  "Hai visto la Rupe stamattina? Con la nebbia sembra fluttuare.",
  "Certi dicono che sottoterra ci siano gallerie che vanno avanti per chilometri.",
  "Io non ci metterei piede, ma tu sembri il tipo che non si tira indietro."
]
dialogues.villagerOrvietoRepeat = [
  'Ancora tu? La piazza oggi è tranquilla, per fortuna.'
]

dialogues.oldManOrvieto = [
  "Le mie ossa sentono l'umidità delle cantine, in questa stagione.",
  "Quando ero giovane anch'io avevo un Pokémon di famiglia, sai?",
  "Un Onix, testardo come una roccia. Proprio come il padre di quella designer di Sdeng."
]
dialogues.oldManOrvietoRepeat = [
  "Le mie ossa continuano a farsi sentire. Ma sto bene, non preoccuparti."
]

// Segnaposto per il vicolo che esce dalla piazza verso il resto del centro
// storico: anche questa parte di mappa è un lavoro successivo.
dialogues.vicoloEstTeaser = [
  'Il vicolo continua oltre la piazza, verso il resto del centro storico.',
  '(Il resto della mappa di Orvieto arriverà in una fase successiva dello sviluppo.)'
]
dialogues.vicoloEstTeaserRepeat = [
  'Ancora il solito vicolo. Il resto della città aspetta ancora di essere disegnato.'
]

// --- Dungeon della Rupe (requisiti, sezione 4 e 9) ---
dialogues.rupeLeva = [
  'Una leva arrugginita, incastrata nella roccia.',
  '(La tiri. Un meccanismo scatta da qualche parte oltre il cancello.)'
]
dialogues.rupeLevaRepeat = [
  'Il meccanismo della leva è già scattato.'
]

// Dopo la scena di Grimer nel dungeon: rivelazione sul progetto Chiarore.
dialogues.dungeonPostGrimer = [
  'Quindi è questo il progetto Chiarore. Non design. Non un cliente. Cavie.',
  'Grimer non è un mostro. È una vittima, come tutte le altre.',
  'Ok, Sdeng. Ora tocca a me decidere cosa farne, di quello che ho visto.'
]

// Il padre di Sere — "il Kraken", nella cantina/magione fuori città.
dialogues.padreKraken = [
  "Guarda chi si vede! Non stare troppo lontana da casa, eh.",
  'Il camper non si muove più, ma le storie sì.',
  '...',
  "Porta un saluto a quel gattaccio di Meowth da parte mia."
]
dialogues.padreKrakenRepeat = [
  'Di nuovo qui questo weekend? Bene, la cantina non si gestisce da sola.'
]
