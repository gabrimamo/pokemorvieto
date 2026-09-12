# Requisiti di progetto: Pokémon Orvieto (nome provvisorio)

## 1. Obiettivo

Regalo personale per un amico: un gioco browser in stile Pokémon (prima generazione), ambientato in una versione stilizzata di Orvieto. Non deve essere fedele alla realtà, solo ispirato: piazze, vicoli, grotte di tufo, pozzi, cantine.

Il progetto parte da un fork di un clone open source esistente, non da zero.

## 2. Stack tecnico

- HTML5 Canvas + JavaScript vanilla (nessun framework pesante)
- Mappa creata con **Tiled**, esportata come layer di dati (JSON/array)
- GSAP per animazioni/transizioni, Howler.js per audio (già presenti nel progetto base)
- Nessun backend: tutto client-side
- Salvataggio progressi tramite `localStorage` del browser
- Hosting: **GitHub Pages** (gratuito, link diretto da inviare all'amico)

## 3. Base di partenza

Fork del repository open source:

- **Repo:** `ManaJBin/pokemon` (github.com/ManaJBin/pokemon)
- **Licenza:** MIT, libera modifica e distribuzione
- Struttura da mantenere: `index.js` (mondo/movimento), `classes.js` (entità), `battleScene.js` (combattimento), cartella `data/` per contenuti (personaggi, mostri, dialoghi, collisioni)

Modifiche strutturali necessarie rispetto al progetto base:

1. Aggiungere controlli touch (D-pad virtuale a schermo) per il mobile, oltre alla tastiera esistente
2. Estendere il sistema di combattimento per supportare **cattura** dei Pokémon selvatici, non solo battaglia
3. Aggiungere gestione **squadra/inventario** (più Pokémon posseduti, selezione di chi mandare in campo)
4. Aggiungere sistema di **salvataggio/caricamento** su `localStorage` (posizione, squadra catturata, dialoghi già visti, progressi storia)
5. Rendere responsive il canvas per schermi telefono (già parzialmente gestito via CSS, da verificare su viewport reali)

## 4. Mappa

- Ambientazione ispirata a Orvieto, non realistica: piazza centrale che richiama Piazza Duomo, un edificio stilizzato che rappresenta il Duomo, vicoli del centro storico, un'area "Rupe" con grotte/dungeon sotterranei, una zona cantina/magione di famiglia
- **Tileset consigliato:** "Medieval Town Tilemap" (autore Lukas311202, itch.io, gratuito/paga quanto vuoi, licenza libera per uso personale e commerciale, non rivendibile). Griglia 16x16, comprende edifici, strade, decorazioni, mura
- Da creare in Tiled con almeno questi layer: terreno, oggetti/decorazioni, collisioni, erba alta/zone incontro, posizioni NPC, ingressi ad aree sotterranee
- Area sotterranea/dungeon (grotte di tufo, pozzi) da sviluppare come mappa collegata, in stile esplorativo (ispirato a Zelda, come da personalità della protagonista), con possibile comparsa dei Grimer notturni come momento di tensione (dettaglio da sviluppare in una fase successiva, non bloccante per la prima versione)

## 5. Storia e protagonista

**Protagonista:** Sere, 35 anni, web e app designer per "Sdeng", una multinazionale con uffici nella regione. Precisa, creativa, attenta ai dettagli. Prende ogni mattina lo stesso treno delle 8:15 con le cuffie, per isolarsi nel silenzio. Aspetto ispirato a Zelda: capelli castano scuro, lineamenti eleganti, portamento sicuro di sé.

**Tratti caratteriali rilevanti per il gameplay:**
- Ama i gatti, il suo Pokémon di partenza/compagno fedele è un Meowth
- Nel tempo libero pratica hula hoop alla palestra "Bim Bum Bum" e gioca a Zelda: ama dungeon, enigmi, tesori nascosti, esplorazione "da divano". Questo giustifica narrativamente piccoli dungeon ed enigmi nel gioco, mai troppo distanti dal "centro" (casa)
- **Paure:** non ama allontanarsi da casa (evita aerei, tollera il treno solo perché le lascia il controllo), e ha una fortissima paura degli zombie/non-morti, che la rende diffidente verso i Pokémon di tipo Spettro più macabri (pur ammirandone in segreto l'estetica). Questo tratto è narrativamente utile per scene di tensione nei dungeon sotterranei

**Famiglia:** il padre, soprannominato "il Kraken" per i molti arti e la forza mostrata un tempo nelle palestre Pokémon, ora vive stabilmente in un camper fuori città e non viaggia più. Gestisce (con l'aiuto di Sere) una cantina di vini con annessa magione e altre proprietà nella regione. Sere lo va a trovare spesso nei weekend.

**Arco narrativo:** Sere lavora per Sdeng ma non ne condivide i metodi; viene coinvolta suo malgrado in un progetto ambiguo dell'azienda. La trama ruota attorno a quanto è disposta a chiudere un occhio per il proprio lavoro, mentre affronta gradualmente (un passo alla volta) la paura di allontanarsi da casa e, potenzialmente, quella degli zombie/Spettri.

*Nota: la trama è delineata nei temi principali ma i dettagli di missioni/eventi specifici (oltre alla scena del dungeon con i Grimer) sono da sviluppare in una fase successiva di scrittura dialoghi.*

## 6. Roster Pokémon (35 totali, prima generazione)

Sottoinsieme scelto a tema Orvieto/storia di Sere, non l'intero roster dei 150.

| Pokémon | Ruolo nella storia |
|---|---|
| Meowth | Compagno fedele di Sere, guardiano della magione e della cantina |
| Vulpix | Vive nella magione, elegante e poco incline allo scontro |
| Geodude | Abita le grotte di tufo sotto la città, utile nei dungeon sotterranei |
| Psyduck | Ispirato ai pozzi scavati nella roccia (tipo Pozzo di San Patrizio), tono comico |
| Bellsprout | Legato alla vigna di famiglia |
| Onix | Guardiano delle gallerie sotterranee, richiama la figura del padre "Kraken" |
| Graveler | Evoluzione di Geodude |
| Sandshrew | Fauna delle grotte/tufo |
| Zubat, Golbat | Popolano i cunicoli e le grotte di tufo, incontro tipico nei passaggi bui dei dungeon sotterranei |
| Diglett, Dugtrio | Vivono nella rete di tunnel sotto la città, possono comparire nei tratti di passaggio tra un'area sotterranea e l'altra |
| Cubone | Legato alla necropoli etrusca fuori città, tema tombe/rovine antiche |
| Machop | Lavora idealmente nelle cave di tufo, coerente con una città scavata nella roccia |
| Paras | Cresce nell'umidità delle cantine e delle grotte, coerente con la cantina di famiglia |
| Charmander, Charmeleon, Charizard | Collega dell'ufficio design: ha sempre caldo, "non suda, brilla" |
| Growlithe | Fauna a tema fuoco/regione |
| Oddish | Fauna campagna umbra |
| Pidgey ("il Merlo") | Collega che fa promesse e sparisce, devoto a Zapdos |
| Rattata | Fauna comune |
| Persian | Evoluzione di Meowth |
| Poliwag, Squirtel | Fauna acquatica generica |
| Krabby, Kingler ("Tina") | Collega temuta e rispettata del design system, controlla ogni dettaglio |
| Tentacool, Tentacruel | Fedele aiutante/destriero del padre di Sere |
| Gastly, Haunter, Gengar | Cattivo con chi lo attacca, protettivo fino all'ossessione con i suoi |
| Grimer | Vive nel bosco fuori città, appare di notte, incarna la paura degli zombie di Sere |
| Zapdos | Manager dell'ufficio, sicura di sé, piena di opinioni su tutto |
| Mew | Leggendario finale, traguardo conclusivo della storia |

Nota: Charmander e Gengar vanno implementati con tutte le loro evoluzioni come richiesto (catena completa disponibile in battaglia/cattura secondo livello).

## 7. Fonte dati Pokémon

- **PokéAPI** (pokeapi.co) come sorgente per nome, tipo, statistiche base, sprite (placeholder, uso personale non commerciale)
- Script Node una tantum per scaricare i dati dei 35 Pokémon selezionati e salvarli in un file `pokemon.json` locale, così il gioco funziona offline e non dipende da chiamate API runtime
- Sprite da usare: versione classica stile Game Boy/GBA se disponibile nella risposta API

## 8. Dialoghi

- Dialoghi tenuti in file dati separati dalla logica di gioco (seguendo lo schema già presente nel progetto base: array di stringhe per personaggio), così sono facili da modificare senza toccare il motore
- I personaggi "umani" (colleghi, il Merlo, Tina, ecc.) vanno rappresentati sia come NPC nel mondo sia, dove narrativamente rilevante, come i Pokémon corrispondenti incontrabili/catturabili
- Toni dei dialoghi da calibrare secondo la scheda personaggio: es. Tina/Krabby pignola e diretta, il Merlo/Pidgey che fa promesse a vuoto, Zapdos autorevole e piena di opinioni, Gengar minaccioso ma protettivo

## 9. Sistema di gioco

- Esplorazione a griglia (tile-based), movimento a passi come nel Pokémon originale
- Zone di erba alta/aree apposite generano incontri casuali con i Pokémon del roster
- Combattimento a turni (base già presente nel clone: barre vita, selezione attacco)
- **Da aggiungere:** meccanica di cattura (es. oggetto "Poké Ball" con probabilità di successo)
- **Da aggiungere:** gestione squadra (più Pokémon catturati, possibilità di scegliere chi mandare in campo)
- Dungeon sotterraneo/e con enigmi semplici in stile Zelda (coerente con la passione della protagonista)

## 10. Controlli mobile

- D-pad virtuale touch per il movimento (4 direzioni)
- Pulsante di interazione/conferma touch (equivalente al tasto usato ora per dialoghi/menu)
- Layout responsive: canvas adattato a schermi verticali di telefono

## 11. Salvataggio

- Salvataggio automatico o su richiesta in `localStorage`
- Dati da salvare: posizione sulla mappa, squadra Pokémon posseduta, flag dialoghi/eventi già completati, eventuale avanzamento trama

## 12. Deployment

- Repository pubblico o privato su GitHub
- Pubblicazione tramite GitHub Pages, con link diretto da condividere con l'amico
- Nessuna configurazione richiesta lato utente finale: basta aprire il link da browser mobile

## 13. Asset da procurare/creare

- Tileset "Medieval Town Tilemap" (Lukas311202, itch.io) o alternativa CC0 equivalente, da adattare/estendere per le aree specifiche di Orvieto (piazza, Duomo stilizzato, grotte, cantina)
- Sprite protagonista (Sere): da creare o adattare da asset pack esistente compatibile in stile e dimensione tile col tileset scelto
- Sprite NPC per i personaggi umani della storia (Tina, il Merlo, ecc.), coerenti in stile col resto

## 14. Punti aperti (da definire in fasi successive, non bloccanti per la prima versione)

- Dettaglio missioni/eventi della trama Sdeng oltre ai temi generali
- Scena specifica del dungeon con comparsa dei Grimer notturni
- Bilanciamento probabilità di cattura ed eventuale sistema di livelli/esperienza
- Elenco finale sprite/asset personalizzati necessari e relative fonti
