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

// Legge il salvataggio PRIMA di costruire la mappa: popola squadra e stato
// della storia, e restituisce l'offset salvato (o null se non c'è nulla da
// caricare) così index.js può usarlo subito come offset iniziale invece di
// dover spostare tutti i movables dopo che sono già stati creati.
function loadSavedState() {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null

  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    console.error('Salvataggio corrotto', err)
    return null
  }

  if (data.team) teamLoadFromJSON(data.team)
  if (data.story) {
    storyState.dialoguesSeen = data.story.dialoguesSeen || {}
    storyState.flags = data.story.flags || {}
  }

  return data.offset || null
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
