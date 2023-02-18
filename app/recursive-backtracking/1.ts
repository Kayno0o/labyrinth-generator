import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';
import { randomInt } from '../utils';

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

let maxPos = 0;

const directions: Array<Direction> = [
  { dir: 'bottom', reverseDir: 'top', x: 0, y: 1 },
  { dir: 'top', reverseDir: 'bottom', x: 0, y: -1 },
  { dir: 'right', reverseDir: 'left', x: 1, y: 0 },
  { dir: 'left', reverseDir: 'right', x: -1, y: 0 },
];

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

  generateMaze() {
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

        nextBloc = this.getBlocFromDirection(dir, bloc);

        if (!nextBloc || nextBloc.pos !== null || !nextBloc[dir.reverseDir]) {
          nextBloc = null;
          continue;
        }
      } while (tries.length !== 0 && nextBloc === null);
    }

    if (!nextBloc) {
      if (bloc.pos === 0) return;

      const previousBloc = this.getPreviousBloc(bloc);

      if (!previousBloc) return;

      this.carveBloc(previousBloc, ++i);

      return;
    }

    bloc[dir.dir] = false;
    nextBloc[dir.reverseDir] = false;

    nextBloc.pos = i;

    if (i > maxPos) maxPos = i;

    this.carveBloc(nextBloc, ++i);
  }

  private getPreviousBloc(bloc: Bloc): Bloc | null {
    let prevBloc: Bloc | null = null;

    directions.forEach((dir) => {
      if (bloc[dir.dir]) return;

      const b = this.getBlocFromDirection(dir, bloc);

      if (!prevBloc || prevBloc.pos > b.pos) {
        prevBloc = b;
      }
    });

    return prevBloc;
  }

  private getBlocFromDirection(dir: Direction, bloc: Bloc): Bloc | null {
    const x = bloc.x + dir.x;
    const y = bloc.y + dir.y;

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;

    return this.grid[x][y];
  }

  private drawGrid() {
    const canvas = createCanvas(this.width * this.gridSize, this.height * this.gridSize);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.font = `${this.gridSize / 3}px serif`;
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
}
