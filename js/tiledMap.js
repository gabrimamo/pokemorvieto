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
    collisioniGrid: tileLayerToGrid('collisioni'),
    erbaAltaGrid: tileLayerToGrid('erba_alta'),
    npcObjects: getLayer('npc')?.objects || [],
    ingressiObjects: getLayer('ingressi')?.objects || [],
    spawnObjects: getLayer('spawn')?.objects || [],
    // A differenza degli altri layer oggetto, "edifici" usa coordinate in
    // pixel-mondo (scala già a 48px/tile) invece che in unità della griglia
    // a 16px: sono stamp di dimensione libera (edifici, fontane, ecc.), non
    // allineati alla griglia dei tile. Vedi requisiti sezione 4 e 13.
    edificiObjects: getLayer('edifici')?.objects || []
  }
}
