function process(chance, size) {
  if(!size || !chance) return
  return Math.random() * 100 < chance
    ? (size * 100) / chance
    : 0
}

module.exports = {
  process
}