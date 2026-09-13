const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// L'overlay HTML della battaglia (#userInterface: barre HP, dialogo, menu
// attacchi) è scritto in coordinate fisse 1024x576, le stesse del canvas.
// Ma il canvas usa object-fit:contain: la sua BOX CSS riempie lo schermo,
// mentre il bitmap disegnato viene "lettera-box-ato" a un'area più piccola
// su schermi con proporzioni diverse dal 16:9 (tipicamente i telefoni in
// verticale). Senza questo aggiustamento l'overlay resta ancorato alla box
// intera invece che all'area realmente disegnata, apparendo scollegato
// dalla scena di battaglia su mobile.
function syncBattleOverlayTransform() {
  const container = document.querySelector('#gameContainer')
  const overlay = document.querySelector('#userInterface')
  if (!container || !overlay) return
  const scale = Math.min(
    container.clientWidth / canvas.width,
    container.clientHeight / canvas.height
  )
  const offsetX = (container.clientWidth - canvas.width * scale) / 2
  const offsetY = (container.clientHeight - canvas.height * scale) / 2
  overlay.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
}
syncBattleOverlayTransform()
window.addEventListener('resize', syncBattleOverlayTransform)
window.addEventListener('orientationchange', syncBattleOverlayTransform)

const CELL = Boundary.width // 48px a schermo per ogni tile della mappa

// Registro delle mappe (requisiti, sezione 2 e 4): ogni mappa è un file
// Tiled + il tileset da usare per disegnarla. Aggiungerne una nuova è solo
// questione di una nuova voce qui, nessuna modifica al motore sotto.
const MAPS = {
  piazza: {
    data: orvietoPiazzaMap,
    tilesetSrc: './img/tileset-v2/tileset.png'
  },
  rupeDungeon: {
    data: rupeDungeonMap,
    tilesetSrc: './img/tileset-dungeon-placeholder/tileset.png',
    // Celle (riga, colonna) del cancello che la leva del dungeon apre: tre
    // caselle affiancate, non una sola. La hitbox del giocatore riposa
    // esattamente a metà tile (player.x = canvas.width/2 - 24), quindi un
    // varco di una sola casella allineato alla griglia la blocca sempre
    // contro il muro adiacente, a prescindere da quale dei due lati.
    gateCells: [
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 6, col: 6 }
    ]
  }
}

const tilesetImageCache = {}
function getTilesetImage(src) {
  if (!tilesetImageCache[src]) {
    const img = new Image()
    img.src = src
    tilesetImageCache[src] = img
  }
  return tilesetImageCache[src]
}

const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'
const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

const npcSpriteImages = {
  villager: villagerImg,
  oldMan: oldManImg,
  zapdos: loadNpcStoryImage('zapdos'),
  tina: loadNpcStoryImage('tina'),
  merlo: loadNpcStoryImage('merlo'),
  gengar: loadNpcStoryImage('gengar')
}
function loadNpcStoryImage(name) {
  const img = new Image()
  img.src = `./img/npc-story/${name}.png`
  return img
}

const entranceMarkerImage = new Image()
entranceMarkerImage.src = './img/markers/entrance.png'

function propertyValue(object, name) {
  return object.properties?.find((p) => p.name === name)?.value
}

function dialogueFor(dialogueKey) {
  const repeatKey = dialogueKey + 'Repeat'
  if (hasSeenDialogue(dialogueKey) && dialogues[repeatKey]) {
    return dialogues[repeatKey]
  }
  return dialogues[dialogueKey] || ['...']
}

// --- Trama "progetto Chiarore" (requisiti, sezione 5 e 14) ---
// storyState.flags.sdengStage avanza parlando, in ordine, con Zapdos (0->1),
// Tina (1->2), il Merlo (2->3), Gengar (3->4); risolvendo la scena di
// Grimer nel dungeon si passa a 5; tornando da Zapdos si chiude a 6.
function getSdengStage() {
  return storyState.flags.sdengStage || 0
}
function setSdengStage(stage) {
  storyState.flags.sdengStage = stage
}

const STORY_TRIGGERS = { zapdos: 0, tina: 1, merlo: 2, gengar: 3 }
const STORY_PLOT_DIALOGUE = {
  zapdos: dialogues.zapdosPlot1,
  tina: dialogues.tinaPlot,
  merlo: dialogues.merloPlot,
  gengar: dialogues.gengarPlot
}

