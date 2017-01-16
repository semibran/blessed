import { Game, Cell, Color } from './utils/index'

const blessed = require('blessed')
const options = { smartCSR: true }

let screen = blessed.screen(options)
screen.title = 'Roguelike'
const { BLACK, MAROON, GREEN, OLIVE, NAVY, PURPLE, TEAL, SILVER, GRAY: YELLOW, RED, LIME, YELLOW: GRAY, BLUE, FUCHSIA, AQUA, WHITE } = Color

const sprites = function () {

  const floor      = [183, OLIVE]
  const wall       = ['#', PURPLE]
  const door       = ['+', TEAL]
  const doorOpen   = ['/', TEAL]
  const doorSecret = wall
  const exit       = ['>', WHITE]
  const entrance   = ['<', WHITE]
  const human      = ['@', WHITE]
  const wyrm       = ['s', GREEN]
  const corpse     = ['%', MAROON]

  return { floor, wall, door, doorOpen, doorSecret, entrance, exit, human, wyrm, corpse }

}()

const WORLD_SIZE = 25
const DISPLAY_WIDTH  = 80
const DISPLAY_HEIGHT = 25

let game = Game.create(WORLD_SIZE)
game.start()

let display = blessed.box({
  top: 'center',
  left: 'center',
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  tags: true
})

screen.append(display)

let box = blessed.box({
  parent: display,
  width: WORLD_SIZE,
  height: DISPLAY_HEIGHT,
  tags: true
})

display.append(box)

let log = blessed.log({
  left: WORLD_SIZE,
  width: DISPLAY_WIDTH - WORLD_SIZE,
  height: DISPLAY_HEIGHT,
  tags: true,
  border: {
    type: 'line'
  }
})

display.append(log)

function getView(actor, mouse) {
  if (!actor)
    throw new TypeError(`Cannot get view of actor '${actor}'`)
  let view = ''
  let { data, size } = actor.world
  let mouseX, mouseY
  if (mouse)
    [mouseX, mouseY] = mouse
  let y = size
  while (y--) {
    let row = data.slice(y * size, (y + 1) * size)
    let line = ''
    let x = 0
    for (let id of row) {
      let cell = [x, y]
      let char = ' ', color
      let type = actor.world.tileAt(cell).kind
      if (actor)
        if (actor.known[actor.worldId])
          type = actor.known[actor.worldId][cell]
        else
          type = null
      if (type) {
        if ( !(type in sprites) ) {
          throw new TypeError('Unrecognized sprite: ' + type)
        }
        [char, color] = sprites[type]
        if (actor && !actor.seeing[cell])
          color = GRAY
      }
      if (typeof char === 'number')
        char = String.fromCharCode(char)
      if (color)
        if (x === mouseX && y === mouseY)
          char = `{black-fg}{${color}-bg}${char}{/}`
        else
          char = `{${color}-fg}${char}{/}`
      line += char
      x++
    }
    view = line + view + '\n'
  }
  return view
}

function render() {
  let view = getView(hero)
  box.setContent(view)
  screen.render()
}

screen.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c')
    return process.exit(0)
  if (hero.health) {
    if (key.name in Cell.directions) {
      let direction = Cell.directions[key.name]
      game.input('move', direction)
    } else if (key.ch === '>') {
      game.input('descend')
    } else if (key.ch === '<') {
      game.input('ascend')
    }else if (key.name === 'o') {
      game.input('open')
    } else if (key.name === 'c') {
      game.input('close')
    }
  }
})

let { hero } = game

.on('tick', () => {
  render()
})

.on('move', (actor, direction) => {
  if (actor === hero) {
    let elements = hero.world.elementsAt(hero.cell)
    let corpse = elements.find(element => element.kind === 'corpse')
    if (corpse) {
      let origin = corpse.origin
      let [,color] = sprites[origin]
      log.add(`There's a corpse of a {${color}-fg}${origin}{/} lying here.`)
    } else {
      let tile = hero.world.tileAt(hero.cell)
      if (tile.kind === 'entrance')
        log.add(`There's a set of stairs going back up here.`)
      else if (tile.kind === 'exit')
        log.add(`There's a staircase going down here.`)
    }
  }
})

.on('attack', (actor, target) => {
  if (actor === hero) {
    if (!target.health) {
      log.add(`{${RED}-fg}You slay the ${target.kind}!{/}`)
    } else {
      log.add(`{${RED}-fg}You whack the ${target.kind}.{/}`)
    }
  } else if (target === hero) {
    if (!hero.health) {
      log.add(`{${RED}-fg}The ${actor.kind} kills you!{/}`)
    } else {
      log.add(`{${YELLOW}-fg}The ${actor.kind} attacks you.{/}`)
    }
  }
})

.on('open', (actor, door, secret) => {
  if (actor === hero) {
    if (secret)
      log.add(`{${YELLOW}-fg}You find a secret room!{/}`)
    else
      log.add('You open the door.')
  }
})

.on('close', (actor, doors) => {
  if (actor === hero)
    log.add(`You close the door.`)
})

.on('close-fail', actor => {
  if (actor === hero)
    log.add(`No doors to close!`)
})

.on('descend', actor => {
  if (actor === hero) {
    log.add(`You head down the staircase to {${YELLOW}-fg}Floor ${game.floor}{/}.`)
    screen.render()
  }
})

.on('descend-fail', actor => {
  if (actor === hero) {
    log.add(`There's nowhere to go down here!`)
    screen.render()
  }
})

.on('ascend', actor => {
  if (actor === hero) {
    log.add(`You go back upstairs to {${YELLOW}-fg}Floor ${game.floor}{/}.`)
    screen.render()
  }
})

.on('ascend-fail', actor => {
  if (actor === hero) {
    log.add(`There's nowhere to go up here!`)
    screen.render()
  }
})

render()
