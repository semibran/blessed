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

function get$1(data, start, range) {
  var cells = [];
  var i = 8;
  while (i--) {
    cells = cells.concat(getOctant(data, start, range, i));
  }cells.push(start);
  return cells;
}

function getOctant(data, start, range, octant) {
  range = range || Infinity;
  var size = Gen$$1.getSize(data);

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
            if (Gen$$1.getTileAt(data, _cell).opaque) {
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

var constants = { left: left, right: right, up: up, down: down, upLeft: upLeft, upRight: upRight, downLeft: downLeft, downRight: downRight, directions: directions, cardinalDirections: cardinalDirections };
var methods = { toString: toString, fromString: fromString, toIndex: toIndex, fromIndex: fromIndex, isEqual: isEqual, isEdge: isEdge, isInside: isInside, getNeighbors: getNeighbors, getManhattan: getManhattan, getDistance: getDistance };

var Cell = Object.assign({}, constants, methods);

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

var FLOOR = 0;
var WALL = 1;
var DOOR = 2;
var DOOR_OPEN = 3;
var DOOR_SECRET = 4;
var ENTRANCE = 5;
var EXIT = 6;


var tiles = [{
  name: 'floor',
  walkable: true
}, {
  name: 'wall',
  opaque: true
}, {
  name: 'door',
  opaque: true,
  door: true
}, {
  name: 'doorOpen',
  walkable: true,
  door: true
}, {
  name: 'doorSecret',
  opaque: true,
  door: true
}, {
  name: 'entrance',
  walkable: true,
  stairs: true
}, {
  name: 'exit',
  walkable: true,
  stairs: true
}];

var rng$1 = RNG.create();

var sqrt = function (cache) {

  cache = cache || {};

  return function sqrt(num) {
    var cached = cache[num];
    if (cached) return cached;
    var result = cache[num] = Math.sqrt(num);
    return result;
  };
}();

var Gen$$1 = { tiles: tiles, createWorld: createWorld, createDungeon: createDungeon, spawn: spawn, fill: fill, clear: clear, getSize: getSize, getAt: getAt, getTileAt: getTileAt, setAt: setAt, elementsAt: elementsAt, entitiesAt: entitiesAt, itemsAt: itemsAt, openDoor: openDoor, closeDoor: closeDoor };

function createWorld(size) {
  var data = new Uint8ClampedArray(size * size);
  var world = { size: size, data: data, entities: [], items: [], entrance: null, exit: null };
  return world;
}

function createDungeon(size, seed) {

  if (!size % 2) throw new RangeError('Cannot create dungeon of even size ' + size);

  if ((typeof seed === 'undefined' ? 'undefined' : _typeof(seed)) === 'object') {
    rng$1 = seed;
    seed = rng$1.seed();
  } else if (isNaN(seed)) {
    seed = rng$1.get();
    rng$1.seed(seed);
  }

  console.log('Seed:', seed);

  var world = createWorld(size);

  var data = fill(world.data);

  var rooms = findRooms(data);
  var mazes = findMazes(data, rooms);
  var doors = findDoors(data, rooms, mazes);
  fillEnds(data, mazes);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = rooms.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _room = _step.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _room.cells[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _cell = _step3.value;

          setAt(data, _cell, FLOOR);
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

          setAt(data, _cell2, FLOOR);
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
    var type = DOOR;
    var regions = doors[cellId];
    var room = regions.sort(function (a, b) {
      return a.neighbors.size - b.neighbors.size;
    })[0];
    var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
      return neighbor in mazes.ends;
    });
    if (!neighbors.length && room.neighbors.size === 1 && rng$1.choose()) {
      type = DOOR_SECRET;
      rooms.normal.delete(room);
      rooms.secret.add(room);
    } else if (rng$1.choose()) type = FLOOR;
    setAt(data, cell, type);
  }

  Object.assign(world, { rooms: rooms });

  spawn(world, EXIT, 'center');

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

  return function findRooms(data) {
    var area = data.length;
    var size = sqrt(area);
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

  return function findMazes(data, rooms, step) {
    step = step || 2;
    var size = getSize(data);
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
          var next = rng$1.choose(neighbors);

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

  return function findDoors(data, rooms, mazes) {

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

  return function fillEnds(data, mazes) {
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
          setAt(data, cell, WALL);
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

function spawn(world, element, cell) {
  if (!world.rooms) return null;
  if ((typeof cell === 'undefined' ? 'undefined' : _typeof(cell)) !== 'object') {
    var valid = void 0;
    do {
      var room = rng$1.choose([].concat(toConsumableArray(world.rooms.normal)));
      if (cell !== 'center') cell = rng$1.choose(room.cells);else cell = room.center;
    } while (elementsAt(world, cell).length && getAt(world.data, cell) === FLOOR);
  }
  if (!isNaN(element)) {
    setAt(world.data, cell, element);
    if (element === ENTRANCE) world.entrance = cell;
    if (element === EXIT) world.exit = cell;
  } else if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object') {
    element.world = world;
    element.cell = cell;
    getList(world, element).push(element);
  }
  return cell;
}

function elementsAt(world, cell) {
  return entitiesAt(world, cell).concat(itemsAt(world, cell));
}

function entitiesAt(world, cell) {
  return world.entities.filter(function (entity) {
    return Cell.isEqual(entity.cell, cell);
  });
}

function itemsAt(world, cell) {
  return world.items.filter(function (item) {
    return Cell.isEqual(item.cell, cell);
  });
}

function getList(world, element) {
  switch (element.type) {
    case 'entity':
      return world.entities;
    case 'item':
      return world.items;
    default:
      return null;
  }
}

function fill(data, value, rect) {
  if (typeof value === 'undefined') value = WALL;
  var size = getSize(data);
  if (rect) {
    var _cells = Rect.getCells(rect);
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      for (var _iterator11 = _cells[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        var cell = _step11.value;

        setAt(data, cell, value);
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }
  } else {
    var i = data.length;
    while (i--) {
      data[i] = value;
    }
  }
  return data;
}

function clear(data) {
  fill(data, FLOOR);
  return data;
}

function getSize(data) {
  return sqrt(data.length);
}

function getAt(data, cell) {
  var size = getSize(data);
  if (!Cell.isInside(cell, size)) return null;
  var index = Cell.toIndex(cell, size);
  return data[index];
}

function getTileAt(data, cell) {
  return tiles[getAt(data, cell)];
}

function setAt(data, cell, value) {
  var size = getSize(data);
  if (!Cell.isInside(cell, size)) return null;
  var index = Cell.toIndex(cell, size);
  data[index] = value;
  return value;
}

function openDoor(world, cell, entity) {
  if (!entity) entity = null;
  var data = world.data.slice();
  var tile = getTileAt(data, cell);
  if (tile.door && !tile.walkable) {
    setAt(data, cell, DOOR_OPEN);
    world.data = data;
    return true;
  }
  return false;
}

function closeDoor(world, cell, entity) {
  if (!entity) entity = null;
  var data = world.data.slice();
  var tile = getTileAt(data, cell);
  if (tile.door && tile.walkable) {
    setAt(data, cell, DOOR);
    world.data = data;
    return true;
  }
  return false;
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
    var cells = FOV$$1.get(entity.world.data, entity.cell, 7);
    entity.seeing = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        var kind = Gen$$1.getTileAt(entity.world.data, cell).name;
        var other = Gen$$1.elementsAt(entity.world, cell)[0];
        if (other) kind = other.kind;
        entity.known[cell] = kind;
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
    var world = entity.world;

    var _entity$cell = slicedToArray(entity.cell, 2),
        cellX = _entity$cell[0],
        cellY = _entity$cell[1];

    var _direction = slicedToArray(direction, 2),
        distX = _direction[0],
        distY = _direction[1];

    var target = [cellX + distX, cellY + distY];
    var id = Gen$$1.getAt(world.data, target);
    var tile = Gen$$1.tiles[id];
    var entities = Gen$$1.entitiesAt(world, target);
    var items = Gen$$1.itemsAt(world, target);
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
      Gen$$1.openDoor(world, target);
      look();
      moved = true;
    }
    return moved;
  }

  function moveTo(target) {
    if (!path || path[path.length - 1] !== target) path = entity.world.findPath(entity, target);
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

var blessed = require('blessed');

var options = { smartCSR: true };

var screen = blessed.screen(options);
screen.title = 'Hello world!';

var MAROON = Color.MAROON;
var OLIVE = Color.OLIVE;
var TEAL = Color.TEAL;
var GRAY = Color.YELLOW;
var WHITE = Color.WHITE;


var sprites = function () {

  var floor = [183, OLIVE];
  var wall = ['#', TEAL];
  var door = ['+', MAROON];
  var doorOpen = ['/', MAROON];
  var doorSecret = wall;
  var entrance = ['<', WHITE];
  var exit = ['>', WHITE];
  var human = ['@', WHITE];

  return { floor: floor, wall: wall, door: door, doorOpen: doorOpen, doorSecret: doorSecret, entrance: entrance, exit: exit, human: human };
}();

function render(world, entity) {
  var view = '';
  var data = world.data,
      size = world.size;

  var y = size;
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
        var type = Gen$$1.tiles[id].name;
        if (entity) type = entity.known[cell];
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
        if (color) char = '{' + color + '-fg}' + char + '{/}';
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

var rng = RNG.create(5866.672160786003);

var floors = [];
var world = void 0;
var hero = Entity$$1.create({ entityType: 'hero', kind: 'human' });

function rerender() {
  box.setContent(render(world, hero));
  screen.render();
}

function move(direction) {
  var moved = hero.move(direction);
  if (moved) {
    rerender();
  }
}

function descend() {
  world = Gen$$1.createDungeon(25, rng);
  Gen$$1.spawn(world, hero);
  hero.look();
  floors.push(world);
  rerender();
}

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: 25,
  height: 25,
  tags: true
});

screen.on('keypress', function (ch, key) {
  if (key.name === 'escape' || key.ctrl && key.name === 'c') return process.exit(0);
  if (key.name in Cell.cardinalDirections) move(Cell.directions[key.name]);
  if (key.ch === '>') {
    console.log(hero.cell);
    if (Gen$$1.getTileAt(world.data, hero.cell).name === 'exit') descend();
  }
});

screen.append(box);

descend();

})));
//# sourceMappingURL=index.js.map
