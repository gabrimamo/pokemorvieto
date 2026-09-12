class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.onerror = () => {
      console.warn('Sprite non caricato:', image.src)
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    // Salta il frame finché l'immagine non è pronta (es. sprite scaricati
    // da rete, come quelli dei Pokémon in battaglia): senza questo controllo
    // drawImage lancia un errore su un'immagine ancora "broken".
    if (!this.image.complete || !this.image.naturalWidth) return

    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * (this.width / this.scale),
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
    level = 5,
    types = ['normal'],
    catchRate = 190,
    dexId = null
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.maxHealth = 100
    this.health = 100
    this.isEnemy = isEnemy
    this.name = name
    this.attacks = attacks
    this.level = level
    this.types = types
    this.catchRate = catchRate
    this.dexId = dexId
    this.caught = false
  }

  faint() {
    document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    audio.battle.stop()
    audio.victory.play()
  }

  // Formula semplificata (non è la formula esatta di Pokémon Gen1): più il
  // Pokémon è debole e più il catchRate è alto, più è facile catturarlo.
  // Il bilanciamento fine è un punto aperto (vedi requisiti, sezione 14).
  captureChance() {
    const healthFactor = 1 - this.health / this.maxHealth
    const base = this.catchRate / 255
    const chance = base * (0.25 + healthFactor * 0.75)
    return Math.min(0.95, Math.max(0.05, chance))
  }

  attemptCapture() {
    const success = Math.random() < this.captureChance()
    if (success) this.caught = true
    return success
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector('#dialogueBox').style.display = 'block'
    document.querySelector('#dialogueBox').innerHTML =
      this.name + ' used ' + attack.name

    let healthBar = '#enemyHealthBar'
    if (this.isEnemy) healthBar = '#playerHealthBar'

    let rotation = 1
    if (this.isEnemy) rotation = -2.2

    recipient.health -= attack.damage
    if (recipient.health < 0) recipient.health = 0

    switch (attack.name) {
      case 'Fireball':
        audio.initFireball.play()
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })

        break
      case 'Tackle':
        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              // Enemy actually gets hit
              audio.tackleHit.play()
              gsap.to(healthBar, {
                width: recipient.health + '%'
              })

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        break
    }
  }
}

class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Character extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = ['']
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale
    })

    this.dialogue = dialogue
    this.dialogueIndex = 0
  }
}

// Disegna un intero layer di tile di una mappa Tiled (griglia di gid, 0 =
// vuoto) leggendo i ritagli dal tileset. Usata da js/tiledMap.js per il
// livello "terreno"/"erba_alta" — vedi requisiti, sezione 2 e 4.
class TileLayerSprite {
  constructor({ position, grid, tileset, tileSize, cellSize }) {
    this.position = position
    this.grid = grid
    this.tileset = tileset
    this.tileSize = tileSize
    this.cellSize = cellSize
  }

  draw() {
    if (!this.tileset.complete || !this.tileset.naturalWidth) return
    const columns = Math.round(this.tileset.naturalWidth / this.tileSize)

    this.grid.forEach((row, rowIndex) => {
      row.forEach((gid, colIndex) => {
        if (!gid) return
        const tileIndex = gid - 1
        const sx = (tileIndex % columns) * this.tileSize
        const sy = Math.floor(tileIndex / columns) * this.tileSize

        c.drawImage(
          this.tileset,
          sx,
          sy,
          this.tileSize,
          this.tileSize,
          this.position.x + colIndex * this.cellSize,
          this.position.y + rowIndex * this.cellSize,
          this.cellSize,
          this.cellSize
        )
      })
    })
  }
}
