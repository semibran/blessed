const names  = [  'black',  'maroon',   'green',   'olive',    'navy',  'purple',    'teal',  'silver',    'gray',     'red',    'lime',  'yellow',    'blue', 'fuchsia',    'aqua',   'white']
const values = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff']

let MAP = {}
let map = {}

let index = 0
for (let name of names) {
  let NAME  = name.toUpperCase()
  MAP[NAME] = values[index]
  map[name] = values[index++]
}

let Color = Object.assign({ names, values, map }, MAP)

export default Color
