(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var names = ['black', 'maroon', 'green', 'olive', 'navy', 'purple', 'teal', 'silver', 'gray', 'red', 'lime', 'yellow', 'blue', 'fuchsia', 'aqua', 'white'];
var values = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];

var MAP = {};
var map = {};

var index = 0;
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var name = _step.value;

    var NAME = name.toUpperCase();
    MAP[NAME] = values[index];
    map[name] = values[index++];
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var Color = Object.assign({ names: names, values: values, map: map }, MAP);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









































var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var RNG = create();
RNG.create = create;

function create(initialSeed) {

  if (isNaN(initialSeed)) initialSeed = Math.random() * 10000;

  var currentSeed = initialSeed;

  return { get: get$$1, choose: choose, seed: seed };

  function get$$1(min, max) {
    var a = arguments.length;
    if (a === 0) {
      var x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    } else if (a === 1) {
      if (!isNaN(min)) max = min, min = 0;else if (Array.isArray(min)) {
        
        var _min = min;

        var _min2 = slicedToArray(_min, 2);

        min = _min2[0];
        max = _min2[1];
      }
    }
    if (min > max) {
      
      var _ref = [max, min];
      min = _ref[0];
      max = _ref[1];
    }return Math.floor(get$$1() * (max - min)) + min;
  }

  function choose(array) {
    if (Array.isArray(array) && !array.length) return null;
    if (!isNaN(array)) return !get$$1(array);
    if (!array) array = [0, 1];
    return array[get$$1(array.length)];
  }

  function seed(newSeed) {
    if (!isNaN(newSeed)) initialSeed = currentSeed = newSeed;
    return currentSeed;
  }
}

var directions = {
  left: [-1, 0],
  upLeft: [-1, -1],
  up: [0, -1],
  upRight: [1, -1],
  right: [1, 0],
  downRight: [1, 1],
  down: [0, 1],
  downLeft: [-1, 1]
};
var left = directions.left;
var upLeft = directions.upLeft;
var up = directions.up;
var upRight = directions.upRight;
var right = directions.right;
var downRight = directions.downRight;
var down = directions.down;
var downLeft = directions.downLeft;

var cardinalDirections = { left: left, up: up, right: right, down: down };

var Cell = {

  // Constants
  left: left, right: right, up: up, down: down, upLeft: upLeft, upRight: upRight, downLeft: downLeft, downRight: downRight, directions: directions, cardinalDirections: cardinalDirections,

  // Methods
  isCell: isCell, isEqual: isEqual, isEdge: isEdge, isInside: isInside, isNeighbor: isNeighbor, toString: toString, fromString: fromString, toIndex: toIndex, fromIndex: fromIndex, getNeighbors: getNeighbors, getManhattan: getManhattan, getDistance: getDistance

};

