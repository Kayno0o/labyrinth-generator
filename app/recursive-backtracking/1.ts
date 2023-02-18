import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';
import { randomInt } from '../utils';

let maxPos = 0;

const [N, S, E, W] = [1, 2, 4, 8];
const OPPOSITES = { [N]: S, [S]: N, [E]: W, [W]: E };
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

  constructor(width: number = 20, height: number = 20, gridSize: number = 100, strokeWeight: number = 30) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.strokeWeight = strokeWeight;
  }

  public generateMaze() {
    this.grid = [...Array(this.width)].map((_, x) => [...Array(this.height)].map((_, y) => new Bloc(x, y)));

    this.carveGrid();

    this.drawGrid();

    console.log('END');
  }

  private carveGrid() {
    const startingBloc: Bloc = this.getRandomBloc();

    startingBloc.pos = 0;

    this.carveBloc(startingBloc, 1);
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

  private drawGrid() {
    const canvas = createCanvas(this.width * this.gridSize, this.height * this.gridSize);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.lineWidth = this.strokeWeight;
    ctx.lineCap = 'round';

    let randomBloc: Bloc;

    do {
      randomBloc = this.getRandomBloc();
    } while (!randomBloc || randomBloc.pos === 0);

    for (let x = 0; x < this.grid.length; x++) {
      const col = this.grid[x];
      for (let y = 0; y < col.length; y++) {
        const bloc = col[y];

        let color: string | null = null;

        if (bloc.pos === 0) {
          color = 'green';
        }

        if (bloc.pos === randomBloc.pos) {
          color = 'red';
        }

        this.drawBloc(ctx, bloc, color);
      }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(__dirname + '/1.png', buffer);
  }

  private getRandomBloc(): Bloc {
    const [x, y] = [randomInt(this.width), randomInt(this.height)];

    return this.grid[x][y];
  }

  private drawBloc(ctx: CanvasRenderingContext2D, bloc: Bloc, color: string | null = null) {
    const l = bloc.x * this.gridSize;
    const r = bloc.x * this.gridSize + this.gridSize;

    const t = bloc.y * this.gridSize;
    const b = bloc.y * this.gridSize + this.gridSize;

    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(
        l + this.strokeWeight,
        t + this.strokeWeight,
        this.gridSize - this.strokeWeight * 2,
        this.gridSize - this.strokeWeight * 2,
      );
    }

    ctx.beginPath();

    if (bloc.value & S) {
      ctx.moveTo(l, b);
      ctx.lineTo(r, b);
    }

    if (bloc.value & N) {
      ctx.moveTo(l, t);
      ctx.lineTo(r, t);
    }

    if (bloc.value & W) {
      ctx.moveTo(l, t);
      ctx.lineTo(l, b);
    }

    if (bloc.value & E) {
      ctx.moveTo(r, t);
      ctx.lineTo(r, b);
    }

    ctx.stroke();
  }
}
