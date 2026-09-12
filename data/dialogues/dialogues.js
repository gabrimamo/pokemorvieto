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

// "Il Merlo" — collega/Pidgey, fa sempre promesse e sparisce.
dialogues.merlo = [
  'Ehi Sere! Ti giuro, questa volta il file te lo mando entro stasera.',
  "Anzi no, domani mattina presto. Prestissimo.",
  '...',
  "Comunque bel piumaggio oggi, no? Devo volare, ci sentiamo!"
]

// Tina — collega/Krabby, pignola, controlla ogni dettaglio del design system.
dialogues.tina = [
  'Quel margine è di 7px, non di 8. Lo vedo da qui.',
  "Non è cattiveria, Sere. È che qualcuno deve controllare i dettagli.",
  '...',
  "Quando sarai pronta a discutere i token di colore, io ci sono. Sempre."
]

// Zapdos — manager, autorevole, piena di opinioni su tutto.
dialogues.zapdos = [
  "Allora, la mia opinione? Ne ho diverse, in realtà.",
  'Il progetto ha potenziale, ma la direzione va decisa da chi vede tutto il quadro.',
  '...',
  "Fidati di me, Sere. O almeno, fidati che io mi fido di me stessa."
]

// Gengar — il collega spettro: cattivo con chi attacca, protettivo con i suoi.
dialogues.gengar = [
  '...',
  "Se sei venuta ad attaccare, preparati.",
  "Ma se sei qui per i tuoi, allora resta pure quanto vuoi.",
  "Non tutti capiscono la differenza. Tu sì, vero?"
]

// NPC generici del centro storico (placeholder finché non arrivano sprite
// dedicati a Orvieto — vedi requisiti, sezione 13).
dialogues.villagerOrvieto = [
  '...',
  "Hai visto la Rupe stamattina? Con la nebbia sembra fluttuare."
]

dialogues.oldManOrvieto = [
  "Le mie ossa sentono l'umidità delle cantine, in questa stagione."
]

// Il padre di Sere — "il Kraken", nella cantina/magione fuori città.
dialogues.padreKraken = [
  "Guarda chi si vede! Non stare troppo lontana da casa, eh.",
  'Il camper non si muove più, ma le storie sì.',
  '...',
  "Porta un saluto a quel gattaccio di Meowth da parte mia."
]
