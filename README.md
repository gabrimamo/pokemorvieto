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
  il padre "Kraken", oltre all'introduzione di Sere).

## Cosa manca ancora (non bloccante per una prima versione)

La mappa di gioco (collisioni, zone di erba alta, posizioni NPC) è ancora
quella placeholder del progetto base ("Pellet Town"): la vera mappa di
Orvieto va disegnata in **Tiled** con il tileset scelto (vedi requisiti,
sezioni 4 e 13) e non è stata inclusa qui perché richiede il software Tiled
e gli asset grafici, non ancora procurati. Allo stesso modo mancano gli
sprite dedicati a Sere e agli NPC umani della storia (Tina, il Merlo, ecc.):
per ora usano i placeholder del progetto base.

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

## Deployment

Push su `main` pubblica automaticamente su GitHub Pages tramite
`.github/workflows/deploy.yml`.

## Licenza

MIT, ereditata dal progetto base `ManaJBin/pokemon` (vedi `LICENSE`).
