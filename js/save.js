// Salvataggio/caricamento su localStorage (requisiti, sezione 3.4 e 11).
const SAVE_KEY = 'pokemonOrvietoSave'

const storyState = {
  dialoguesSeen: {},
  flags: {}
}

function markDialogueSeen(characterId) {
  storyState.dialoguesSeen[characterId] = true
}

function hasSeenDialogue(characterId) {
  return !!storyState.dialoguesSeen[characterId]
}

function buildSaveData() {
  return {
    version: 1,
    savedAt: Date.now(),
    // Il "mondo" si muove sotto un player disegnato a posizione fissa: è
    // l'offset della mappa, non player.position, a codificare dove si trova
    // Sere. Vedi index.js (movables.forEach(m => m.position.x/y += ...)).
    offset: {
      x: offset.x,
      y: offset.y
    },
    team: teamToJSON(),
    story: storyState
  }
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveData()))
    return true
  } catch (err) {
    console.error('Salvataggio fallito', err)
    return false
  }
}

function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return false

  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    console.error('Salvataggio corrotto', err)
    return false
  }

  if (data.team) teamLoadFromJSON(data.team)
  if (data.story) {
    storyState.dialoguesSeen = data.story.dialoguesSeen || {}
    storyState.flags = data.story.flags || {}
  }

  if (data.offset) {
    const dx = data.offset.x - offset.x
    const dy = data.offset.y - offset.y
    movables.forEach((movable) => {
      movable.position.x += dx
      movable.position.y += dy
    })
    offset.x = data.offset.x
    offset.y = data.offset.y
  }

  return true
}

function showSaveFeedback(message) {
  const el = document.querySelector('#saveFeedback')
  if (!el) return
  el.innerHTML = message
  el.style.opacity = 1
  clearTimeout(showSaveFeedback._timeout)
  showSaveFeedback._timeout = setTimeout(() => {
    el.style.opacity = 0
  }, 1500)
}
