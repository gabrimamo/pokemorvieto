const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// Mappa "Piazza Duomo" (placeholder Tiled) — requisiti, sezione 2 e 4.
// Sostituibile aprendo data/maps/orvietoPiazza.json in Tiled e cambiando il
// tileset, senza toccare il motore (js/tiledMap.js).
const map = loadTiledMap(orvietoPiazzaMap)
const CELL = Boundary.width // 48px a schermo per ogni tile della mappa
const TILE_SCALE = CELL / map.tileSize

const tilesetImage = new Image()
tilesetImage.src = './img/tilesets/orvieto-placeholder.png'

// Il salvataggio va letto PRIMA di posizionare qualunque cosa nel mondo,
// così l'offset iniziale è già quello giusto (niente da "correggere" dopo).
const savedOffset = loadSavedState()
const spawn = map.spawnObjects[0] || { x: 0, y: 0 }
const offset = savedOffset || {
  x: canvas.width / 2 - spawn.x * TILE_SCALE,
  y: canvas.height / 2 - spawn.y * TILE_SCALE
}

const terrainLayer = new TileLayerSprite({
  position: { x: offset.x, y: offset.y },
  grid: map.terrenoGrid,
  tileset: tilesetImage,
  tileSize: map.tileSize,
  cellSize: CELL
})

const boundaries = []
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

const battleZones = []
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

const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

const npcSpriteImages = { villager: villagerImg, oldMan: oldManImg }
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

const characters = []

// NPC del mondo (requisiti, sezione 8): sprite placeholder finché non
// arrivano gli asset dedicati a Orvieto (vedi requisiti, sezione 13).
map.npcObjects.forEach((obj) => {
  const dialogueKey = propertyValue(obj, 'dialogueKey')
  const spriteKey = propertyValue(obj, 'sprite')
  const position = {
    x: obj.x * TILE_SCALE + offset.x,
    y: obj.y * TILE_SCALE + offset.y
  }

  const character = new Character({
    position,
    image: npcSpriteImages[spriteKey] || npcSpriteImages.villager,
    frames: { max: 4, hold: 60 },
    scale: 3,
    animate: true,
    dialogue: dialogueFor(dialogueKey)
  })
  character.dialogueKey = dialogueKey
  characters.push(character)

  // Come nel progetto base, un NPC blocca anche il passaggio.
  boundaries.push(
    new Boundary({ position: { x: position.x, y: position.y } })
  )
})

// Punti di interazione che non sono NPC (per ora solo l'ingresso della
// Rupe): stesso sistema di dialogo, marcatore grafico diverso.
map.ingressiObjects.forEach((obj) => {
  const dialogueKey = propertyValue(obj, 'dialogueKey')
  const position = {
    x: obj.x * TILE_SCALE + offset.x,
    y: obj.y * TILE_SCALE + offset.y
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

// Edifici/decorazioni dal vero tileset "Medieval Town Tilemap" (requisiti,
// sezione 4 e 13): coordinate già in pixel-mondo, non serve TILE_SCALE.
// Ogni riquadro di collisione è un'approssimazione della sola base
// dell'edificio (il tetto, più alto, resta solo visivo, come nei giochi
// Pokémon classici).
function addBoundaryRect(x, y, width, height) {
  for (let by = y; by < y + height; by += CELL) {
    for (let bx = x; bx < x + width; bx += CELL) {
      boundaries.push(new Boundary({ position: { x: bx, y: by } }))
    }
  }
}

const BUILDING_FOOTPRINTS = {
  duomo: { fromBottom: 90 },
  torretta: { fromBottom: 60 },
  fontana: { fromBottom: 40 },
  statua: { fromBottom: 40 },
  carroMercato: { fromBottom: 40 }
}

const stampImageCache = {}
function getStampImage(path) {
  if (!stampImageCache[path]) {
    const img = new Image()
    img.src = path
    stampImageCache[path] = img
  }
  return stampImageCache[path]
}

const buildingSprites = []
map.edificiObjects.forEach((obj) => {
  const imagePath = propertyValue(obj, 'image')
  const position = { x: obj.x + offset.x, y: obj.y + offset.y }
  const sprite = new Sprite({ position, image: getStampImage(imagePath) })
  buildingSprites.push(sprite)

  const footprint = BUILDING_FOOTPRINTS[obj.name]
  if (footprint) {
    addBoundaryRect(
      position.x,
      position.y + obj.height - footprint.fromBottom,
      obj.width,
      footprint.fromBottom
    )
  }
})

// La porta cittadina blocca solo le due torri, l'arco al centro resta
// attraversabile.
const gateObject = map.edificiObjects.find((o) => o.name === 'portaCittadina')
if (gateObject) {
  const gateX = gateObject.x + offset.x
  const gateY = gateObject.y + offset.y
  const towerWidth = 70
  const towerHeight = 100
  addBoundaryRect(gateX, gateY + gateObject.height - towerHeight, towerWidth, towerHeight)
  addBoundaryRect(
    gateX + gateObject.width - towerWidth,
    gateY + gateObject.height - towerHeight,
    towerWidth,
    towerHeight
  )
}

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

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false }
}

const movables = [
  terrainLayer,
  ...boundaries,
  ...battleZones,
  ...buildingSprites,
  ...characters
]
const renderables = [
  terrainLayer,
  ...boundaries,
  ...battleZones,
  ...buildingSprites,
  ...characters,
  player
]

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

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  if (battle.initiated) return

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
        window.cancelAnimationFrame(animationId)

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiated = true
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
  showDialogueBox(player.interactionAsset.dialogue[0])
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
