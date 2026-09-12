// Placeholder battle-zone grid (aligned to the placeholder Pellet Town tileset).
// Expressed as a fill + explicit indices instead of one literal per line,
// but produces the exact same 2801-cell grid as the original base project.
const battleZonesData = new Array(2801).fill(0)
;[
  1519, 1520, 1521,
  1589, 1590, 1591,
  1659, 1660, 1661,
  1706, 1707, 1708, 1709, 1710, 1711, 1712,
  1729, 1730, 1731,
  1776, 1777, 1778, 1779, 1780, 1781, 1782
].forEach((i) => {
  battleZonesData[i] = 1025
})
