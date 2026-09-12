#!/usr/bin/env node
/**
 * Script una tantum: scarica da PokeAPI (https://pokeapi.co) i dati dei 35
 * Pokémon del roster di "Pokémon Orvieto" e li salva in data/pokemon.json,
 * così il gioco non dipende da chiamate API a runtime (funziona offline).
 *
 * Uso:
 *   node scripts/fetchPokemonData.js            # aggiorna data/pokemon.json
 *   node scripts/fetchPokemonData.js --sprites   # scarica anche gli sprite in img/pokemon/
 *
 * Richiede Node 18+ (fetch globale) e connessione a Internet.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const OUTPUT_FILE = path.join(ROOT, 'data', 'pokemon.json')
const JS_WRAPPER_FILE = path.join(ROOT, 'data', 'pokemon.js')
const SPRITES_DIR = path.join(ROOT, 'img', 'pokemon')

// Roster a tema Orvieto/storia di Sere (35 Pokémon, prima generazione).
// "role" è testo narrativo interno al progetto, non viene da PokeAPI.
const ROSTER = [
  { name: 'meowth', role: 'Compagno fedele di Sere, guardiano della magione e della cantina' },
  { name: 'persian', role: 'Evoluzione di Meowth' },
  { name: 'vulpix', role: 'Vive nella magione, elegante e poco incline allo scontro' },
  { name: 'geodude', role: 'Abita le grotte di tufo sotto la città, utile nei dungeon sotterranei' },
  { name: 'graveler', role: 'Evoluzione di Geodude' },
  { name: 'psyduck', role: 'Ispirato ai pozzi scavati nella roccia (tipo Pozzo di San Patrizio), tono comico' },
  { name: 'bellsprout', role: 'Legato alla vigna di famiglia' },
  { name: 'onix', role: 'Guardiano delle gallerie sotterranee, richiama la figura del padre "Kraken"' },
  { name: 'sandshrew', role: 'Fauna delle grotte/tufo' },
  { name: 'zubat', role: 'Popola i cunicoli e le grotte di tufo, incontro tipico nei passaggi bui' },
  { name: 'golbat', role: 'Evoluzione di Zubat, popola i cunicoli e le grotte di tufo' },
  { name: 'diglett', role: 'Vive nella rete di tunnel sotto la città' },
  { name: 'dugtrio', role: 'Evoluzione di Diglett, tra i tratti di passaggio sotterranei' },
  { name: 'cubone', role: "Legato alla necropoli etrusca fuori città, tema tombe/rovine antiche" },
  { name: 'machop', role: 'Lavora idealmente nelle cave di tufo' },
  { name: 'paras', role: "Cresce nell'umidità delle cantine e delle grotte" },
  { name: 'charmander', role: 'Collega dell\'ufficio design: ha sempre caldo, "non suda, brilla"' },
  { name: 'charmeleon', role: 'Evoluzione del collega Charmander' },
  { name: 'charizard', role: 'Evoluzione finale del collega Charmander/Charmeleon' },
  { name: 'growlithe', role: 'Fauna a tema fuoco/regione' },
  { name: 'oddish', role: 'Fauna campagna umbra' },
  { name: 'pidgey', role: '"Il Merlo": collega che fa promesse e sparisce, devoto a Zapdos' },
  { name: 'rattata', role: 'Fauna comune' },
  { name: 'poliwag', role: 'Fauna acquatica generica' },
  { name: 'squirtle', role: 'Fauna acquatica generica' },
  { name: 'krabby', role: '"Tina": collega temuta e rispettata del design system, controlla ogni dettaglio' },
  { name: 'kingler', role: 'Evoluzione di Tina/Krabby' },
  { name: 'tentacool', role: 'Fedele aiutante/destriero del padre di Sere' },
  { name: 'tentacruel', role: 'Evoluzione del destriero del padre di Sere' },
  { name: 'gastly', role: 'Cattivo con chi lo attacca, protettivo fino all\'ossessione con i suoi' },
  { name: 'haunter', role: 'Evoluzione di Gastly' },
  { name: 'gengar', role: 'Evoluzione finale, minaccioso ma protettivo' },
  { name: 'grimer', role: "Vive nel bosco fuori città, appare di notte, incarna la paura degli zombie di Sere" },
  { name: 'zapdos', role: "Manager dell'ufficio, sicura di sé, piena di opinioni su tutto" },
  { name: 'mew', role: 'Leggendario finale, traguardo conclusivo della storia' }
]

const STAT_NAME_MAP = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'spAttack',
  'special-defense': 'spDefense',
  speed: 'speed'
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.json()
}

function pickClassicSprite(sprites) {
  return (
    sprites?.versions?.['generation-i']?.['red-blue']?.front_default ||
    sprites?.versions?.['generation-i']?.yellow?.front_default ||
    sprites?.versions?.['generation-iii']?.['firered-leafgreen']?.front_default ||
    sprites?.front_default
  )
}

async function downloadSprite(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(destPath, buffer)
}

async function main() {
  const withSprites = process.argv.includes('--sprites')
  const results = []

  for (const entry of ROSTER) {
    process.stdout.write(`Fetching ${entry.name}... `)
    const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${entry.name}`)
    const species = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${entry.name}`)

    const baseStats = {}
    for (const s of data.stats) {
      const key = STAT_NAME_MAP[s.stat.name]
      if (key) baseStats[key] = s.base_stat
    }

    const spriteUrl = pickClassicSprite(data.sprites)

    if (withSprites && spriteUrl) {
      fs.mkdirSync(SPRITES_DIR, { recursive: true })
      await downloadSprite(spriteUrl, path.join(SPRITES_DIR, `${data.id}.png`))
    }

    results.push({
      id: data.id,
      name: data.name,
      displayName: entry.name[0].toUpperCase() + entry.name.slice(1),
      types: data.types.map((t) => t.type.name),
      baseStats,
      catchRate: species.capture_rate,
      role: entry.role
    })
    console.log('ok')
  }

  results.sort((a, b) => a.id - b.id)

  const output = {
    generatedBy: 'scripts/fetchPokemonData.js (PokeAPI, https://pokeapi.co)',
    spriteStyle: 'generation-i/red-blue (classic Game Boy style, falls back to front_default)',
    note: 'Dati offline: nessuna chiamata a PokeAPI viene fatta durante il gioco. Rilanciare lo script per rigenerare/aggiornare questo file quando serve.',
    pokemon: results
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n')

  const jsWrapper =
    "// Generato da data/pokemon.json (vedi scripts/fetchPokemonData.js).\n" +
    "// Wrapper .js così il browser può caricarlo con un semplice <script> tag,\n" +
    "// senza bisogno di fetch/CORS per leggere un file .json locale.\n" +
    "const pokemonData = " + JSON.stringify(output, null, 2) + "\n"
  fs.writeFileSync(JS_WRAPPER_FILE, jsWrapper)

  console.log(`\nScritto ${OUTPUT_FILE} e ${JS_WRAPPER_FILE} con ${results.length} Pokémon.`)
  if (withSprites) console.log(`Sprite salvati in ${SPRITES_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
