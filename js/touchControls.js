// D-pad virtuale + pulsante di interazione per mobile (requisiti, sezione 10).
// Riusa le stesse funzioni chiamate dagli handler della tastiera in index.js,
// così la logica di movimento/collisione resta in un unico posto.
function setupTouchControls() {
  const directionButtons = {
    up: document.querySelector('#dpadUp'),
    down: document.querySelector('#dpadDown'),
    left: document.querySelector('#dpadLeft'),
    right: document.querySelector('#dpadRight')
  }

  const directionKey = { up: 'w', down: 's', left: 'a', right: 'd' }

  Object.entries(directionButtons).forEach(([direction, button]) => {
    if (!button) return

    const press = (e) => {
      e.preventDefault()
      handleDirectionDown(directionKey[direction])
    }
    const release = (e) => {
      e.preventDefault()
      handleDirectionUp(directionKey[direction])
    }

    button.addEventListener('touchstart', press, { passive: false })
    button.addEventListener('touchend', release, { passive: false })
    button.addEventListener('touchcancel', release, { passive: false })
    // Anche mousedown/mouseup così i controlli funzionano pure col mouse
    // (utile per testare il layout mobile da desktop).
    button.addEventListener('mousedown', press)
    button.addEventListener('mouseup', release)
    button.addEventListener('mouseleave', release)
  })

  const actionButton = document.querySelector('#actionButton')
  if (actionButton) {
    actionButton.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault()
        handleInteract()
      },
      { passive: false }
    )
    actionButton.addEventListener('click', () => handleInteract())
  }
}

window.addEventListener('DOMContentLoaded', setupTouchControls)
