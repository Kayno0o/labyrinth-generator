import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';

type Grid = Array<Array<Bloc>>;

type Direction = {
  dir: 'bottom' | 'left' | 'top' | 'right';
  reverseDir: 'bottom' | 'left' | 'top' | 'right';
  x: 1 | -1 | 0;
  y: 1 | -1 | 0;
};

class Bloc {
  bottom: boolean = true;
  left: boolean = true;
  right: boolean = true;
  top: boolean = true;
  x: number;
  y: number;
  pos: number | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const width = 21;
const height = 29;
const gridSize = 100;
const strokeWeight: number = 30;

let maxPos = 0;

const directions: Array<Direction> = [
  { dir: 'bottom', reverseDir: 'top', x: 0, y: 1 },
  { dir: 'top', reverseDir: 'bottom', x: 0, y: -1 },
  { dir: 'right', reverseDir: 'left', x: 1, y: 0 },
  { dir: 'left', reverseDir: 'right', x: -1, y: 0 },
];

export default function generateMaze() {
  const canvas = createCanvas(width * gridSize, height * gridSize);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.font = `${gridSize / 3}px serif`;
  ctx.lineWidth = strokeWeight;
  ctx.lineCap = 'round';

  const grid: Grid = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => new Bloc(x, y)));

  carveGrid(grid);

  drawGrid(ctx, grid);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(__dirname + '/1.png', buffer);

  console.log('END');
}

function carveGrid(grid: Grid) {
  const startingBloc: Bloc = getRandomBloc(grid);

  startingBloc.pos = 0;

  carveBloc(startingBloc, grid, 1);
}

function carveBloc(bloc: Bloc, grid: Grid, i = 0): Bloc | null {
  const tries = [0, 1, 2, 3];

  let randomPos: number;
  let dir: Direction;
  let nextBloc: Bloc | null;

  if (bloc.bottom || bloc.top || bloc.right || bloc.left) {
    do {
      randomPos = randomInt(tries.length);
      dir = directions[tries[randomPos]];

      tries.splice(randomPos, 1);

      if (!bloc[dir.dir]) {
        nextBloc = null;
        continue;
      }

      nextBloc = getBlocFromDirection(dir, bloc, grid);

      if (!nextBloc || nextBloc.pos !== null || !nextBloc[dir.reverseDir]) {
        nextBloc = null;
        continue;
      }
    } while (tries.length !== 0 && nextBloc === null);
  }

  if (!nextBloc) {
    if (bloc.pos === 0) return;

    const previousBloc = getPreviousBloc(bloc, grid);

    if (!previousBloc) return;

    carveBloc(previousBloc, grid, ++i);

    return;
  }

  bloc[dir.dir] = false;
  nextBloc[dir.reverseDir] = false;

  nextBloc.pos = i;

  if (i > maxPos) maxPos = i;

  carveBloc(nextBloc, grid, ++i);
}

function getPreviousBloc(bloc: Bloc, grid: Grid): Bloc | null {
  let prevBloc: Bloc | null = null;

  directions.forEach((dir) => {
    if (bloc[dir.dir]) return;

    const b = getBlocFromDirection(dir, bloc, grid);

    if (!prevBloc || prevBloc.pos > b.pos) {
      prevBloc = b;
    }
  });

  return prevBloc;
}

function getBlocFromDirection(dir: Direction, bloc: Bloc, grid: Grid): Bloc | null {
  const x = bloc.x + dir.x;
  const y = bloc.y + dir.y;

  if (x < 0 || y < 0 || x >= width || y >= height) return null;

  return grid[x][y];
}

function drawGrid(ctx: CanvasRenderingContext2D, grid: Grid) {
  let randomBloc: Bloc;

  do {
    randomBloc = getRandomBloc(grid);
  } while (!randomBloc || randomBloc.pos === 0);

  for (let x = 0; x < grid.length; x++) {
    const col = grid[x];
    for (let y = 0; y < col.length; y++) {
      const bloc = col[y];

      let color: string | null = null;

      if (bloc.pos === 0) {
        color = 'green';
      }

      if (bloc.pos === randomBloc.pos) {
        color = 'red';
      }

      drawBloc(ctx, bloc, color);
    }
  }
}

function getRandomBloc(grid: Grid): Bloc {
  const [x, y] = [randomInt(width), randomInt(height)];

  return grid[x][y];
}

function drawBloc(ctx: CanvasRenderingContext2D, bloc: Bloc, color: string | null = null) {
  const l = bloc.x * gridSize;
  const r = bloc.x * gridSize + gridSize;

  const t = bloc.y * gridSize;
  const b = bloc.y * gridSize + gridSize;

  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(l + strokeWeight, t + strokeWeight, gridSize - strokeWeight * 2, gridSize - strokeWeight * 2);
  }

  // if (bloc.pos !== null) {
  //   ctx.fillText(String(bloc.pos), l + gridSize / 5, b - gridSize / 5);
  // }

  ctx.beginPath();

  if (bloc.bottom) {
    ctx.moveTo(l, b);
    ctx.lineTo(r, b);
  }

  if (bloc.top) {
    ctx.moveTo(l, t);
    ctx.lineTo(r, t);
  }

  if (bloc.left) {
    ctx.moveTo(l, t);
    ctx.lineTo(l, b);
  }

  if (bloc.right) {
    ctx.moveTo(r, t);
    ctx.lineTo(r, b);
  }

  ctx.stroke();
}

/**
 * if no max given, return a number between 0 and min
 *
 * @param min min value
 * @param max max value
 * @returns random number
 */
function randomInt(min: number, max: number | null = null): number {
  return Math.floor(Math.random() * (max ? max - min : min) + (max ? min : 0));
}
