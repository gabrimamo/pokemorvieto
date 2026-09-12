// Pool di incontri selvatici per la prima area (grotte di tufo / campagna).
// In futuro ogni zona di erba alta/dungeon avrà il proprio pool dedicato;
// per ora è un unico elenco condiviso (vedi requisiti, sezione 9).
const wildEncounterPool = [
  'geodude',
  'zubat',
  'psyduck',
  'sandshrew',
  'paras',
  'diglett',
  'rattata',
  'oddish',
  'poliwag',
  'growlithe',
  'bellsprout',
  'vulpix',
  'cubone',
  'machop'
]

const STARTER_POKEMON_NAME = 'meowth'

function createMonsterFromDex(name, { isEnemy = false, level = 5, position } = {}) {
  const info = findPokemonByName(name)
  if (!info) throw new Error(`Pokémon sconosciuto: ${name}`)

  const image = new Image()
  // Il Pokémon del giocatore si vede di spalle, quello selvatico di fronte,
  // come nei giochi Pokémon classici.
  image.src = pokemonSpriteUrl(info.id, { back: !isEnemy })

  return new Monster({
    position,
    image,
    frames: { max: 1, hold: 10 },
    animate: false,
    isEnemy,
    name: info.displayName,
    attacks: [attacks.Tackle, attacks.Fireball],
    level,
    types: info.types,
    catchRate: info.catchRate,
    dexId: info.id
  })
}

// Costruisce un Monster di battaglia a partire da un record di squadra
// salvato (mantiene HP correnti invece di ripartire da 100/100).
function createMonsterFromRecord(record, position) {
  const info = findPokemonById(record.dexId)
  if (!info) throw new Error(`Pokémon sconosciuto in squadra: ${record.dexId}`)

  const image = new Image()
  image.src = pokemonSpriteUrl(info.id, { back: true })

  const monster = new Monster({
    position,
    image,
    frames: { max: 1, hold: 10 },
    animate: false,
    isEnemy: false,
    name: info.displayName,
    attacks: [attacks.Tackle, attacks.Fireball],
    level: record.level,
    types: info.types,
    catchRate: info.catchRate,
    dexId: info.id
  })
  monster.health = record.health
  monster.maxHealth = record.maxHealth
  return monster
}

function pickWildMonster(position) {
  const name =
    wildEncounterPool[Math.floor(Math.random() * wildEncounterPool.length)]
  const level = 3 + Math.floor(Math.random() * 5)
  return createMonsterFromDex(name, { isEnemy: true, level, position })
}
