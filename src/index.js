import { Cell, Gen, Color, Entity, RNG, FOV } from './utils/index'

const blessed = require('blessed')

const options = { smartCSR: true }

let screen = blessed.screen(options)
screen.title = 'Hello world!'

let { BLACK, MAROON, GREEN, OLIVE, NAVY, PURPLE, TEAL, SILVER, GRAY: YELLOW, RED, LIME, YELLOW: GRAY, BLUE, FUCHSIA, AQUA, WHITE } = Color

const sprites = function () {

  const floor      = [183, OLIVE]
  const wall       = ['#', TEAL]
  const door       = ['+', MAROON]
  const doorOpen   = ['/', MAROON]
  const doorSecret = wall
  const entrance   = ['<', WHITE]
  const exit       = ['>', WHITE]
  const human      = ['@', WHITE]

  return { floor, wall, door, doorOpen, doorSecret, entrance, exit, human }

}()

function render(world, entity) {
  let view = ''
  let { data, size } = world
  let y = size
  while (y--) {
    let row = data.slice(y * size, (y + 1) * size)
    let line = ''
    let x = 0
    for (let id of row) {
      let cell = [x, y]
      let char = ' ', color
      let type = Gen.tiles[id].name
      if (entity)
        type = entity.known[cell]
      if (type) {
        if ( !(type in sprites) ) {
          throw new TypeError('Unrecognized sprite: ' + type)
        }
        [char, color] = sprites[type]
        if (entity && !entity.seeing[cell])
          color = GRAY
      }
      if (typeof char === 'number')
        char = String.fromCharCode(char)
      if (color)
        char = `{${color}-fg}${char}{/}`
      line += char
      x++
    }
    view = line + view + '\n'
  }
  return view
}

let rng = RNG.create(5866.672160786003)

let floors = []
let floor = 0
let world
let hero = Entity.create( { entityType: 'hero', kind: 'human' } )

function rerender() {
  box.setContent(render(world, hero))
  screen.render()
}

function move(direction) {
  let moved = hero.move(direction)
  if (moved) {
    rerender()
  }
}

function descend() {
  world = Gen.createDungeon(25, rng)
  Gen.spawn(world, hero)
  hero.look()
  floors.push(world)
  rerender()
}

let box = blessed.box({
  top: 'center',
  left: 'center',
  width: 25,
  height: 25,
  tags: true
})

screen.on('keypress', (ch, key) => {
  if (key.name === 'escape' || key.ctrl && key.name === 'c')
    return process.exit(0)
  if (key.name in Cell.cardinalDirections)
    move(Cell.directions[key.name])
  if (key.ch === '>') {
    console.log(hero.cell)
    if (Gen.getTileAt(world.data, hero.cell).name === 'exit')
      descend()
  }
})

screen.append(box)

descend()
