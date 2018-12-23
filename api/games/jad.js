let size, chance
function setChance(newChance) {
  chance = newChance
}

function setSize(newSize) {
  size = newSize
}

function process() {
  if(!size || !chance) return
  return Math.random() * 100 < chance
    ? (size * 100) / chance
    :     0
}

module.exports = {
  setChance,
  setSize,
  process
}