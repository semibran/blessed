const directions = {
  left:      [-1,  0],
  upLeft:    [-1, -1],
  up:        [ 0, -1],
  upRight:   [ 1, -1],
  right:     [ 1,  0],
  downRight: [ 1,  1],
  down:      [ 0,  1],
  downLeft:  [-1,  1]
}
const { left, upLeft, up, upRight, right, downRight, down, downLeft } = directions
const cardinalDirections = { left, up, right, down }

export default {

  // Constants
  left, right, up, down, upLeft, upRight, downLeft, downRight, directions, cardinalDirections,

  // Methods
  isCell, isEqual, isEdge, isInside, isNeighbor, toString, fromString, toIndex, fromIndex, getNeighbors, getManhattan, getDistance

}

function isCell(value) {
  return value && Array.isArray(value) && value.length === 2 && !value.filter(value => isNaN(value) || typeof value !== 'number').length
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}

function isEdge(cell, size) {
  let [x, y] = cell
  let rect = [0, 0, size, size]
  if (Array.isArray(size))
    rect = size
  let [rectX, rectY, rectWidth, rectHeight] = rect
  return isInside(cell, size) && (x === rectX || x === rectX + rectWidth - 1 || y === rectY || y === rectY + rectHeight - 1)
}

function isInside(cell, size) {
  let [x, y] = cell
  let rect = [0, 0, size, size]
  if (Array.isArray(size))
    rect = size
  let [rectX, rectY, rectWidth, rectHeight] = rect
  return x >= rectX && y >= rectY && x < rectX + rectWidth && y < rectY + rectHeight
}

function isNeighbor(cell, other) {
  let [cx, cy] = cell
  let [ox, oy] = other
  let dx = Math.abs(ox - cx)
  let dy = Math.abs(oy - cy)
  return (!dx || dx === 1) && (!dy || dy === 1)
}

function toString(cell) {
  return cell.toString()
}

function fromString(string) {
  return string.split(',').map(Number)
}

function toIndex(cell, size) {
  let [x, y] = cell
  return y * size + x
}

function fromIndex(index, size) {
  let x = index % size
  let y = (index - x) / size
  return [x, y]
}

function getNeighbors(cell, diagonals, step) {
  if (!isCell(cell))
    throw new TypeError(`Cannot get neighbors of cell '${cell}'`)
  step = step || 1
  let [x, y] = cell
  let neighbors = []
  let dirs = cardinalDirections
  if (diagonals)
    dirs = directions
  for (let key in dirs) {
    let [dx, dy] = dirs[key]
    let current  = [x + dx * step, y + dy * step]
    let [cx, cy] = current
    neighbors.push( [cx, cy] )
  }
  return neighbors
}

function getManhattan(a, b) {
  let [ax, ay] = a
  let [bx, by] = b
  return Math.abs(ax - bx) + Math.abs(ay - by)
}

function getDistance(a, b, sqrt) {
  if (typeof sqrt === 'undefined')
    sqrt = true
  let [ax, ay] = a
  let [bx, by] = b
  let [dx, dy] = [bx - ax, by - ay]
  let squared  = dx * dx + dy * dy
  if (sqrt)
    return Math.sqrt(squared)
  return squared
}
