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
- **Mappa in formato Tiled**: `data/maps/orvietoPiazza.json`, una piazza
  disegnata con un vero tileset a griglia 16x16 in stile Pokémon classico
  (`img/tileset-v2/tileset.png`): erba, laghetto, prato fiorito (zona
  incontri), alberi, e tre edifici (un "Centro", un negozio, una casa)
  composti incollando i blocchi di tile giusti nella griglia — non più
  immagini "timbro" separate. Gli oggetti con margini trasparenti (alberi,
  edifici dal tetto spiovente) stanno in un layer `decorazioni` disegnato
  sopra il `terreno`, così l'erba sotto resta visibile. Il motore
  (`js/tiledMap.js` + `TileLayerSprite` in `classes.js`) legge i layer per
  nome, quindi si può ridisegnare in Tiled senza toccare il codice.
- **NPC e sfondo di battaglia aggiornati**: villager/anziano usano ora due
  personaggi del pacchetto overworld (`img/characters-pack/`, sprite a 4
  direzioni — ne uso solo la riga "verso il basso", essendo NPC fermi sul
  posto); lo sfondo di battaglia è uno sfondo dipinto vero
  (`img/backgrounds/background1.png`) al posto del placeholder del
  progetto base.
- **Sprite provvisorio di Sere**: `img/sere/*.png`, capelli ricolorati in
  castano scuro a partire dal placeholder del progetto base
  (`scripts/recolorSereSprite.py`).

## Asset disponibili ma non ancora usati

Il pacchetto caricato include anche altro materiale, organizzato in
`img/` ma non ancora agganciato al motore:

- `img/attack-effects/` (7): animazioni per gli attacchi (es. spruzzi
  d'acqua) — utilizzabili per arricchire `Monster.attack()` in `classes.js`
- `img/ui/` (15): icone per barra HP (`baricon*`) e pulsanti di menu
  (`options*`)
- `img/characters-pack/` (10 interi): altri personaggi overworld completi
  a 4 direzioni, oltre ai due già usati per gli NPC generici
- `img/monsters-pack/` (16 mostri con forma base+evoluzione, animazioni
  idle/attacco, icone menu): creature **originali**, non i Pokémon veri —
  di proposito non usate in battaglia per mantenere il legame con la
  storia (Meowth di Sere, Charizard il collega, ecc. — vedi requisiti,
  sezione 6). Il gioco continua a usare gli sprite reali da PokéAPI.

## Cosa manca ancora (non bloccante per una prima versione)

La mappa `data/maps/orvietoPiazza.json` è funzionale e usa asset veri, ma
resta una piazza piccola e semplice: aggiungere più edifici/vicoli/aree
(es. sotterranea per la Rupe) è solo questione di tempo di composizione in
Tiled con lo stesso tileset, non di asset mancanti.

Lo sprite di Sere resta una ricolorazione provvisoria del placeholder
base, non un vero artwork dedicato. I personaggi della storia (Tina, il
Merlo, Zapdos, Gengar, il padre "Kraken") non hanno ancora uno sprite
proprio e quindi non compaiono nel mondo, anche se i loro dialoghi sono già
pronti in `data/dialogues/dialogues.js` — i 10 personaggi in
`img/characters-pack/` sono candidati papabili se nessuno ha già un design
più specifico in mente.

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
