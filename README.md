# 🐈 Pokémon Orvieto (nome provvisorio)

Regalo personale: un gioco browser in stile Pokémon (prima generazione),
ambientato in una versione stilizzata di Orvieto — piazze, vicoli, grotte di
tufo, pozzi, cantine. Pensato per essere giocato da telefono, aprendo
semplicemente un link.

Protagonista: **Sere**, web e app designer per "Sdeng", accompagnata dal suo
fedele Meowth. I requisiti completi del progetto sono in
[`docs/REQUISITI.md`](docs/REQUISITI.md).

## Base di partenza

Questo progetto parte come fork del clone open source
[`ManaJBin/pokemon`](https://github.com/ManaJBin/pokemon) (licenza MIT), da
cui riprende la struttura (`index.js` per mondo/movimento, `classes.js` per
le entità, `battleScene.js` per il combattimento, `data/` per i contenuti).

## Cosa è stato aggiunto rispetto alla base

- **Controlli touch**: D-pad virtuale + pulsante di interazione per mobile,
  in aggiunta alla tastiera (`js/touchControls.js`, markup in `index.html`).
- **Cattura dei Pokémon selvatici**: pulsante "Poké Ball" in battaglia, con
  probabilità di successo legata a `catchRate` e HP residui del Pokémon
  selvatico (`Monster.attemptCapture()` in `classes.js`).
- **Squadra/inventario**: fino a 6 Pokémon posseduti, menu per scegliere chi
  mandare in campo, sia fuori che dentro battaglia (`js/team.js`).
- **Salvataggio/caricamento** su `localStorage`: posizione sulla mappa,
  squadra catturata, dialoghi/eventi visti (`js/save.js`).
- **Canvas responsive**: viewport mobile, layout dei controlli adattivo,
  `object-fit: contain` per adattarsi a qualunque schermo verticale.
- **Roster Pokémon a tema Orvieto**: 35 Pokémon di prima generazione con
  ruolo narrativo, dati scaricati da [PokéAPI](https://pokeapi.co) e salvati
  offline in `data/pokemon.json` (vedi `scripts/fetchPokemonData.js`).
- **Dialoghi separati dal motore**: `data/dialogues/dialogues.js`, un array
  di battute per personaggio (Tina/Krabby, il Merlo/Pidgey, Zapdos, Gengar,
  il padre "Kraken", oltre all'introduzione di Sere), con varianti "prima
  volta"/"ripetuto" che usano il flag di dialoghi visti salvato in
  `localStorage`.
- **Mappa in formato Tiled**: `data/maps/orvietoPiazza.json`, una piazza con
  bordo, zona erba alta e ingresso della Rupe su una griglia di tile
  segnaposto (`img/tilesets/orvieto-placeholder.png`), più un layer
  `edifici` che posiziona i veri asset del tileset "Medieval Town Tilemap"
  (Duomo stilizzato, porta con torri, fontana, panchina, lampione, statua,
  carro del mercato — ritagliati in `img/tilesets/orvieto/stamps/`). Il
  motore (`js/tiledMap.js` + `TileLayerSprite`/`Sprite` in `classes.js`)
  legge i layer per nome, quindi si può ridisegnare in Tiled senza toccare
  il codice.
- **Sprite provvisorio di Sere**: `img/sere/*.png`, capelli ricolorati in
  castano scuro a partire dal placeholder del progetto base
  (`scripts/recolorSereSprite.py`).

## Cosa manca ancora (non bloccante per una prima versione)

La mappa `data/maps/orvietoPiazza.json` mescola asset reali (edifici,
fontana, arredi — dal pacchetto "Medieval Town Tilemap" acquistato
dall'autore del progetto) con una griglia di terreno ancora segnaposto
(tile a colore pieno per selciato/erba alta/vicolo, invece del vero
tileset "ground" del pacchetto, che contiene solo pattern speciali per
muri/pavimentazioni circolari, non un tile di terreno generico ripetibile).
Per completarla:

1. Procurarsi (o ritagliare dal pacchetto già presente in
   `img/tilesets/orvieto/`) dei tile di terreno base ripetibili
   (selciato, erba, sterrato) — il pacchetto attuale copre edifici e
   arredi ma non terreno generico.
2. Aprire `data/maps/orvietoPiazza.json` in **Tiled** per ridisegnare i
   layer `terreno`/`collisioni`/`erba_alta` col tileset vero, e per
   aggiungere/spostare gli oggetti nei layer `npc`/`ingressi`/`edifici`.
3. Ri-esportare come JSON: `js/tiledMap.js` legge i layer per nome, quindi
   funziona senza modifiche finché i nomi restano questi. Gli oggetti nel
   layer `edifici` usano coordinate in pixel-mondo (scala 48px/tile) e una
   proprietà `image` che punta al file dello stamp da disegnare — vedi
   `index.js` per come vengono letti.

Altri edifici/arredi del pacchetto sono già ritagliati e pronti in
`img/tilesets/orvieto/stamps/` (case in stile Tudor, negozio rosa, torre a
cupola, bancarella di fiori, cartelli) ma non ancora posizionati sulla
mappa: aggiungerli è solo questione di nuovi oggetti nel layer `edifici`.

Allo stesso modo lo sprite di Sere è una ricolorazione provvisoria del
placeholder base, non un vero artwork dedicato (idem per gli NPC umani della
storia, Tina/il Merlo/ecc., che per ora non hanno ancora uno sprite proprio
e quindi non compaiono ancora nel mondo, anche se i loro dialoghi sono già
pronti in `data/dialogues/dialogues.js`).

Gli sprite dei Pokémon in battaglia sono caricati da un URL pubblico
(sprite classici di PokéAPI) invece che da file locali: funziona bene per un
link condiviso online (GitHub Pages), ma richiede una connessione Internet
quando si gioca. Per un gioco realmente offline, rilanciare
`scripts/fetchPokemonData.js --sprites` per scaricare i PNG in
`img/pokemon/` e aggiornare `pokemonSpriteUrl()` in
`data/pokemonSprites.js` perché punti lì.

Altri punti aperti elencati nei requisiti (missioni/eventi della trama
Sdeng, scena dei Grimer notturni, bilanciamento della cattura/livelli): vedi
`docs/REQUISITI.md`, sezione 14.

## Sviluppo locale

Nessun build step: apri `index.html` in un browser, o servilo con un
piccolo server statico (es. `npx serve .`) per evitare limitazioni di
alcuni browser sui file caricati da `file://`.

Per rigenerare `data/pokemon.json` (e il suo wrapper `data/pokemon.js`) con
dati aggiornati da PokéAPI:

```bash
node scripts/fetchPokemonData.js            # aggiorna solo i dati
node scripts/fetchPokemonData.js --sprites  # scarica anche gli sprite in img/pokemon/
```

Per rigenerare lo sprite provvisorio di Sere da `img/player*.png` (richiede
`pip install Pillow`):

```bash
python3 scripts/recolorSereSprite.py
```

## Deployment

Push su `main` pubblica automaticamente su GitHub Pages tramite
`.github/workflows/deploy.yml`.

## Licenza

MIT, ereditata dal progetto base `ManaJBin/pokemon` (vedi `LICENSE`).
