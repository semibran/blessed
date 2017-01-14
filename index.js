(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

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

var Entity$$1 = { create: create$1 };

function create$1(options) {

  var entity = {
    entityType: null,
    kind: null
  };

  var props = {
    type: 'entity',
    wandering: true,
    health: 1,
    seeing: {},
    known: {},
    world: null,
    cell: null
  };

  Object.assign(entity, options, props);

  var path = null;

  function look() {
    var cells = FOV$$1.get(entity.world, entity.cell, 7);
    entity.seeing = {};
    if (!entity.known[entity.world.id]) entity.known[entity.world.id] = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        var kind = entity.world.tileAt(cell).kind;
        var other = entity.world.elementsAt(cell)[0];
        if (other) kind = other.kind;
        entity.known[entity.world.id][cell] = kind;
        entity.seeing[cell] = true;
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
    var moved = false;

    var _entity$cell = slicedToArray(entity.cell, 2),
        cellX = _entity$cell[0],
        cellY = _entity$cell[1];

    var _direction = slicedToArray(direction, 2),
        distX = _direction[0],
        distY = _direction[1];

    var target = [cellX + distX, cellY + distY];
    var tile = entity.world.tileAt(target);
    var elements = entity.world.elementsAt(target);
    var entities = elements.filter(function (element) {
      return element.type === 'entity';
    });
    var items = elements.filter(function (element) {
      return element.type === 'item';
    });
    if (entities.length) {
      var enemy = entities[0];
      attack(enemy);
    } else if (tile.walkable) {
      if (!entities.length) {
        entity.cell = target;
        if (items.length) {
          var item = items[0];
          entity.collect(item);
        } else {
          moved = true;
        }
        look();
      }
    } else if (tile.door) {
      entity.world.setAt(target, World$$1.tileIds.DOOR_OPEN);
      look();
    }
    return moved;
  }

  function moveTo(target) {
    if (!path || path[path.length - 1] !== target) {
      (function () {
        var cells = {};
        var entities = [].concat(toConsumableArray(entity.world.elements)).filter(function (element) {
          return element.type === 'entity';
        });
        entity.world.data.forEach(function (id, index) {
          var cell = Cell.fromIndex(index, entity.world.size);
          if (!entity.known[entity.world.id][cell] || entities.filter(function (entity) {
            return Cell.isEqual(entity.cell, cell);
          }).length) cells[cell] = Infinity;
        });
        path = entity.world.findPath(entity.cell, target, { cells: cells });
      })();
    }
    if (!path) return false;
    var next = void 0;
    path.some(function (cell, index) {
      if (!Cell.isEqual(entity.cell, cell)) return;
      next = path[index + 1];
      return true;
    });
    if (!next) return false;

    var _entity$cell2 = slicedToArray(entity.cell, 2),
        cellX = _entity$cell2[0],
        cellY = _entity$cell2[1];

    var _next = next,
        _next2 = slicedToArray(_next, 2),
        nextX = _next2[0],
        nextY = _next2[1];

    var dist = [nextX - cellX, nextY - cellY];
    return entity.move(dist);
  }

  function attack(other) {
    other.health--;
    if (other.health <= 0) {
      entity.world.kill(other);
      look();
    }
  }

  function collect(item) {
    if (Cell.isEqual(entity.cell, item.cell)) {
      entity.world.kill(item);
      entity.world.emit('item', entity, item);
    }
  }

  var methods = { look: look, move: move, moveTo: moveTo, attack: attack, collect: collect };
  return Object.assign(entity, methods);
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


var World$$1 = { create: create$2, tiles: tiles, tileIds: tileIds, tileCosts: tileCosts };

function create$2(size, id) {

  var data = new Uint8ClampedArray(size * size);
  var world = {

    // Properties
    size: size, data: data, elements: new Set(), id: id || null, entrance: null, exit: null,

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
    elements.remove(element);
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
var FLOOR$1 = _World$tileIds.FLOOR;
var DOOR$1 = _World$tileIds.DOOR;
var DOOR_SECRET$1 = _World$tileIds.DOOR_SECRET;
var ENTRANCE$1 = _World$tileIds.ENTRANCE;
var EXIT$1 = _World$tileIds.EXIT;


var rng$1 = RNG.create();

var Gen$$1 = { createDungeon: createDungeon };

function createDungeon(size, seed, hero, id) {

  if (!size % 2) throw new RangeError('Cannot create dungeon of even size ' + size);

  if ((typeof seed === 'undefined' ? 'undefined' : _typeof(seed)) === 'object') {
    rng$1 = seed;
    seed = rng$1.seed();
  } else if (isNaN(seed)) {
    seed = rng$1.get();
    rng$1.seed(seed);
  }

  // console.log('Seed:', seed)

  var world = World$$1.create(size, id).fill();
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
          var _cell2 = _step3.value;

          world.setAt(_cell2, FLOOR$1);
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
          var _cell3 = _step4.value;

          world.setAt(_cell3, FLOOR$1);
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
    var type = DOOR$1;
    var regions = doors[cellId];
    var room = regions.sort(function (a, b) {
      return a.neighbors.size - b.neighbors.size;
    })[0];
    var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
      return neighbor in mazes.ends;
    });
    if (!neighbors.length && room.neighbors.size === 1 && rng$1.choose()) {
      type = DOOR_SECRET$1;
      rooms.normal.delete(room);
      rooms.secret.add(room);
    } else if (rng$1.choose()) type = FLOOR$1;
    world.setAt(cell, type);
  }

  world.rooms = rooms;

  function spawn(element, flags) {

    var rooms = void 0,
        cell = void 0;

    if (!flags) flags = [];else {
      if (typeof flags === 'string') flags = flags.split(' ');else if (Array.isArray(flags)) {
        cell = flags;
        flags = [];
      }
    }
    flags = new Set(flags);

    if (!cell) {
      if (flags.has('secret')) rooms = world.rooms.secret;else rooms = world.rooms.normal;

      var _room = rng$1.choose([].concat(toConsumableArray(rooms)));
      if (flags.has('center')) cell = _room.center;else {
        do {
          cell = rng$1.choose(_room.cells);
        } while (world.getAt(cell) !== FLOOR$1 || world.elementsAt(cell).length);
      }
    }

    world.spawn(element, cell);

    return cell;
  }

  if (hero) {
    var _cell = spawn(hero, 'center');
    spawn(ENTRANCE$1, _cell);
  }
  spawn(EXIT$1, 'center');

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
      return rng$1.get((max - min) / 2 + 1) * 2 + min;
    }

    function findRoomPosition(roomSize, worldSize) {
      return rng$1.get((worldSize - roomSize) / 2) * 2 + 1;
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
      var start = Cell.fromString(rng$1.choose([].concat(toConsumableArray(nodes))));
      var stack = [start];
      var maze = { type: 'maze', cells: [], ends: [] };
      var backtracking = true;
      while (stack.length) {
        var cell = void 0,
            _cell4 = cell = stack[stack.length - 1],
            _cell5 = slicedToArray(_cell4, 2),
            cellX = _cell5[0],
            cellY = _cell5[1];
        addCell(mazes, maze, cell);
        nodes.delete(cell.toString());
        var neighbors = Cell.getNeighbors(cell, false, step).filter(function (neighbor) {
          return nodes.has(neighbor.toString());
        });
        if (neighbors.length) {
          var next = rng$1.choose(neighbors);

          var _next = slicedToArray(next, 2),
              nextX = _next[0],
              nextY = _next[1];

          var _cell6 = cell,
              _cell7 = slicedToArray(_cell6, 2),
              _cellX = _cell7[0],
              _cellY = _cell7[1];

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

    var start = rng$1.choose(rooms.list);
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
        return !(cell in doors) && !node.neighbors.has(next) && (!mainRegion.has(next) || rng$1.choose(10)) && !nearby.length;
      });

      var connectorIds = connectors.map(Cell.toString);

      if (connectors.length) {
        var door = rng$1.choose(connectors);
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
          var _cell8 = node.neighbors.get(_next2);
          delete doors[_cell8];
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

var directions$1 = {
  left: [-1, 0],
  upLeft: [-1, -1],
  up: [0, -1],
  upRight: [1, -1],
  right: [1, 0],
  downRight: [1, 1],
  down: [0, 1],
  downLeft: [-1, 1]
};
var left = directions$1.left;
var upLeft = directions$1.upLeft;
var up = directions$1.up;
var upRight = directions$1.upRight;
var right = directions$1.right;
var downRight = directions$1.downRight;
var down = directions$1.down;
var downLeft = directions$1.downLeft;

var cardinalDirections = { left: left, up: up, right: right, down: down };

var Cell = {

  // Constants
  left: left, right: right, up: up, down: down, upLeft: upLeft, upRight: upRight, downLeft: downLeft, downRight: downRight, directions: directions$1, cardinalDirections: cardinalDirections,

  // Methods
  toString: toString, fromString: fromString, toIndex: toIndex, fromIndex: fromIndex, isEqual: isEqual, isEdge: isEdge, isInside: isInside, getNeighbors: getNeighbors, getManhattan: getManhattan, getDistance: getDistance

};

function toString(cell) {
  return cell.toString();
}

function fromString(string) {
  return string.split(',').map(Number);
}

function toIndex(cell, size) {
  var _cell = slicedToArray(cell, 2),
      x = _cell[0],
      y = _cell[1];

  return y * size + x;
}

function fromIndex(index, size) {
  var x = index % size;
  var y = (index - x) / size;
  return [x, y];
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isEdge(cell, size) {
  var _cell2 = slicedToArray(cell, 2),
      x = _cell2[0],
      y = _cell2[1];

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
  var _cell3 = slicedToArray(cell, 2),
      x = _cell3[0],
      y = _cell3[1];

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

function getNeighbors(cell, diagonals, step) {
  if (!cell) throw new TypeError('Cannot get neighbors of cell \'' + cell + '\'');
  step = step || 1;

  var _cell4 = slicedToArray(cell, 2),
      x = _cell4[0],
      y = _cell4[1];

  var neighbors = [];
  var dirs = cardinalDirections;
  if (diagonals) dirs = directions$1;
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

var blessed = require('blessed');

var options = { smartCSR: true };

var screen = blessed.screen(options);
screen.title = 'Hello world!';

var MAROON = Color.MAROON;
var OLIVE = Color.OLIVE;
var TEAL = Color.TEAL;
var YELLOW = Color.GRAY;
var GRAY = Color.YELLOW;
var WHITE = Color.WHITE;


var sprites = function () {

  var floor = [183, TEAL];
  var wall = ['#', OLIVE];
  var door = ['+', MAROON];
  var doorOpen = ['/', MAROON];
  var doorSecret = wall;
  var entrance = ['<', WHITE];
  var exit = ['>', WHITE];
  var human = ['@', WHITE];

  return { floor: floor, wall: wall, door: door, doorOpen: doorOpen, doorSecret: doorSecret, entrance: entrance, exit: exit, human: human };
}();

function render(world, entity, mouse) {
  var view = '';
  var data = world.data,
      size = world.size;

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
        var type = World$$1.tiles[id].name;
        if (entity) type = entity.known[world.id][cell];
        if (type) {
          if (!(type in sprites)) {
            throw new TypeError('Unrecognized sprite: ' + type);
          }

          var _sprites$type = slicedToArray(sprites[type], 2);

          char = _sprites$type[0];
          color = _sprites$type[1];

          if (entity && !entity.seeing[cell]) color = GRAY;
        }
        if (typeof char === 'number') char = String.fromCharCode(char);
        if (color) if (x === mouseX && y === mouseY) char = '{black-fg}{' + color + '-bg}' + char + '{/}';else char = '{' + color + '-fg}' + char + '{/}';
        line += '{black-bg}' + char + '{/}';
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

var rng = RNG.create();

var floors = {};
var floor = 0;
var world = void 0;
var hero = Entity$$1.create({ kind: 'human', faction: 'hero' });
var mouse = null;
var moving = false;

function ascend() {
  var newFloor = floor - 1;
  if (!floors[newFloor]) log.add('You can\'t leave the dungeon.');else {
    floor = newFloor;
    hero.world = world = floors[floor];
    hero.cell = world.exit;
    hero.look();
    log.add('You go back upstairs to Floor ' + floor + '.');
  }
  rerender();
}

function descend() {
  floor++;
  if (!floors[floor]) {
    world = Gen$$1.createDungeon(25, rng, hero, floor);
    hero.look();
    floors[floor] = world;
    if (floor === 1) log.add('{' + YELLOW + '-fg}Welcome to the Dungeon!{/}');else log.add('You head downstairs to {' + YELLOW + '-fg}Floor ' + floor + '{/}.');
  } else {
    hero.world = world = floors[floor];
    hero.cell = world.entrance;
    hero.look();
    log.add('You head back downstairs to {' + YELLOW + '-fg}Floor ' + floor + '{/}.');
  }
  rerender();
}

function move(direction) {
  hero.move(direction);
  rerender();
}

function rerender() {
  box.setContent(render(world, hero, mouse));
  screen.render();
}

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: 25,
  height: 25,
  tags: true
});

var log = blessed.log({
  bottom: 0,
  width: '100%',
  height: 7,
  tags: true,
  border: {
    type: 'line'
  }
});

box.on('mousemove', function (event) {
  mouse = [event.x - box.aleft, event.y - box.atop];
  rerender();
});

box.on('click', function (event) {
  mouse = [event.x - box.aleft, event.y - box.atop];

  var target = [event.x - box.aleft, event.y - box.atop];

  if (moving) {
    moving = false;
    return;
  }

  if (Cell.isEqual(hero.cell, target)) {
    var tile = world.tileAt(hero.cell);
    if (tile.kind === 'entrance') ascend();else if (tile.kind === 'exit') descend();
    return;
  }

  function step() {
    if (!moving) return;
    var moved = moving = hero.moveTo(target);
    if (moved) setTimeout(step, 1000 / 30);
    rerender();
  }
  moving = true;
  step();
});

box.on('mouseout', function (event) {
  mouse = null;
  rerender();
});

var directions = Cell.directions;
var WASD = {
  w: directions.up,
  a: directions.left,
  s: directions.down,
  d: directions.right
};

screen.on('keypress', function (ch, key) {

  if (key.name === 'escape' || key.ctrl && key.name === 'c') return process.exit(0);

  if (!moving) {
    if (key.name in directions) move(directions[key.name]);else if (key.name in WASD) move(WASD[key.name]);
  }

  var tile = world.tileAt(hero.cell);
  if (key.ch === '<' && tile.kind === 'entrance') ascend();else if (key.ch === '>' && tile.kind === 'exit') descend();
});

screen.append(box);
screen.append(log);

descend();

})));
//# sourceMappingURL=index.js.map