function isCell(value) {
  return value && Array.isArray(value) && value.length === 2 && !value.filter(function (value) {
    return isNaN(value) || typeof value !== 'number';
  }).length;
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isEdge(cell, size) {
  var _cell = slicedToArray(cell, 2),
      x = _cell[0],
      y = _cell[1];

  var rect = [0, 0, size, size];
  if (Array.isArray(size)) rect = size;

  var _rect = rect,
      _rect2 = slicedToArray(_rect, 4),
      rectX = _rect2[0],
      rectY = _rect2[1],
      rectWidth = _rect2[2],
      rectHeight = _rect2[3];

  return isInside(cell, size) && (x === rectX || x === rectX + rectWidth - 1 || y === rectY || y === rectY + rectHeight - 1);
}

function isInside(cell, size) {
  var _cell2 = slicedToArray(cell, 2),
      x = _cell2[0],
      y = _cell2[1];

  var rect = [0, 0, size, size];
  if (Array.isArray(size)) rect = size;

  var _rect3 = rect,
      _rect4 = slicedToArray(_rect3, 4),
      rectX = _rect4[0],
      rectY = _rect4[1],
      rectWidth = _rect4[2],
      rectHeight = _rect4[3];

  return x >= rectX && y >= rectY && x < rectX + rectWidth && y < rectY + rectHeight;
}

function isNeighbor(cell, other) {
  var _cell3 = slicedToArray(cell, 2),
      cx = _cell3[0],
      cy = _cell3[1];

  var _other = slicedToArray(other, 2),
      ox = _other[0],
      oy = _other[1];

  var dx = Math.abs(ox - cx);
  var dy = Math.abs(oy - cy);
  return (!dx || dx === 1) && (!dy || dy === 1);
}

function toString(cell) {
  return cell.toString();
}

function fromString(string) {
  return string.split(',').map(Number);
}

function toIndex(cell, size) {
  var _cell4 = slicedToArray(cell, 2),
      x = _cell4[0],
      y = _cell4[1];

  return y * size + x;
}

function fromIndex(index, size) {
  var x = index % size;
  var y = (index - x) / size;
  return [x, y];
}

function getNeighbors(cell, diagonals, step) {
  if (!isCell(cell)) throw new TypeError('Cannot get neighbors of cell \'' + cell + '\'');
  step = step || 1;

  var _cell5 = slicedToArray(cell, 2),
      x = _cell5[0],
      y = _cell5[1];

  var neighbors = [];
  var dirs = cardinalDirections;
  if (diagonals) dirs = directions;
  for (var key in dirs) {
    var _dirs$key = slicedToArray(dirs[key], 2),
        dx = _dirs$key[0],
        dy = _dirs$key[1];

    var current = [x + dx * step, y + dy * step];
    var cx = current[0],
        cy = current[1];

    neighbors.push([cx, cy]);
  }
  return neighbors;
}

function getManhattan(a, b) {
  var _a = slicedToArray(a, 2),
      ax = _a[0],
      ay = _a[1];

  var _b = slicedToArray(b, 2),
      bx = _b[0],
      by = _b[1];

  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function getDistance(a, b, sqrt) {
  if (typeof sqrt === 'undefined') sqrt = true;

  var _a2 = slicedToArray(a, 2),
      ax = _a2[0],
      ay = _a2[1];

  var _b2 = slicedToArray(b, 2),
      bx = _b2[0],
      by = _b2[1];

  var dx = bx - ax,
      dy = by - ay;

  var squared = dx * dx + dy * dy;
  if (sqrt) return Math.sqrt(squared);
  return squared;
}

var Rect = { toString: toString$1, fromString: fromString$1, isEqual: isEqual$1, isIntersecting: isIntersecting, getCorners: getCorners, getEdges: getEdges, getBorder: getBorder, getCenter: getCenter, getCells: getCells };

function toString$1(cell) {
  return cell.toString();
}

function fromString$1(string) {
  return string.split(',').map(Number);
}

function isEqual$1(a, b) {
  var i = a.length;
  while (i--) {
    if (a[i] !== b[i]) return false;
  }return true;
}

function isIntersecting(a, b, exclusive) {
  var _a = slicedToArray(a, 4),
      ax = _a[0],
      ay = _a[1],
      aw = _a[2],
      ah = _a[3];

  var _b = slicedToArray(b, 4),
      bx = _b[0],
      by = _b[1],
      bw = _b[2],
      bh = _b[3];

  if (exclusive) ax--, ay--, aw += 2, ah += 2, bx--, by--, bw += 2, bh += 2;
  return ax <= bx + bw && ay <= by + bh && ax + aw >= bx && ay + ah >= by;
}

function getCorners(rect, exclusive) {
  var _rect = slicedToArray(rect, 4),
      x = _rect[0],
      y = _rect[1],
      w = _rect[2],
      h = _rect[3];

  if (exclusive) x--, y--, w += 2, h += 2;
  return [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]];
}

function getEdges(rect, exclusive) {
  var edges = [];

  var _rect2 = slicedToArray(rect, 4),
      x = _rect2[0],
      y = _rect2[1],
      w = _rect2[2],
      h = _rect2[3];

  var r = x + w,
      b = y + h,
      i;
  if (exclusive) x--, y--, w += 2, h += 2;
  for (i = x + 1; i < r; i++) {
    edges.push([i, y], [i, b]);
  }for (i = y + 1; i < b; i++) {
    edges.push([x, i], [r, i]);
  }return edges;
}

function getBorder(rect, exclusive) {
  return getEdges(rect, exclusive).concat(getCorners(rect, exclusive));
}

function getCenter(rect) {
  var x, y, w, h;
  if (Array.isArray(rect)) {
    var _rect3 = slicedToArray(rect, 4);

    x = _rect3[0];
    y = _rect3[1];
    w = _rect3[2];
    h = _rect3[3];

    if (rect.length == 2) w = x, h = y, x = 0, y = 0;
  } else if (!isNaN(rect)) x = 0, y = 0, w = rect, h = rect;
  return [Math.floor(x + w / 2), Math.floor(y + h / 2)];
}

function getCells(rect) {
  var cells = [];

  var _rect4 = slicedToArray(rect, 4),
      rectX = _rect4[0],
      rectY = _rect4[1],
      rectWidth = _rect4[2],
      rectHeight = _rect4[3];

  var i = rectWidth * rectHeight;
  while (i--) {
    var x = i % rectWidth;
    var y = (i - x) / rectWidth;
    cells[i] = [x + rectX, y + rectY];
  }
  return cells;
}

var tileData = ['floor walkable', 'wall opaque', 'door opaque door', 'doorOpen walkable door', 'doorSecret opaque door secret', 'entrance walkable stairs', 'exit walkable stairs'];

var tiles = function (tileData) {
  var tiles = [];
  var i = tileData.length;
  while (i--) {
    var tile = tiles[i] = { type: 'tile', id: i };
    var props = tileData[i].split(' ');
    var kind = tile.kind = props.splice(0, 1)[0];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var prop = _step.value;

        tile[prop] = true;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return tiles;
}(tileData);

var tileIds = function (tiles) {
  var tileIds = {};
  var i = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = tiles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var tile = _step2.value;

      var id = tile.kind.split('').reduce(function (result, char, index) {
        var CHAR = char.toUpperCase();
        if (char === CHAR || !index) result[result.length] = '';
        result[result.length - 1] += CHAR;
        return result;
      }, []).join('_');
      tileIds[id] = i;
      i++;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return tileIds;
}(tiles);

var tileCosts = function (tiles) {
  var tileCosts = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = tiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var tile = _step3.value;

      var cost = 0;
      if (!tile.walkable && !tile.door) cost = Infinity;
      if (tile.secret) cost = 1000;
      if (tile.door) {
        cost++;
        if (!tile.walkable) cost++;
      }
      tileCosts.push(cost);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return tileCosts;
}(tiles);

var FLOOR = tileIds.FLOOR;
var WALL = tileIds.WALL;
var ENTRANCE = tileIds.ENTRANCE;
var EXIT = tileIds.EXIT;


var World$$1 = { create: create$1, tiles: tiles, tileIds: tileIds, tileCosts: tileCosts };

function create$1(size) {

  var data = new Uint8ClampedArray(size * size);
  var world = {

    // Properties
    size: size, data: data, elements: new Set(), entrance: null, exit: null,

    // Methods
    getAt: getAt, tileAt: tileAt, elementsAt: elementsAt, setAt: setAt, fill: fill, clear: clear, spawn: spawn, kill: kill, findPath: findPath

  };

  return world;

  function getAt(cell) {
    if (!Cell.isInside(cell, size)) return null;
    var index = Cell.toIndex(cell, size);
    return data[index];
  }

  function tileAt(cell) {
    return tiles[getAt(cell)];
  }

  function elementsAt(cell) {
    return [].concat(toConsumableArray(world.elements)).filter(function (element) {
      return Cell.isEqual(cell, element.cell);
    });
  }

  function setAt(cell, value) {
    if (!Cell.isInside(cell, size)) return null;
    var index = Cell.toIndex(cell, size);
    data[index] = value;
    return value;
  }

  function fill(value, rect) {
    if (typeof value === 'undefined') value = WALL;
    if (rect) {
      var cells = Rect.getCells(rect);
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = cells[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var cell = _step4.value;

          setAt(data, cell, value);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    } else {
      var i = data.length;
      while (i--) {
        data[i] = value;
      }
    }
    return world;
  }

  function clear() {
    fill(FLOOR);
    return world;
  }

  function spawn(element, cell) {
    if (!world.rooms || !element || !cell) return null;
    if (element in tiles) {
      setAt(cell, element);
      if (element === ENTRANCE) world.entrance = cell;
      if (element === EXIT) world.exit = cell;
    } else if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object') {
      element.world = world;
      element.cell = cell;
      world.elements.add(element);
    }
    return cell;
  }

  function kill(element) {
    world.elements.delete(element);
  }

  function findPath(start, goal, costs, diagonals) {

    if (!costs) costs = {};

    if (!costs.tiles) costs.tiles = tileCosts;

    if (!costs.cells) costs.cells = {};

    var path = [];

    var startKey = start.toString();
    var goalKey = goal.toString();

    var opened = [startKey];
    var closed = {};

    var scores = { f: {}, g: {} };
    var parent = {};

    var cells = data.map(function (id, index) {
      return Cell.fromIndex(index, size);
    });
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = cells[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var _cell2 = _step5.value;

        scores.g[_cell2] = Infinity;
        scores.f[_cell2] = Infinity;
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    scores.g[start] = 0;
    scores.f[start] = Cell.getManhattan(start, goal);

    while (opened.length) {
      if (opened.length > 1) opened = opened.sort(function (a, b) {
        return scores.f[b] - scores.f[a];
      });
      var cellKey = opened.pop();
      var cell = Cell.fromString(cellKey);
      if (cellKey === goalKey) {
        var _cell = goal;
        do {
          path.unshift(_cell);
          _cell = parent[_cell];
        } while (_cell);
        return path;
      }
      closed[cell] = true;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = Cell.getNeighbors(cell, diagonals)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var neighbor = _step6.value;

          if (!Cell.isInside(neighbor, size) || neighbor in closed) continue;
          var key = neighbor.toString();
          var tileCost = costs.tiles[getAt(neighbor)] || 0;
          var cellCost = costs.cells[neighbor] || 0;
          var cost = tileCost + cellCost;
          if (cost === Infinity && key !== goalKey) continue;
          var g = scores.g[cell] + 1 + cost;
          if (!opened.includes(key)) opened.push(key);else if (g >= scores.g[neighbor]) continue;
          parent[neighbor] = cell;
          scores.g[neighbor] = g;
          scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }

    return null;
  }
}

var _World$tileIds = World$$1.tileIds;
var DOOR$1 = _World$tileIds.DOOR;
var DOOR_OPEN$1 = _World$tileIds.DOOR_OPEN;
var ENTRANCE$1 = _World$tileIds.ENTRANCE;
var EXIT$1 = _World$tileIds.EXIT;


var Actor$$1 = { create: create$2 };

function create$2(options) {

  var actor = {
    faction: null,
    kind: null,
    goal: null,
    speed: 1
  };

  var props = {
    type: 'actor',
    wandering: true,
    health: 1,
    energy: 0,
    hunger: 0,
    seeing: {},
    known: {},
    world: null,
    cell: null
  };

  Object.assign(actor, options, props, { look: look, perform: perform, move: move, moveTo: moveTo, attack: attack, collect: collect, open: open, close: close, descend: descend, ascend: ascend });

  var path = null;

  return actor;

  function look() {
    var cells = FOV$$1.get(actor.world, actor.cell, 7);
    actor.seeing = {};
    if (!actor.known[actor.worldId]) actor.known[actor.worldId] = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        var kind = actor.world.tileAt(cell).kind;
        var other = actor.world.elementsAt(cell)[0];
        if (other) kind = other.kind;
        actor.known[actor.worldId][cell] = kind;
        actor.seeing[cell] = true;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function move(direction) {
    var _actor$cell = slicedToArray(actor.cell, 2),
        cellX = _actor$cell[0],
        cellY = _actor$cell[1];

    var _direction = slicedToArray(direction, 2),
        distX = _direction[0],
        distY = _direction[1];

    var target = [cellX + distX, cellY + distY];
    var tile = actor.world.tileAt(target);
    var elements = actor.world.elementsAt(target);
    var entities = elements.filter(function (element) {
      return element.type === 'actor';
    });
    var items = elements.filter(function (element) {
      return element.type === 'item';
    });
    if (entities.length) {
      return entities[0];
    } else if (tile.walkable) {
      actor.cell = target;
      return true;
    } else if (tile.door) {
      return target;
    }
    return false;
  }

  function moveTo(target) {
    if (!path || path[path.length - 1] !== target) {
      var cells = {};
      // let entities = [...actor.world.elements].filter(element => element.type === 'actor')
      // actor.world.data.forEach((id, index) => {
      //   let cell = Cell.fromIndex(index, actor.world.size)
      //   if (!actor.known[actor.world.id][cell] || entities.filter(other => Cell.isEqual(other.cell, cell) && other !== actor).length)
      //     cells[cell] = Infinity
      // })
      path = actor.world.findPath(actor.cell, target, { cells: cells });
    }
    if (!path) return false;
    var next = void 0;
    path.forEach(function (cell, index) {
      if (!Cell.isEqual(actor.cell, cell)) return;
      next = path[index + 1];
      return true;
    });
    if (!next) return false;

    var _actor$cell2 = slicedToArray(actor.cell, 2),
        cellX = _actor$cell2[0],
        cellY = _actor$cell2[1];

    var _next = next,
        _next2 = slicedToArray(_next, 2),
        nextX = _next2[0],
        nextY = _next2[1];

    var dist = [nextX - cellX, nextY - cellY];
    return actor.move(dist);
  }

  function attack(other) {
    other.health--;
    if (other.health <= 0) {
      other.health = 0;
      actor.world.kill(other);
      actor.world.elements.add({
        type: 'sprite',
        kind: 'corpse',
        cell: other.cell,
        origin: other.kind
      });
    }
  }

  function collect(item) {
    if (Cell.isEqual(actor.cell, item.cell)) actor.world.kill(item);
  }

  function open(cell) {
    if (!Cell.isCell(cell) || !Cell.isNeighbor(cell, actor.cell)) return false;
    var tile = actor.world.tileAt(cell);
    if (!tile.door) return false;
    actor.world.setAt(cell, DOOR_OPEN$1);
    return true;
  }

  function close(cell) {
    if (!cell) {
      var neighbors = Cell.getNeighbors(actor.cell, true).filter(function (neighbor) {
        return actor.world.getAt(neighbor) === DOOR_OPEN$1;
      });
      if (!neighbors.length) return false;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = neighbors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var neighbor = _step2.value;

          actor.world.setAt(neighbor, DOOR$1);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    } else {
      if (!Cell.isCell(cell) || !Cell.isNeighbor(cell, actor.cell)) return false;
      var tile = actor.world.tileAt(cell);
      if (!tile.door) return false;
      actor.world.setAt(cell, DOOR$1);
      return true;
    }
  }

  function descend() {
    var id = actor.world.getAt(actor.cell);
    if (id === EXIT$1) return true;
    return false;
  }

  function ascend() {
    var id = actor.world.getAt(actor.cell);
    if (id === ENTRANCE$1) return true;
    return false;
  }

  function perform(action) {
    var type = action.type,
        kind = action.kind,
        data = action.data;

    if (type !== 'action') throw new TypeError('Cannot perform action of type \'' + type + '\'');
    switch (kind) {
      case 'move':
        return move.apply(undefined, toConsumableArray(data));
      case 'moveTo':
        return moveTo.apply(undefined, toConsumableArray(data));
      case 'attack':
        return attack.apply(undefined, toConsumableArray(data));
      case 'collect':
        return collect.apply(undefined, toConsumableArray(data));
      case 'open':
        return open.apply(undefined, toConsumableArray(data));
      case 'close':
        return close.apply(undefined, toConsumableArray(data));
      case 'descend':
        return descend.apply(undefined, toConsumableArray(data));
      case 'ascend':
        return ascend.apply(undefined, toConsumableArray(data));
      case 'wait':
        return true;
    }
  }
}

var AI$$1 = { create: create$3 };

function create$3(rng) {

  return { getAction: getAction };

  function getAction(actor) {
    if (!actor.goal || Cell.isEqual(actor.cell, actor.goal)) {
      var room = rng.choose([].concat(toConsumableArray(actor.world.rooms.normal)));
      var cell = void 0;
      do {
        cell = rng.choose(room.cells);
      } while (Cell.isEqual(actor.cell, cell));
      actor.goal = cell;
    }
    return { type: 'action', kind: 'moveTo', data: [actor.goal] };
  }
}

var _World$tileIds$1 = World$$1.tileIds;
var FLOOR$2 = _World$tileIds$1.FLOOR;
var DOOR$2 = _World$tileIds$1.DOOR;
var DOOR_SECRET$2 = _World$tileIds$1.DOOR_SECRET;
var ENTRANCE$2 = _World$tileIds$1.ENTRANCE;
var EXIT$2 = _World$tileIds$1.EXIT;


var rng = RNG.create();

var Gen$$1 = { createDungeon: createDungeon };

function createDungeon(size, seed) {

  if (!size % 2) throw new RangeError('Cannot create dungeon of even size ' + size);

  if ((typeof seed === 'undefined' ? 'undefined' : _typeof(seed)) === 'object') {
    rng = seed;
    seed = rng.seed();
  } else if (isNaN(seed)) {
    seed = rng.get();
    rng.seed(seed);
  }

  // console.log('Seed:', seed)

  var world = World$$1.create(size).fill();
  var data = world.data;

  var rooms = findRooms(size);
  var mazes = findMazes(size, rooms);
  var doors = findDoors(rooms, mazes);
  fillEnds(mazes);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = rooms.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _room2 = _step.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _room2.cells[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _cell = _step3.value;

          world.setAt(_cell, FLOOR$2);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = mazes.list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var maze = _step2.value;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = maze.cells[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _cell2 = _step4.value;

          world.setAt(_cell2, FLOOR$2);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  for (var cellId in doors) {
    var cell = Cell.fromString(cellId);
    var type = DOOR$2;
    var regions = doors[cellId];
    var room = regions.sort(function (a, b) {
      return a.neighbors.size - b.neighbors.size;
    })[0];
    var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
      return neighbor in mazes.ends;
    });
    if (!neighbors.length && room.neighbors.size === 1 && rng.choose()) {
      type = DOOR_SECRET$2;
      rooms.normal.delete(room);
      rooms.secret.add(room);
    } else if (rng.choose()) type = FLOOR$2;
    world.setAt(cell, type);
  }

  world.rooms = rooms;

  function spawn(element, flags) {

    var rooms = void 0,
        cell = void 0;

    if (!flags) flags = [];else {
      if (typeof flags === 'string') flags = flags.split(' ');else if (Cell.isCell(flags)) {
        cell = flags;
        flags = [];
      }
    }
    flags = new Set(flags);

    if (!cell) {

      if (flags.has('secret')) rooms = [].concat(toConsumableArray(world.rooms.secret));else rooms = [].concat(toConsumableArray(world.rooms.normal));

      do {
        var _room = rng.choose(rooms);
        if (flags.has('center')) cell = _room.center;else cell = rng.choose(_room.cells);
      } while (world.getAt(cell) !== FLOOR$2 || world.elementsAt(cell).length);
    }

    world.spawn(element, cell);

    return cell;
  }

  var i = 3;
  while (i--) {
    spawn(Actor$$1.create({ kind: 'wyrm', faction: 'enemies', speed: 1 / 2 }));
  }spawn(ENTRANCE$2, 'center');
  spawn(EXIT$2, 'center');

  return world;
}

var findRooms = function () {

  var findRoom = function () {

    return function findRoom(min, max, worldSize) {
      var w = findRoomSize(min, max);
      var h = findRoomSize(min, max);
      var x = findRoomPosition(w, worldSize);
      var y = findRoomPosition(h, worldSize);
      return [x, y, w, h];
    };

    function findRoomSize(min, max) {
      return rng.get((max - min) / 2 + 1) * 2 + min;
    }

    function findRoomPosition(roomSize, worldSize) {
      return rng.get((worldSize - roomSize) / 2) * 2 + 1;
    }
  }();

  return function findRooms(size) {
    var area = size * size;
    var rooms = { list: [], normal: new Set(), secret: new Set(), cells: {}, edges: {} };
    var matrices = {};
    var fails = 0;
    var valid = true;
    while (valid) {
      var shape = void 0,
          matrix = void 0,
          cells = void 0,
          center = void 0;
      do {
        shape = 'rect';
        matrix = findRoom(3, 9, size);
        if (matrix in matrices) valid = false;else {
          cells = Rect.getCells(matrix);
          center = Rect.getCenter(matrix);
          valid = matrices[matrix] = !isIntersecting(rooms, cells);
        }
        if (valid) break;
        fails++;
      } while (fails < size * 2);
      if (!valid) break;
      var edges = Rect.getEdges(matrix, true);
      var room = { type: 'room', shape: shape, matrix: matrix, cells: cells, edges: edges, center: center };
      rooms.normal.add(room);
      rooms.list.push(room);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = cells[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var cell = _step5.value;

          rooms.cells[cell] = room;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = edges[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var edge = _step6.value;

          if (!rooms.edges[edge]) rooms.edges[edge] = [];
          var sharedEdges = rooms.edges[edge];
          sharedEdges.push(room);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
    return rooms;
  };

  function isIntersecting(rooms, cells) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = cells[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var cell = _step7.value;

        if (cell in rooms.cells) return true;
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    return false;
  }
}();

var findMazes = function () {

  return function findMazes(size, rooms, step) {
    step = step || 2;
    var mazes = { list: [], cells: {}, ends: {} };
    var nodes = new Set(findNodes(size).filter(function (node) {
      return !(node in rooms.cells) && !Cell.getNeighbors(node, true).filter(function (neighbor) {
        return neighbor in rooms.cells;
      }).length;
    }).map(Cell.toString));
    while (nodes.size) {
      var start = Cell.fromString(rng.choose([].concat(toConsumableArray(nodes))));
      var stack = [start];
      var maze = { type: 'maze', cells: [], ends: [] };
      var backtracking = true;
      while (stack.length) {
        var cell = void 0,
            _cell3 = cell = stack[stack.length - 1],
            _cell4 = slicedToArray(_cell3, 2),
            cellX = _cell4[0],
            cellY = _cell4[1];
        addCell(mazes, maze, cell);
        nodes.delete(cell.toString());
        var neighbors = Cell.getNeighbors(cell, false, step).filter(function (neighbor) {
          return nodes.has(neighbor.toString());
        });
        if (neighbors.length) {
          var next = rng.choose(neighbors);

          var _next = slicedToArray(next, 2),
              nextX = _next[0],
              nextY = _next[1];

          var _cell5 = cell,
              _cell6 = slicedToArray(_cell5, 2),
              _cellX = _cell6[0],
              _cellY = _cell6[1];

          var mid = void 0,
              _mid = mid = [_cellX + (nextX - _cellX) / step, _cellY + (nextY - _cellY) / step],
              _mid2 = slicedToArray(_mid, 2),
              midX = _mid2[0],
              midY = _mid2[1];
          addCell(mazes, maze, mid);
          stack.push(next);
          backtracking = false;
          if (cell === start && !backtracking) addEnd(mazes, maze, cell);
        } else {
          if (!backtracking) addEnd(mazes, maze, cell);
          backtracking = true;
          stack.pop();
        }
      }
      mazes.list.push(maze);
    }
    return mazes;
  };

  function findNodes(worldSize, offset) {
    offset = offset || 0;
    var nodes = [];
    var half = (worldSize - 1) / 2 - offset;
    var i = half * half;
    while (i--) {
      var _Cell$fromIndex = Cell.fromIndex(i, half),
          _Cell$fromIndex2 = slicedToArray(_Cell$fromIndex, 2),
          nodeX = _Cell$fromIndex2[0],
          nodeY = _Cell$fromIndex2[1];

      var node = [nodeX * 2 + 1 + offset, nodeY * 2 + 1 + offset];
      var neighbors = null;
      nodes.push(node);
    }
    return nodes;
  }

  function addCell(mazes, maze, cell) {
    maze.cells.push(cell);
    mazes.cells[cell] = maze;
  }

  function addEnd(mazes, maze, cell) {
    maze.ends.push(cell);
    mazes.ends[cell] = maze;
  }
}();

var findDoors = function () {

  return function findDoors(rooms, mazes) {

    var connectorRegions = getConnectors(rooms, mazes);

    var start = rng.choose(rooms.list);
    var stack = [start];
    var doors = {};
    var mainRegion = new Set();
    var dead = new Set();

    var regions = rooms.list.concat(mazes.list);
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = regions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var region = _step8.value;

        region.neighbors = new Map();
        region.doors = {};
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    var _loop = function _loop() {
      var node = stack[stack.length - 1];
      mainRegion.add(node);

      var connectors = void 0;
      if (node.type === 'room') connectors = node.edges.filter(function (cell) {
        if (!(cell in connectorRegions)) return false;
        var next = connectorRegions[cell].find(function (region) {
          return region !== node;
        });
        return !dead.has(next) && next.cells.length > 1;
      });else if (node.type === 'maze') connectors = node.cells.reduce(function (result, cell) {
        return result.concat(Cell.getNeighbors(cell).filter(function (neighbor) {
          return neighbor in connectorRegions;
        }));
      }, []);
      connectors = connectors.filter(function (cell) {
        var next = connectorRegions[cell].find(function (region) {
          return region !== node;
        });
        var nearby = Cell.getNeighbors(cell, true).filter(function (neighbor) {
          return neighbor in doors;
        });
        return !(cell in doors) && !node.neighbors.has(next) && (!mainRegion.has(next) || rng.choose(10)) && !nearby.length;
      });

      var connectorIds = connectors.map(Cell.toString);

      if (connectors.length) {
        var door = rng.choose(connectors);
        var _regions = connectorRegions[door];
        var next = _regions.find(function (region) {
          return region !== node;
        });
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = next.cells[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var cell = _step9.value;

            Cell.getNeighbors(cell).forEach(function (neighbor) {
              if (connectorIds.includes(neighbor.toString())) {
                delete connectorRegions[neighbor];
              }
            });
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        stack.push(next);
        doors[door] = _regions;
        mainRegion.add(node);
        connect(node, next, door);
      } else {
        stack.pop();
        if (node.type === 'maze' && node.neighbors.size === 1) {
          var _next2 = node.neighbors.entries().next().value[0];
          var _cell7 = node.neighbors.get(_next2);
          delete doors[_cell7];
          disconnect(node, _next2);
          mainRegion.delete(node);
          dead.add(node);
        }
      }
    };

    while (stack.length) {
      _loop();
    }

    return doors;
  };

  function getConnectors(rooms, mazes) {
    var connectorRegions = {};
    Object.keys(rooms.edges).map(Cell.fromString).filter(function (edge) {
      return edge[0] % 2 || edge[1] % 2;
    }).forEach(function (edge) {
      var regions = Cell.getNeighbors(edge).filter(function (neighbor) {
        return neighbor in rooms.cells || neighbor in mazes.cells;
      }).map(function (neighbor) {
        return rooms.cells[neighbor] || mazes.cells[neighbor];
      });
      if (regions.length >= 2) connectorRegions[edge] = regions;
    });
    return connectorRegions;
  }

  function connect(node, next, door) {
    connectOne(node, next, door);
    connectOne(next, node, door);
  }

  function connectOne(node, next, door) {
    node.neighbors.set(next, door);
    node.doors[door] = next;
  }

  function disconnect(node, next) {
    disconnectOne(node, next);
    disconnectOne(next, node);
  }

  function disconnectOne(node, next) {
    var connector = node.neighbors.get(next);
    delete node.doors[connector];
  }
}();

var fillEnds = function () {

  return function fillEnds(mazes) {
    mazes.ends = {};
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      var _loop2 = function _loop2() {
        var maze = _step10.value;

        var cells = new Set(maze.cells.map(Cell.toString));
        var ends = [];
        var stack = maze.ends;
        while (stack.length) {
          var cell = stack.pop();
          var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
            return neighbor in mazes.cells || neighbor in maze.doors;
          });
          if (neighbors.length > 1) {
            ends.push(cell);
            continue;
          }
          cells.delete(cell.toString());
          delete mazes.cells[cell];
          var next = neighbors[0];
          if (next) stack.unshift(next);
        }
        maze.cells = [].concat(toConsumableArray(cells)).map(Cell.fromString);
        maze.ends = ends = ends.filter(function (cell) {
          return cell in mazes.cells && Cell.getNeighbors(cell).filter(function (neighbor) {
            return neighbor in mazes.cells;
          }).length === 1;
        });
        ends.forEach(function (cell) {
          return mazes.ends[cell] = maze;
        });
      };

      for (var _iterator10 = mazes.list[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        _loop2();
      }
    } catch (err) {
      _didIteratorError10 = true;
      _iteratorError10 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion10 && _iterator10.return) {
          _iterator10.return();
        }
      } finally {
        if (_didIteratorError10) {
          throw _iteratorError10;
        }
      }
    }
  };
}();

var FOV$$1 = { get: get$1 };

function get$1(world, start, range) {
  var cells = [];
  var i = 8;
  while (i--) {
    cells = cells.concat(getOctant(world, start, range, i));
  }cells.push(start);
  return cells;
}

function getOctant(world, start, range, octant) {
  range = range || Infinity;
  var size = world.size;

  var _start = slicedToArray(start, 2),
      x = _start[0],
      y = _start[1];

  var cells = [];
  var shadows = [];
  var fullShadow = false;
  for (var row = 1; row <= range; row++) {
    var _transformOctant = transformOctant(row, 0, octant),
        _transformOctant2 = slicedToArray(_transformOctant, 2),
        transformX = _transformOctant2[0],
        transformY = _transformOctant2[1];

    var cell = [x + transformX, y + transformY];
    if (!Cell.isInside(cell, size)) break;
    for (var col = 0; col <= row; col++) {
      var _transformOctant3 = transformOctant(row, col, octant),
          _transformOctant4 = slicedToArray(_transformOctant3, 2),
          _transformX = _transformOctant4[0],
          _transformY = _transformOctant4[1];

      var _cell = [x + _transformX, y + _transformY];
      if (!Cell.isInside(_cell, size) || _transformX * _transformX + _transformY * _transformY > range * range) break;
      if (!fullShadow) {
        (function () {
          var projection = getProjection(row, col);
          var visible = !shadows.find(function (shadow) {
            return shadow.start <= projection.start && shadow.end >= projection.end;
          });
          if (visible) {
            cells.push(_cell);
            if (world.tileAt(_cell).opaque) {
              var index = void 0;
              for (index = 0; index < shadows.length; index++) {
                if (shadows[index].start >= projection.start) break;
              }var prev = shadows[index - 1];
              var next = shadows[index];
              var overPrev = index > 0 && prev.end > projection.start;
              var overNext = index < shadows.length && next.start < projection.end;
              if (overNext) {
                if (overPrev) {
                  prev.end = next.end;
                  shadows.splice(index, 1);
                } else next.start = projection.start;
              } else if (overPrev) prev.end = projection.end;else shadows.splice(index, 0, projection);
              var shadow = shadows[0];
              fullShadow = shadows.length === 1 && shadow.start === 0 && shadow.end === 1;
            }
          }
        })();
      }
    }
  }
  return cells;
}

function getProjection(row, col) {
  var start = col / (row + 2);
  var end = (col + 1) / (row + 1);
  return { start: start, end: end };
}

function transformOctant(row, col, octant) {
  switch (octant) {
    case 0:
      return [col, -row];
    case 1:
      return [row, -col];
    case 2:
      return [row, col];
    case 3:
      return [col, row];
    case 4:
      return [-col, row];
    case 5:
      return [-row, col];
    case 6:
      return [-row, -col];
    case 7:
      return [-col, -row];
  }
}

var events = {};

var SUCCESS = true;
var FAILURE = false;
var Game$$1 = { create: create$4 };

function create$4(size) {

  var rng = RNG.create();
  var ai = AI$$1.create(rng);

  var index = 0;

  var floor = void 0;
  var world = { floors: {} };

  var hero = void 0;

  var game = {
    rng: rng, world: world, floor: 0, hero: null,
    start: start, on: on, off: off, input: input, emit: emit
  };

  return game;

  function start() {
    game.floor = 0;
    game.hero = hero = Actor$$1.create({ kind: 'human', faction: 'hero' });
    descend();
    return game;
  }

  function tick() {
    var actor = void 0,
        actors = [].concat(toConsumableArray(floor.elements)).filter(function (element) {
      return element.type === 'actor';
    });
    if (!actors.length) return;
    while (hero.health) {
      index = index % actors.length;
      actor = actors[index];
      if (actor.health) {
        if (actor.energy < 1) actor.energy += actor.speed;
        while (actor.energy >= 1) {
          actor.look();
          var action = actor.action;
          if (!action) {
            if (actor === hero) {
              emit('tick');
              return;
            }
            action = ai.getAction(actor);
          }
          var _action = action,
              kind = _action.kind,
              data = _action.data;

          var result = actor.perform(action);
          if (result !== SUCCESS) {
            if (!result || result === FAILURE) {
              emit.apply(undefined, [kind + '-fail', actor].concat(toConsumableArray(data)));
              return;
            }
            if (result.type === 'actor') {
              actor.attack(result);
              kind = 'attack';
              data = [result];
            } else if (Cell.isCell(result)) {
              actor.open(result);
              kind = 'open';
              data = [result];
            }
          } else {
            if (kind === 'descend' || kind === 'ascend') {
              actor.action = null;
              if (kind === 'descend') result = descend();else if (kind === 'ascend') result = ascend();
              if (result === FAILURE) {
                emit.apply(undefined, [kind + '-fail', actor].concat(toConsumableArray(data)));
                return;
              }
            }
          }
          actor.action = null;
          actor.energy--;
          if (result !== FAILURE) emit.apply(undefined, [kind, actor].concat(toConsumableArray(data)));
        }
      }
      index++;
    }
    hero.look();
    emit('tick');
  }

  function on(event, callback) {
    var callbacks = events[event];
    if (!callbacks) callbacks = events[event] = new Set();
    callbacks.add(callback);
    return game;
  }

  function off(event, callback) {
    var callbacks = events[event];
    if (!callbacks) return false;
    callbacks.delete(callback);
    return true;
  }

  function input(kind) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      data[_key - 1] = arguments[_key];
    }

    if (!hero.health) return false;
    hero.action = { type: 'action', kind: kind, data: data };
    tick();
    return true;
  }

  function emit(event) {
    var callbacks = events[event];
    if (!callbacks) return;

    for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      data[_key2 - 1] = arguments[_key2];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var callback = _step.value;

        callback.apply(undefined, data);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function descend() {
    game.floor++;
    if (world[game.floor]) floor = world[game.floor];else {
      floor = Gen$$1.createDungeon(size, rng);
      world[game.floor] = floor;
    }
    hero.cell = floor.entrance;
    hero.world = floor;
    hero.worldId = game.floor;
    floor.elements.add(hero);
    tick();
    return true;
  }

  function ascend() {
    if (!world[game.floor - 1]) return false;
    game.floor--;
    floor = world[game.floor];
    hero.cell = floor.exit;
    hero.world = floor;
    hero.worldId = game.floor;
    tick();
    return true;
  }
}

var blessed = require('blessed');
var options = { smartCSR: true };

var screen = blessed.screen(options);
screen.title = 'Roguelike';
var MAROON = Color.MAROON;
var GREEN = Color.GREEN;
var OLIVE = Color.OLIVE;
var PURPLE = Color.PURPLE;
var TEAL = Color.TEAL;
var YELLOW = Color.GRAY;
var RED = Color.RED;
var GRAY = Color.YELLOW;
var WHITE = Color.WHITE;


var sprites = function () {

  var floor = [183, OLIVE];
  var wall = ['#', PURPLE];
  var door = ['+', TEAL];
  var doorOpen = ['/', TEAL];
  var doorSecret = wall;
  var exit = ['>', WHITE];
  var entrance = ['<', WHITE];
  var human = ['@', WHITE];
  var wyrm = ['s', GREEN];
  var corpse = ['%', MAROON];

  return { floor: floor, wall: wall, door: door, doorOpen: doorOpen, doorSecret: doorSecret, entrance: entrance, exit: exit, human: human, wyrm: wyrm, corpse: corpse };
}();

var WORLD_SIZE = 25;
var DISPLAY_WIDTH = 80;
var DISPLAY_HEIGHT = 25;

var game = Game$$1.create(WORLD_SIZE);
game.start();

var display = blessed.box({
  top: 'center',
  left: 'center',
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  tags: true
});

screen.append(display);

var box = blessed.box({
  parent: display,
  width: WORLD_SIZE,
  height: DISPLAY_HEIGHT,
  tags: true
});

display.append(box);

var log = blessed.log({
  left: WORLD_SIZE,
  width: DISPLAY_WIDTH - WORLD_SIZE,
  height: DISPLAY_HEIGHT,
  tags: true,
  border: {
    type: 'line'
  }
});

display.append(log);

function getView(actor, mouse) {
  if (!actor) throw new TypeError('Cannot get view of actor \'' + actor + '\'');
  var view = '';
  var _actor$world = actor.world,
      data = _actor$world.data,
      size = _actor$world.size;

  var mouseX = void 0,
      mouseY = void 0;
  if (mouse) {
    

    var _mouse = slicedToArray(mouse, 2);

    mouseX = _mouse[0];
    mouseY = _mouse[1];
  }var y = size;
  while (y--) {
    var row = data.slice(y * size, (y + 1) * size);
    var line = '';
    var x = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = row[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var id = _step.value;

        var cell = [x, y];
        var char = ' ',
            color = void 0;
        var type = actor.world.tileAt(cell).kind;
        if (actor) if (actor.known[actor.worldId]) type = actor.known[actor.worldId][cell];else type = null;
        if (type) {
          if (!(type in sprites)) {
            throw new TypeError('Unrecognized sprite: ' + type);
          }

          var _sprites$type = slicedToArray(sprites[type], 2);

          char = _sprites$type[0];
          color = _sprites$type[1];

          if (actor && !actor.seeing[cell]) color = GRAY;
        }
        if (typeof char === 'number') char = String.fromCharCode(char);
        if (color) if (x === mouseX && y === mouseY) char = '{black-fg}{' + color + '-bg}' + char + '{/}';else char = '{' + color + '-fg}' + char + '{/}';
        line += char;
        x++;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    view = line + view + '\n';
  }
  return view;
}

function render() {
  var view = getView(hero);
  box.setContent(view);
  screen.render();
}

screen.on('keypress', function (char, key) {
  if (key.ctrl && key.name === 'c') return process.exit(0);
  if (hero.health) {
    if (key.name in Cell.directions) {
      var direction = Cell.directions[key.name];
      game.input('move', direction);
    } else if (key.ch === '>') {
      game.input('descend');
    } else if (key.ch === '<') {
      game.input('ascend');
    } else if (key.name === 'o') {
      game.input('open');
    } else if (key.name === 'c') {
      game.input('close');
    }
  }
});

var _game$on$on$on$on$on$ = game.on('tick', function () {
  render();
}).on('move', function (actor, direction) {
  if (actor === hero) {
    var elements = hero.world.elementsAt(hero.cell);
    var corpse = elements.find(function (element) {
      return element.kind === 'corpse';
    });
    if (corpse) {
      var origin = corpse.origin;

      var _sprites$origin = slicedToArray(sprites[origin], 2),
          color = _sprites$origin[1];

      log.add('There\'s a corpse of a {' + color + '-fg}' + origin + '{/} lying here.');
    } else {
      var tile = hero.world.tileAt(hero.cell);
      if (tile.kind === 'entrance') log.add('There\'s a set of stairs going back up here.');else if (tile.kind === 'exit') log.add('There\'s a staircase going down here.');
    }
  }
}).on('attack', function (actor, target) {
  if (actor === hero) {
    if (!target.health) {
      log.add('{' + RED + '-fg}You slay the ' + target.kind + '!{/}');
    } else {
      log.add('{' + RED + '-fg}You whack the ' + target.kind + '.{/}');
    }
  } else if (target === hero) {
    if (!hero.health) {
      log.add('{' + RED + '-fg}The ' + actor.kind + ' kills you!{/}');
    } else {
      log.add('{' + YELLOW + '-fg}The ' + actor.kind + ' attacks you.{/}');
    }
  }
}).on('open', function (actor, door, secret) {
  if (actor === hero) {
    if (secret) log.add('{' + YELLOW + '-fg}You find a secret room!{/}');else log.add('You open the door.');
  }
}).on('close', function (actor, doors) {
  if (actor === hero) log.add('You close the door.');
}).on('close-fail', function (actor) {
  if (actor === hero) log.add('No doors to close!');
}).on('descend', function (actor) {
  if (actor === hero) {
    log.add('You head down the staircase to {' + YELLOW + '-fg}Floor ' + game.floor + '{/}.');
    screen.render();
  }
}).on('descend-fail', function (actor) {
  if (actor === hero) {
    log.add('There\'s nowhere to go down here!');
    screen.render();
  }
}).on('ascend', function (actor) {
  if (actor === hero) {
    log.add('You go back upstairs to {' + YELLOW + '-fg}Floor ' + game.floor + '{/}.');
    screen.render();
  }
}).on('ascend-fail', function (actor) {
  if (actor === hero) {
    log.add('There\'s nowhere to go up here!');
    screen.render();
  }
});
var hero = _game$on$on$on$on$on$.hero;

render();

})));
//# sourceMappingURL=index.js.map
