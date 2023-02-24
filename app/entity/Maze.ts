import { randomInt } from 'crypto';
import { E, Grid, N, S, W, directions } from './../types';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import Bloc from './Bloc';
import fs from 'fs';

export default class Maze {
  grid: Grid = [];
  width: number;
  height: number;
  gridSize: number;
  strokeWeight: number;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  start: Bloc;
  end: Bloc;
  hasRainbowGrid: boolean;

  constructor(
    width: number = 20,
    height: number = 20,
    gridSize: number = 100,
    strokeWeight: number = 30,
    hasRainbowGrid: boolean = false,
  ) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.strokeWeight = strokeWeight;
    this.hasRainbowGrid = hasRainbowGrid;

    this.generateMaze();
  }

  public generateMaze() {
    console.log('\n\n-- generating maze... --');

    this.initCanvas();

    this.initGrid();
    this.initStart();
    this.initEnd();

    this.carveGrid();

    console.log('-- maze generated ! --');
  }

  protected carveGrid() {
    throw new Error('Method not implemented.');
  }

  public drawMaze() {
    console.log('\n\n-- drawing maze... --');

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

        if (bloc.pos !== null && bloc.pos === this.end.pos) {
          color = 'red';
        }

        bloc.draw(this, color);
      }
    }

    console.log('-- maze drawn --');
  }

  public drawSolution(color: string = 'blue', strokeWeight = 10) {
    let previousBloc: Bloc | null = this.end;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWeight;

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

  protected initCanvas() {
    this.canvas = createCanvas(this.width * this.gridSize, this.height * this.gridSize);
    this.ctx = this.canvas.getContext('2d');
  }

  protected initGrid() {
    this.grid = [...Array(this.width)].map((_, x) => [...Array(this.height)].map((_, y) => new Bloc(x, y)));
  }

  protected initStart() {
    this.start = this.getRandomBloc();
    this.start.pos = 0;
  }

  protected initEnd() {
    do {
      this.end = this.getRandomBloc();
    } while (!this.end || this.end.pos === 0);
  }

  protected getRandomBloc(): Bloc {
    const [x, y] = [randomInt(this.width), randomInt(this.height)];

    return this.grid[x][y];
  }

  public saveCanvas(path: string = __dirname + '/maze.png') {
    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFileSync(path, buffer);
  }

  protected getPreviousBloc(bloc: Bloc): Bloc | null {
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

  protected getBlocFromDirection(dir: number, bloc: Bloc): Bloc | null {
    const x = bloc.x + directions[dir][0];
    const y = bloc.y + directions[dir][1];

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;

    return this.grid[x][y];
  }
}
