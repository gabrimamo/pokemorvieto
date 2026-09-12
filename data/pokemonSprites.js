// Costruisce l'URL dello sprite classico (stile Game Boy) di un Pokémon a
// partire dal suo numero di Pokédex, usando il repository di sprite
// pubblico di PokeAPI. Nessuna chiamata API viene fatta: è solo un URL di
// immagine, caricato dal browser come qualsiasi altra <img>/Image().
//
// Richiede una connessione a Internet quando il gioco gira (va bene per un
// link condiviso su GitHub Pages). Per un gioco davvero offline, rilanciare
// scripts/fetchPokemonData.js con --sprites per scaricare i PNG in
// img/pokemon/ e cambiare pokemonSpriteUrl() per puntare lì.
function pokemonSpriteUrl(dexId, { back = false } = {}) {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
  return back ? `${base}/back/${dexId}.png` : `${base}/${dexId}.png`
}

function findPokemonById(dexId) {
  return pokemonData.pokemon.find((p) => p.id === dexId)
}

function findPokemonByName(name) {
  return pokemonData.pokemon.find((p) => p.name === name.toLowerCase())
}
