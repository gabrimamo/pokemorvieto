// Gestione squadra/inventario (requisiti, sezione 3.3 e 9).
// La squadra è tenuta come dati semplici (non istanze Monster) così è
// facile serializzarla in localStorage.
const MAX_TEAM_SIZE = 6

const team = {
  members: [],
  activeIndex: 0
}

function monsterToTeamRecord(monster) {
  return {
    dexId: monster.dexId,
    name: monster.name,
    level: monster.level,
    health: monster.health,
    maxHealth: monster.maxHealth,
    types: monster.types,
    catchRate: monster.catchRate
  }
}

function teamAdd(record) {
  if (team.members.length >= MAX_TEAM_SIZE) return false
  team.members.push(record)
  return true
}

function teamGetActive() {
  return team.members[team.activeIndex] || null
}

function teamSetActiveIndex(index) {
  if (index < 0 || index >= team.members.length) return false
  if (team.members[index].health <= 0) return false
  team.activeIndex = index
  return true
}

function teamHasUsableMember() {
  return team.members.some((m) => m.health > 0)
}

function teamFirstUsableIndex() {
  return team.members.findIndex((m) => m.health > 0)
}

function teamEnsureStarter() {
  if (team.members.length > 0) return
  const info = findPokemonByName(STARTER_POKEMON_NAME)
  teamAdd({
    dexId: info.id,
    name: info.displayName,
    level: 5,
    health: 100,
    maxHealth: 100,
    types: info.types,
    catchRate: info.catchRate
  })
  team.activeIndex = 0
}

function teamToJSON() {
  return {
    members: team.members,
    activeIndex: team.activeIndex
  }
}

function teamLoadFromJSON(data) {
  if (!data || !Array.isArray(data.members)) return
  team.members = data.members
  team.activeIndex = data.activeIndex || 0
}

// onSelect(index) viene chiamato al click su un membro non esausto. Se
// omesso, il comportamento di default è il cambio libero (fuori battaglia):
// imposta il membro come attivo e chiude il menu.
function renderTeamMenu(onSelect) {
  const list = document.querySelector('#teamList')
  if (!list) return
  list.replaceChildren()

  const handleSelect =
    onSelect ||
    ((index) => {
      if (teamSetActiveIndex(index)) {
        document.querySelector('#teamMenu').style.display = 'none'
      }
    })

  team.members.forEach((member, index) => {
    const item = document.createElement('button')
    item.className = 'teamMember'
    item.disabled = member.health <= 0
    const status = member.health <= 0 ? ' (esausto)' : ''
    item.innerHTML = `${member.name} Lv.${member.level} — ${member.health}/${member.maxHealth} HP${status}`
    if (index === team.activeIndex) item.classList.add('active')
    item.addEventListener('click', () => handleSelect(index))
    list.append(item)
  })
}
