import { randomInt } from 'crypto';
import { E, Grid, MazeProps as MazeProps, N, OPPOSITES, S, W, Wall, directions, walls } from './../types';
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
  benchmark: boolean;

  constructor(props: MazeProps) {
    this.width = Math.max(2, props.width > 0 ? props.width : props.size);
    this.height = Math.max(2, props.height > 0 ? props.height : props.size);

    this.gridSize = props.blocSize;
    this.strokeWeight = props.lineWidth;
    this.hasRainbowGrid = props.rainbowGrid;

    this.benchmark = props.benchmark;

    this.generateMaze();
  }

  public generateMaze() {
    let i = 0;
    let benchmark = 500;

    const label = this.benchmark
      ? `Generating ${benchmark} ${this.constructor.name}`
      : `Generating ${this.constructor.name}`;

    console.time(label);

    do {
      this.initCanvas();

      this.initGrid();
      this.initStart();
      this.initEnd();

      this.carveGrid();
      ++i;
    } while (this.benchmark && i < benchmark);

    console.timeEnd(label);
  }

  protected carveGrid() {
    throw new Error('Method not implemented.');
  }

  public drawMaze() {
    const label = `Drawing ${this.constructor.name}`;

    console.time(label);

    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.lineWidth = this.strokeWeight;
    this.ctx.lineCap = 'round';

    this.start.draw(this, 'green');
    this.end.draw(this, 'red');

    for (let x = 0; x < this.grid.length; x++) {
      const col = this.grid[x];
      for (let y = 0; y < col.length; y++) {
        col[y].draw(this);
      }
    }

    console.timeEnd(label);
  }

  public drawSolution(color: string = 'blue') {
    let previousBloc: Bloc | null = this.end;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.gridSize - this.strokeWeight * 2;

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

    this.start.draw(this, 'green');
    this.end.draw(this, 'red');
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

  protected carveBlocs(bloc: Bloc, nextBloc: Bloc, dir: Wall) {
    bloc.value -= dir;
    nextBloc.value -= OPPOSITES[dir];
  }

  protected saveBloc(bloc: Bloc) {
    this.grid[bloc.x][bloc.y] = bloc;
  }

  protected getDirFromBlocs(from: Bloc, to: Bloc): Wall | -1 {
    const dirX = from.x - to.x;
    const dirY = from.y - to.y;

    if (dirY === 0) {
      if (dirX === -1) {
        return W;
      }
      if (dirX === 1) {
        return E;
      }
    }

    if (dirX === 0) {
      if (dirY === -1) {
        return N;
      }
      if (dirY === 1) {
        return S;
      }
    }

    return -1;
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

    bloc.paths.forEach((dir) => {
      const b = this.getBlocFromDirection(dir, bloc);

      if (!prevBloc || prevBloc.pos > b.pos) {
        prevBloc = b;
      }
    });

    return prevBloc;
  }

  protected getBlocFromDirection(dir: Wall, bloc: Bloc): Bloc | null {
    const x = bloc.x + directions[dir].x;
    const y = bloc.y + directions[dir].y;

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;

    return this.grid[x][y];
  }

  protected neighbours(bloc: Bloc): Array<Bloc> {
    const neighbours = [];

    const tries = [...walls];

    tries.forEach((dir) => {
      const neighbour = this.getBlocFromDirection(dir, bloc);

      if (neighbour !== null) {
        neighbours.push(neighbour);
      }
    });

    return neighbours;
  }

  protected carvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => n.isCarved || n.pos === 0);
  }

  protected uncarvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => n.isUncarved && n.pos === null);
  }
}