function storyDialogueFor(npcKey) {
  const stage = getSdengStage()

  if (npcKey === 'zapdos' && stage === 5) {
    return { lines: dialogues.zapdosPlot2, advanceTo: 6 }
  }

  const trigger = STORY_TRIGGERS[npcKey]
  if (stage === trigger) {
    return { lines: STORY_PLOT_DIALOGUE[npcKey], advanceTo: trigger + 1 }
  }
  if (stage > trigger) {
    return { lines: dialogueFor(npcKey) }
  }
  return { lines: dialogues[npcKey] || ['...'] }
}

// --- Costruzione del mondo a partire da una mappa Tiled ---
// Tutto ciò che dipende dalla mappa attiva (terreno, collisioni, NPC,
// zone di transizione/battaglia) viene ricostruito qui; player/tastiera/
// stato di battaglia restano invariati tra un cambio mappa e l'altro.
let currentMapId
let map
let offset
let terrainLayer
let decorationLayer
let boundaries
let battleZones
let characters
let transitionZones
let grimerZones
let movables
let renderables

function buildCharacterFromNpcObject(obj, mapData) {
  const dialogueKey = propertyValue(obj, 'dialogueKey')
  const storyCharacter = propertyValue(obj, 'storyCharacter')
  const spriteKey = propertyValue(obj, 'sprite')
  const position = {
    x: obj.x * (CELL / mapData.tileSize) + offset.x,
    y: obj.y * (CELL / mapData.tileSize) + offset.y
  }

  const character = new Character({
    position,
    image: npcSpriteImages[spriteKey] || npcSpriteImages.villager,
    frames: { max: 4, hold: 20 },
    scale: 1.5,
    animate: true,
    dialogue: ['...']
  })

  if (storyCharacter) {
    let pendingAdvance = null
    character.getDialogue = () => {
      const result = storyDialogueFor(storyCharacter)
      pendingAdvance = result.advanceTo ?? null
      return result.lines
    }
    character.action = () => {
      if (pendingAdvance != null) {
        setSdengStage(pendingAdvance)
        pendingAdvance = null
      }
    }
  } else {
    character.dialogueKey = dialogueKey
    character.dialogue = dialogueFor(dialogueKey)
  }

  return { character, position }
}

