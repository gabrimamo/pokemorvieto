const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/backgrounds/background1.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage,
  // Sfondo 640x360, canvas 1024x576: scala 1.6 lo riempie esattamente.
  scale: 1.6
})

let draggle // Pokémon selvatico/avversario di turno
let emby // Pokémon attivo del giocatore
let renderedSprites
let battleAnimationId
let queue

function updateHealthBars() {
  document.querySelector('#enemyHealthBar').style.width =
    (draggle.health / draggle.maxHealth) * 100 + '%'
  document.querySelector('#playerHealthBar').style.width =
    (emby.health / emby.maxHealth) * 100 + '%'
}

function persistActiveMemberHealth() {
  const record = teamGetActive()
  if (record) record.health = Math.max(0, Math.round(emby.health))
}

function endBattle() {
  persistActiveMemberHealth()
  gsap.to('#overlappingDiv', {
    opacity: 1,
    onComplete: () => {
      cancelAnimationFrame(battleAnimationId)
      animate()
      document.querySelector('#userInterface').style.display = 'none'
      document.querySelector('#touchControls').style.display = 'flex'

      gsap.to('#overlappingDiv', {
        opacity: 0
      })

      battle.initiated = false
      audio.Map.play()
    }
  })
}

function wildAttacksBack() {
  const randomAttack =
    draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

  queue.push(() => {
    draggle.attack({
      attack: randomAttack,
      recipient: emby,
      renderedSprites
    })

    if (emby.health <= 0) {
      queue.push(() => emby.faint())
      queue.push(() => {
        persistActiveMemberHealth()
        if (teamHasUsableMember()) {
          promptForcedSwitch()
        } else {
          endBattle()
        }
      })
    }
  })
}

function switchActiveMonster(index) {
  if (!teamSetActiveIndex(index)) return false

  const record = teamGetActive()
  emby = createMonsterFromRecord(record, emby.position)
  renderedSprites[1] = emby
  document.querySelector('#playerName').innerHTML = emby.name
  updateHealthBars()
  return true
}

function promptForcedSwitch() {
  document.querySelector('#dialogueBox').style.display = 'none'
  const menu = document.querySelector('#teamMenu')
  document.querySelector('#closeTeamMenu').style.display = 'none'

  renderTeamMenu((index) => {
    if (switchActiveMonster(index)) {
      menu.style.display = 'none'
      document.querySelector('#closeTeamMenu').style.display = ''
    }
  })
  menu.style.display = 'flex'
}

function tryCapture() {
  if (draggle.caught || draggle.health <= 0) return

  if (team.members.length >= MAX_TEAM_SIZE) {
    document.querySelector('#dialogueBox').style.display = 'block'
    document.querySelector('#dialogueBox').innerHTML =
      'La tua squadra è già piena!'
    return
  }

  const success = draggle.attemptCapture()
  document.querySelector('#dialogueBox').style.display = 'block'

  if (success) {
    audio.captureSuccess.play()
    document.querySelector('#dialogueBox').innerHTML =
      'Congratulazioni! Hai catturato ' + draggle.name + '!'
    teamAdd(monsterToTeamRecord(draggle))
    queue.push(() => endBattle())
  } else {
    audio.captureFail.play()
    document.querySelector('#dialogueBox').innerHTML =
      draggle.name + ' si è liberato dalla Poké Ball!'
    wildAttacksBack()
  }
}

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#attacksBox').replaceChildren()

  const activeRecord = teamGetActive()
  emby = createMonsterFromRecord(activeRecord, {
    x: 280,
    y: 325
  })
  draggle = pickWildMonster({
    x: 800,
    y: 100
  })

  document.querySelector('#playerName').innerHTML = emby.name
  document.querySelector('#enemyName').innerHTML = draggle.name

  renderedSprites = [draggle, emby]
  queue = []

  updateHealthBars()

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    button.dataset.role = 'attack'
    document.querySelector('#attacksBox').append(button)
  })

  const captureButton = document.createElement('button')
  captureButton.innerHTML = 'Poké Ball'
  captureButton.addEventListener('click', tryCapture)
  document.querySelector('#attacksBox').append(captureButton)

  const switchButton = document.createElement('button')
  switchButton.innerHTML = 'Squadra'
  switchButton.addEventListener('click', () => {
    const menu = document.querySelector('#teamMenu')
    renderTeamMenu((index) => {
      if (index === team.activeIndex) return
      switchActiveMonster(index)
      menu.style.display = 'none'
      wildAttacksBack()
    })
    menu.style.display = 'flex'
  })
  document.querySelector('#attacksBox').append(switchButton)

  // our event listeners for our attack buttons
  document
    .querySelectorAll('#attacksBox button[data-role="attack"]')
    .forEach((button) => {
      button.addEventListener('click', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML]
        emby.attack({
          attack: selectedAttack,
          recipient: draggle,
          renderedSprites
        })

        if (draggle.health <= 0) {
          queue.push(() => {
            draggle.faint()
          })
          queue.push(() => endBattle())
          return
        }

        wildAttacksBack()
      })

      button.addEventListener('mouseenter', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML]
        document.querySelector('#attackType').innerHTML = selectedAttack.type
        document.querySelector('#attackType').style.color =
          selectedAttack.color
      })
    })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
