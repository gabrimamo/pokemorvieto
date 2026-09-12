## [Pokémon Orvieto v0.1] – Fork iniziale

Prima importazione nel fork "Pokémon Orvieto", a partire da `ManaJBin/pokemon`
(vedi cronologia originale più sotto). Aggiunte le modifiche strutturali
richieste dai requisiti di progetto (`docs/REQUISITI.md`, sezione 3):

### Added
- Controlli touch: D-pad virtuale + pulsante di interazione (`js/touchControls.js`)
- Meccanica di cattura Pokémon selvatici con pulsante "Poké Ball" in battaglia (`Monster.attemptCapture()`, `battleScene.js`)
- Gestione squadra/inventario fino a 6 Pokémon, cambio attivo dentro e fuori battaglia (`js/team.js`)
- Salvataggio/caricamento su `localStorage` (posizione, squadra, dialoghi visti) (`js/save.js`)
- Layout responsive per mobile: viewport meta, HUD e D-pad adattivi
- Roster di 35 Pokémon a tema Orvieto con dati da PokéAPI, salvati offline in `data/pokemon.json` (`scripts/fetchPokemonData.js`)
- Dialoghi separati dal motore per i personaggi della storia (`data/dialogues/dialogues.js`)

### Notes
La mappa di gioco resta il placeholder "Pellet Town" del progetto base: la
mappa reale di Orvieto (Tiled + tileset dedicato) è un lavoro successivo che
richiede asset non ancora procurati (vedi README, sezione "Cosa manca").

---

## Cronologia originale (progetto base `ManaJBin/pokemon`)

## [v1.0] – 2025-11-07  
🏆 Foundation Complete – Full battle system, audio integration, and NPC interaction

### Added
- Turn-based battle logic with attack sequencing and health deduction
- `Monster` class with `attack()` and `faint()` methods for both player and enemy
- Animated attack effects: Fireball and Tackle with GSAP motion and impact feedback
- Sound effects for battle initiation, attacks, hits, and victory using Howler.js
- Background music for both map and battle scenes
- NPC system with dialogue interaction via spacebar
- `Character` class with dialogue index tracking and interaction state
- `checkForCharacterCollision()` utility for NPC proximity detection
- `utils.js` file for reusable collision logic
- `attackType` UI display with dynamic color and type info
- Modular folder structure for audio, data, images, and logic separation

### Changed
- Refactored battle flow to use a `queue` system for sequential actions
- Updated `README.md` with full feature summary and setup instructions
- Improved sprite animation timing and frame control
- Reorganized project structure to include `js/` folder for utilities

### Fixed
- Image spacing and scaling issues for player and NPC sprites
- UI layering bugs during battle transitions
- Audio overlap between map and battle scenes

### Notes
This release marks the completion of the foundational gameplay loop: exploration, interaction, and combat. The game now supports full battle mechanics, audio immersion, and character dialogue — ready for expansion into quests, leveling, and multi-map navigation.

---

## [v0.3.0-beta] – 2025-11-06  
⚔️ Battle Begins – Transition system from map to battle sequence implemented

**Added**
- Battle zone detection using `battleZonesMap` and randomized encounter trigger
- Animated transition overlay with GSAP (`#overlappingDiv`) for battle entry effect
- `battle.initiated` flag to control animation flow and prevent movement during transition
`animateBattle()` placeholder for future battle loop logic
- Inline code comments for improved readability and maintainability
- README updated to reflect new battle transition feature
- Battle background and animated sprites for Draggle and Emby
- Health bar UI for both player and enemy
- Attack bar interface with buttons and type display
- External CSS styling for all battle UI components

**Changed**
- Refactored animation loop to support battle handoff and cancel frame logic
- Movement logic gated by battle state to prevent unintended input during transition
- index.js updated to handle battle initiation and animation loop
- index.html modified to support new battle UI structure

**Fixed**
- Character freeze issue after triggering battle due to premature animation loop exit

**Notes**
This version introduces the first step toward a full battle system, laying groundwork for enemy logic, UI elements, and future turn-based mechanics. While the UI is functional, battle logic is still under development.

---

## [v0.3.0-alpha] – 2025-11-03  
⚔️ First Encounter – Battle activation logic introduced

**Added**
- Battle zone parsing from `battleZonesData` into a 2D grid (`battleZonesMap`)
- Dynamic battle zone generation using `Boundary` objects based on map symbols
- Collision detection between player and battle zones
- Battle trigger logic based on overlapping area threshold

---

## [v0.2.1] – 2025-11-03  
🎮 Game On – Player movement and collision system added

**Added**
- Player sprite system with directional animations (up, down, left, right)
- Background and foreground rendering using layered `Sprite` objects
- Collision detection system using `Boundary` class and `rectangularCollision()` logic
- Movement controls via WASD keys with smooth camera scrolling
- Map parsing from `collisions` array into a 2D grid (`collisionsMap`)
- Dynamic boundary generation based on map symbols

**Changed**
- Canvas setup with fixed dimensions and white background fill
- Sprite animation logic with frame cycling based on movement state

**Fixed**
- Placeholder for image spacing issue noted in TODO comment

**Notes**
- This version introduces core gameplay mechanics and sets the foundation for interactive map navigation