function buildWorld(mapId, spawnName, forcedOffset) {
  const mapConfig = MAPS[mapId]
  map = loadTiledMap(mapConfig.data)
  const tilesetImage = getTilesetImage(mapConfig.tilesetSrc)
  const tileScale = CELL / map.tileSize

  const spawnObj =
    map.spawnObjects.find((o) => o.name === spawnName) || map.spawnObjects[0]
  offset = forcedOffset || {
    x: canvas.width / 2 - spawnObj.x * tileScale,
    y: canvas.height / 2 - spawnObj.y * tileScale
  }

  terrainLayer = new TileLayerSprite({
    position: { x: offset.x, y: offset.y },
    grid: map.terrenoGrid,
    tileset: tilesetImage,
    tileSize: map.tileSize,
    cellSize: CELL
  })
  decorationLayer = new TileLayerSprite({
    position: { x: offset.x, y: offset.y },
    grid: map.decorazioniGrid,
    tileset: tilesetImage,
    tileSize: map.tileSize,
    cellSize: CELL
  })

  boundaries = []
  map.collisioniGrid.forEach((row, i) => {
    row.forEach((gid, j) => {
      if (gid) {
        boundaries.push(
          new Boundary({
            position: { x: j * CELL + offset.x, y: i * CELL + offset.y }
          })
        )
      }
    })
  })

  battleZones = []
  map.erbaAltaGrid.forEach((row, i) => {
    row.forEach((gid, j) => {
      if (gid) {
        battleZones.push(
          new Boundary({
            position: { x: j * CELL + offset.x, y: i * CELL + offset.y }
          })
        )
      }
    })
  })

  characters = []
  map.npcObjects.forEach((obj) => {
    const { character, position } = buildCharacterFromNpcObject(obj, map)
    characters.push(character)
    // Come nel progetto base, un NPC blocca anche il passaggio.
    boundaries.push(new Boundary({ position: { x: position.x, y: position.y } }))
  })

  map.ingressiObjects.forEach((obj) => {
    const dialogueKey = propertyValue(obj, 'dialogueKey')
    const position = {
      x: obj.x * tileScale + offset.x,
      y: obj.y * tileScale + offset.y
    }
    const character = new Character({
      position,
      image: entranceMarkerImage,
      frames: { max: 1, hold: 1 },
      scale: 3,
      dialogue: dialogueFor(dialogueKey)
    })
    character.dialogueKey = dialogueKey
    characters.push(character)
  })

  // Eventi di gioco (requisiti, sezione 9): leve, transizioni tra mappe,
  // trigger di battaglie scriptate come la scena di Grimer nel dungeon.
  transitionZones = []
  grimerZones = []
  map.eventiObjects.forEach((obj) => {
    const position = {
      x: obj.x * tileScale + offset.x,
      y: obj.y * tileScale + offset.y
    }
    const size = { width: obj.width * tileScale, height: obj.height * tileScale }

    if (obj.type === 'transition') {
      transitionZones.push({
        ...size,
        position,
        targetMap: propertyValue(obj, 'targetMap'),
        targetSpawn: propertyValue(obj, 'targetSpawn')
      })
    } else if (obj.type === 'grimerTrigger') {
      grimerZones.push({ ...size, position })
    } else if (obj.type === 'lever') {
      const dialogueKey = propertyValue(obj, 'dialogueKey')
      const character = new Character({
        position,
        image: entranceMarkerImage,
        frames: { max: 1, hold: 1 },
        scale: 3,
        dialogue: dialogueFor(dialogueKey)
      })
      character.dialogueKey = dialogueKey
      character.action = () => openGate(mapId)
      characters.push(character)
    }
  })

  // transitionZones/grimerZones vanno inclusi in movables come tutto il
  // resto del mondo (boundaries, battleZones, characters): altrimenti
  // restano ancorati alla posizione calcolata al momento di buildWorld()
  // e si scollegano dal resto della mappa al primo passo del giocatore,
  // diventando di fatto irraggiungibili camminando normalmente.
  movables = [
    terrainLayer,
    decorationLayer,
    ...boundaries,
    ...battleZones,
    ...characters,
    ...transitionZones,
    ...grimerZones
  ]
  renderables = [
    terrainLayer,
    decorationLayer,
    ...boundaries,
    ...battleZones,
    ...characters,
    player
  ]

  currentMapId = mapId
}

// Apre il cancello del dungeon: cambia i tile a "pavimento" e rimuove le
// collisioni corrispondenti (requisiti, sezione 9 — enigma in stile Zelda).
function openGate(mapId) {
  const gateCells = MAPS[mapId].gateCells
  if (!gateCells) return
  const gatePositions = gateCells.map((cell) => {
    terrainLayer.grid[cell.row][cell.col] = 1 // gid 1 = pavimento
    return { x: cell.col * CELL + offset.x, y: cell.row * CELL + offset.y }
  })
  const isGateBoundary = (b) =>
    b instanceof Boundary &&
    gatePositions.some((g) => b.position.x === g.x && b.position.y === g.y)

  boundaries = boundaries.filter((b) => !isGateBoundary(b))
  movables = movables.filter((m) => !isGateBoundary(m))
  renderables = renderables.filter((r) => !isGateBoundary(r))
}

function switchMap(mapId, spawnName) {
  keys.w.pressed = false
  keys.a.pressed = false
  keys.s.pressed = false
  keys.d.pressed = false
  gsap.to('#overlappingDiv', {
    opacity: 1,
    duration: 0.3,
    onComplete: () => {
      buildWorld(mapId, spawnName)
      gsap.to('#overlappingDiv', { opacity: 0, duration: 0.3 })
    }
  })
}

// Battaglia scriptata (scena di Grimer nel dungeon): sovrascrive il
// prossimo incontro invece di pescare dal pool casuale. Letta da
// battleScene.js in initBattle().
let pendingScriptedMonster = null
let inGrimerScriptedBattle = false

