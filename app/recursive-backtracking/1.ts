import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';
import { randomInt } from '../utils';

let maxPos = 0;

const [N, S, E, W] = [1, 2, 4, 8];
const OPPOSITES = { [E]: W, [N]: S, [S]: N, [W]: E };
const directions: { [direction: number]: [number, number] } = {
  [E]: [1, 0],
  [N]: [0, -1],
  [S]: [0, 1],
  [W]: [-1, 0],
};

class Bloc {
  value: number = N + S + W + E;
  x: number;
  y: number;
  pos: number | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Maze {
  grid: Array<Array<Bloc>> = [];
  width: number;
  height: number;
  gridSize: number;
  strokeWeight: number;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  start: Bloc;
  end: Bloc;

  constructor(width: number = 20, height: number = 20, gridSize: number = 100, strokeWeight: number = 30) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.strokeWeight = strokeWeight;

    this.generateMaze();
  }

  public generateMaze() {
    this.grid = [...Array(this.width)].map((_, x) => [...Array(this.height)].map((_, y) => new Bloc(x, y)));

    this.canvas = createCanvas(this.width * this.gridSize, this.height * this.gridSize);
    this.ctx = this.canvas.getContext('2d');

    this.start = this.getRandomBloc();
    this.start.pos = 0;

    do {
      this.end = this.getRandomBloc();
    } while (!this.end || this.end.pos === 0);

    this.carveBloc(this.start, 1);
  }

  private carveBloc(bloc: Bloc, i = 0): Bloc | null {
    let [nextBloc, dir] = this.getNextBloc(bloc);

    if (!nextBloc) {
      if (bloc.pos === 0) return;

      do {
        bloc = this.getPreviousBloc(bloc);

        if (!bloc || bloc.pos === 0) return;

        [nextBloc, dir] = this.getNextBloc(bloc);
      } while (!nextBloc);

      return this.carveBloc(bloc, ++i);
    }

    bloc.value -= dir;
    nextBloc.value -= OPPOSITES[dir];

    nextBloc.pos = i;

    if (i > maxPos) maxPos = i;

    return this.carveBloc(nextBloc, ++i);
  }

  private getNextBloc(bloc: Bloc): [Bloc | null, number] {
    const tries = [1, 2, 4, 8];

    let dir: number;
    let randomPos: number;
    let nextBloc: Bloc | null;

    if (bloc.value & S || bloc.value & N || bloc.value & E || bloc.value & W) {
      do {
        randomPos = randomInt(tries.length);
        dir = tries[randomPos];

        tries.splice(randomPos, 1);

        if (!(bloc.value & dir)) {
          nextBloc = null;
          continue;
        }

        nextBloc = this.getBlocFromDirection(dir, bloc);

        if (!nextBloc || nextBloc.pos !== null || !(nextBloc.value & OPPOSITES[dir])) {
          nextBloc = null;
          continue;
        }
      } while (tries.length !== 0 && nextBloc === null);
    }

    return [nextBloc, dir];
  }

  private getPreviousBloc(bloc: Bloc): Bloc | null {
    let prevBloc: Bloc | null = null;

    [N, S, E, W].forEach((dir) => {
      if (bloc.value & dir) return;

      const b = this.getBlocFromDirection(dir, bloc);

      if (!prevBloc || prevBloc.pos > b.pos) {
        prevBloc = b;
      }
    });

    return prevBloc;
  }

  private getBlocFromDirection(dir: number, bloc: Bloc): Bloc | null {
    const x = bloc.x + directions[dir][0];
    const y = bloc.y + directions[dir][1];

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;

    return this.grid[x][y];
  }

  public drawMaze() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.lineWidth = this.strokeWeight;
    this.ctx.lineCap = 'round';

    for (let x = 0; x < this.grid.length; x++) {
      const col = this.grid[x];
      for (let y = 0; y < col.length; y++) {
        const bloc = col[y];

        let color: string | null = null;

        if (bloc.pos === 0) {
          color = 'green';
        }

        if (bloc.pos === this.end.pos) {
          color = 'red';
        }

        this.drawBloc(bloc, color);
      }
    }
  }

  public drawSolution(color: string = 'blue') {
    let previousBloc: Bloc | null = this.end;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.strokeWeight / 4;

    do {
      const [x1, y1] = [
        previousBloc.x * this.gridSize + this.gridSize / 2,
        previousBloc.y * this.gridSize + this.gridSize / 2,
      ];

      previousBloc = this.getPreviousBloc(previousBloc);

      if (previousBloc === null) break;

      const [x2, y2] = [
        previousBloc.x * this.gridSize + this.gridSize / 2,
        previousBloc.y * this.gridSize + this.gridSize / 2,
      ];

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    } while (previousBloc && previousBloc.pos !== 0);
  }

  public saveCanvas(path: string = __dirname + '/1.png') {
    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFileSync(path, buffer);
  }

  private getRandomBloc(): Bloc {
    const [x, y] = [randomInt(this.width), randomInt(this.height)];

    return this.grid[x][y];
  }

  private drawBloc(bloc: Bloc, color: string | null = null) {
    const l = bloc.x * this.gridSize;
    const r = bloc.x * this.gridSize + this.gridSize;

    const t = bloc.y * this.gridSize;
    const b = bloc.y * this.gridSize + this.gridSize;

    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        l + this.strokeWeight,
        t + this.strokeWeight,
        this.gridSize - this.strokeWeight * 2,
        this.gridSize - this.strokeWeight * 2,
      );
    }

    this.ctx.beginPath();

    if (bloc.value & S) {
      this.ctx.moveTo(l, b);
      this.ctx.lineTo(r, b);
    }

    if (bloc.value & N) {
      this.ctx.moveTo(l, t);
      this.ctx.lineTo(r, t);
    }

    if (bloc.value & W) {
      this.ctx.moveTo(l, t);
      this.ctx.lineTo(l, b);
    }

    if (bloc.value & E) {
      this.ctx.moveTo(r, t);
      this.ctx.lineTo(r, b);
    }

    this.ctx.stroke();
  }
}
