// Carica una mappa esportata in formato Tiled (requisiti, sezione 2 e 4):
// legge i layer per nome invece che assumerne l'ordine, così una mappa
// ridisegnata in Tiled con lo stesso schema di nomi funziona senza toccare
// il motore. Vedi data/maps/orvietoPiazza.js per un esempio (placeholder).
function loadTiledMap(mapData) {
  const getLayer = (name) => mapData.layers.find((l) => l.name === name)

  function tileLayerToGrid(name) {
    const layer = getLayer(name)
    if (!layer) return null
    const grid = []
    for (let y = 0; y < layer.height; y++) {
      grid.push(layer.data.slice(y * layer.width, (y + 1) * layer.width))
    }
    return grid
  }

  return {
    width: mapData.width,
    height: mapData.height,
    tileSize: mapData.tilewidth,
    terrenoGrid: tileLayerToGrid('terreno'),
    // Layer separato per gli oggetti con margini trasparenti (alberi, ecc.):
    // disegnato sopra il terreno invece di sovrascriverne le celle, così
    // l'erba sotto resta visibile nei margini vuoti dello sprite.
    decorazioniGrid: tileLayerToGrid('decorazioni'),
    collisioniGrid: tileLayerToGrid('collisioni'),
    erbaAltaGrid: tileLayerToGrid('erba_alta'),
    npcObjects: getLayer('npc')?.objects || [],
    ingressiObjects: getLayer('ingressi')?.objects || [],
    spawnObjects: getLayer('spawn')?.objects || []
  }
}