function triggerGrimerEncounter() {
  if (storyState.flags.grimerDone) return
  // Come per l'incontro casuale: senza cancellare il loop del mondo, questo
  // continuerebbe a girare in parallelo a quello di battaglia (nessun
  // effetto visibile grazie a "if (battle.initiated) return", ma due
  // requestAnimationFrame attivi per sempre non hanno motivo di esistere).
  window.cancelAnimationFrame(mainAnimationId)
  inGrimerScriptedBattle = true
  pendingScriptedMonster = createMonsterFromDex('grimer', {
    isEnemy: true,
    level: 8,
    position: { x: 800, y: 100 }
  })
  battle.initiated = true
  document.querySelector('#touchControls').style.display = 'none'
  audio.Map.stop()
  audio.initBattle.play()
  audio.battle.play()
  gsap.to('#overlappingDiv', {
    opacity: 1,
    repeat: 3,
    yoyo: true,
    duration: 0.4,
    onComplete() {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.4,
        onComplete() {
          initBattle()
          animateBattle()
          gsap.to('#overlappingDiv', { opacity: 0, duration: 0.4 })
        }
      })
    }
  })
}

// Chiamata da battleScene.js quando la battaglia scriptata con Grimer
// finisce (cattura o svenimento): rivela il progetto Chiarore e avanza
// la trama.
function onGrimerBattleResolved() {
  storyState.flags.grimerDone = true
  setSdengStage(5)
  player.interactionAsset = {
    dialogue: dialogues.dungeonPostGrimer,
    dialogueIndex: 0
  }
  player.isInteracting = true
  showDialogueBox(dialogues.dungeonPostGrimer[0])
}

// Il player va creato PRIMA della prima buildWorld(): quest'ultima lo
// include già in renderables, quindi deve esistere fin dalla prima chiamata
// (sia all'avvio sia dopo un cambio mappa via switchMap()).
const playerDownImage = new Image()
playerDownImage.src = './img/sere/sereDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/sere/sereUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/sere/sereLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/sere/sereRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})

// Il salvataggio va letto PRIMA di costruire il mondo, così l'offset
// iniziale è già quello giusto (niente da "correggere" dopo).
const savedOffset = loadSavedState()
buildWorld('piazza', 'playerSpawn', savedOffset)

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false }
}

const battle = {
  initiated: false
}

// Squadra iniziale: Meowth, compagno fedele di Sere (requisiti, sezione 5/6).
// No-op se la squadra è già stata popolata da un salvataggio.
teamEnsureStarter()

// Il riquadro del dialogo copre il D-pad/pulsante Azione su schermi piccoli
// (entrambi ancorati in basso): nascondere i controlli touch mentre un
// dialogo è aperto evita che restino a metà coperti, visivamente rotti.
function showDialogueBox(text) {
  const box = document.querySelector('#characterDialogueBox')
  box.innerHTML = text
  box.style.display = 'flex'
  const controls = document.querySelector('#touchControls')
  if (controls) controls.style.display = 'none'
}

function hideDialogueBox() {
  document.querySelector('#characterDialogueBox').style.display = 'none'
  const controls = document.querySelector('#touchControls')
  if (controls) controls.style.display = 'flex'
}

// Monologo introduttivo di Sere, solo alla primissima partita (nessun
// salvataggio esistente ancora).
function playIntroIfNeeded() {
  if (savedOffset) return
  player.interactionAsset = { dialogue: dialogues.sereIntro, dialogueIndex: 0 }
  player.isInteracting = true
  showDialogueBox(dialogues.sereIntro[0])
}
playIntroIfNeeded()

// Globale (non locale ad animate()) perché va cancellato anche da fuori,
// es. da triggerGrimerEncounter(), che avvia una battaglia scriptata senza
// passare dal ramo "incontro casuale" qui sotto.
let mainAnimationId
function animate() {
  mainAnimationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  if (battle.initiated) return

  // Transizioni tra mappe (requisiti, sezione 4): sovrapporsi a una zona
  // basta, non serve premere il tasto azione (come gli ingressi di grotte
  // nei giochi Pokémon classici).
  if (window.__debugTransitions) {
    console.log('DEBUG tick, transitionZones.length=', transitionZones.length, 'player.pos=', JSON.stringify(player.position), 'currentMapId=', currentMapId)
  }
  for (const zone of transitionZones) {
    if (rectangularCollision({ rectangle1: player, rectangle2: zone })) {
      if (window.__debugTransitions) console.log('DEBUG MATCH switching to', zone.targetMap)
      switchMap(zone.targetMap, zone.targetSpawn)
      return
    }
  }

  // Scena scriptata di Grimer (requisiti, sezione 4 e 14): un solo
  // incontro forzato, non ripetibile una volta risolto.
  if (!storyState.flags.grimerDone) {
    for (const zone of grimerZones) {
      if (rectangularCollision({ rectangle1: player, rectangle2: zone })) {
        triggerGrimerEncounter()
        return
      }
    }
  }

  // activate a battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01 &&
        teamHasUsableMember()
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(mainAnimationId)

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiated = true
        // I controlli touch sono ancorati in basso come il menu di
        // battaglia: senza nasconderli si sovrappongono ai pulsanti
        // d'attacco su schermi stretti.
        document.querySelector('#touchControls').style.display = 'none'
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop
                initBattle()
                animateBattle()
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4
                })
              }
            })
          }
        })
        break
      }
    }
  }

  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: 3 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y += 3
      })
      offset.y += 3
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 3, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += 3
      })
      offset.x += 3
    }
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: -3 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= 3
      })
      offset.y -= 3
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: -3, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= 3
      })
      offset.x -= 3
    }
  }
}
// animate()

let lastKey = ''

// --- Input condiviso da tastiera e controlli touch (requisiti, sezione 10) ---
function handleDirectionDown(key) {
  if (player.isInteracting) return
  keys[key].pressed = true
  lastKey = key
}

function handleDirectionUp(key) {
  keys[key].pressed = false
}

function handleInteract() {
  if (player.isInteracting) {
    player.interactionAsset.dialogueIndex++

    const { dialogueIndex, dialogue } = player.interactionAsset
    if (dialogueIndex <= dialogue.length - 1) {
      document.querySelector('#characterDialogueBox').innerHTML =
        dialogue[dialogueIndex]
      return
    }

    // finish conversation
    if (player.interactionAsset.dialogueKey) {
      markDialogueSeen(player.interactionAsset.dialogueKey)
    }
    if (player.interactionAsset.action) {
      player.interactionAsset.action()
    }
    player.interactionAsset.dialogueIndex = 0
    player.isInteracting = false
    // Senza questo reset, premere di nuovo il tasto azione senza essersi
    // mossi (es. dopo il monologo iniziale di Sere, che non è un NPC nel
    // mondo controllato da checkForCharacterCollision) fa ripartire la
    // stessa conversazione da capo invece di restare chiusa.
    player.interactionAsset = null
    hideDialogueBox()
    return
  }

  if (!player.interactionAsset) return

  // beginning the conversation
  const dialogue = player.interactionAsset.getDialogue
    ? player.interactionAsset.getDialogue()
    : player.interactionAsset.dialogue
  player.interactionAsset.dialogue = dialogue
  showDialogueBox(dialogue[0])
  player.isInteracting = true
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case ' ':
      handleInteract()
      break
    case 'w':
      handleDirectionDown('w')
      break
    case 'a':
      handleDirectionDown('a')
      break
    case 's':
      handleDirectionDown('s')
      break
    case 'd':
      handleDirectionDown('d')
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      handleDirectionUp('w')
      break
    case 'a':
      handleDirectionUp('a')
      break
    case 's':
      handleDirectionUp('s')
      break
    case 'd':
      handleDirectionUp('d')
      break
  }
})

// Il riquadro del dialogo è "tappabile" per farlo avanzare: su mobile il
// pulsante Azione finisce sotto al riquadro stesso quando un dialogo è
// aperto, quindi serve un modo per proseguire toccando il testo (come già
// succede per il dialogo di battaglia in battleScene.js).
document.querySelector('#characterDialogueBox').addEventListener('click', () => {
  handleInteract()
})

let clicked = false
addEventListener('click', () => {
  if (!clicked) {
    audio.Map.play()
    clicked = true
  }
})

// --- HUD: squadra e salvataggio (requisiti, sezione 3.3 e 3.4) ---
document.querySelector('#teamButton').addEventListener('click', () => {
  renderTeamMenu()
  document.querySelector('#teamMenu').style.display = 'flex'
})

document.querySelector('#closeTeamMenu').addEventListener('click', () => {
  document.querySelector('#teamMenu').style.display = 'none'
})

document.querySelector('#saveButton').addEventListener('click', () => {
  const ok = saveGame()
  showSaveFeedback(ok ? 'Partita salvata!' : 'Errore nel salvataggio')
})
