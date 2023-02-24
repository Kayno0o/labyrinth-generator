import { E, N, S, W } from '../types';
import { map } from '../utils';
import Maze from './Maze';

export default class Bloc {
  value: number = N + S + W + E;
  pos: number | null = null;
  x: number;
  y: number;

  get E() {
    return this.value & E;
  }

  get S() {
    return this.value & S;
  }

  get N() {
    return this.value & N;
  }

  get W() {
    return this.value & W;
  }

  get isCarved() {
    return !this.E || !this.W || !this.N || !this.S;
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public draw(maze: Maze, color: string | null = null) {
    const l = this.x * maze.gridSize;
    const r = this.x * maze.gridSize + maze.gridSize;

    const t = this.y * maze.gridSize;
    const b = this.y * maze.gridSize + maze.gridSize;

    if (color) {
      maze.ctx.fillStyle = color;
      maze.ctx.fillRect(
        l + maze.strokeWeight,
        t + maze.strokeWeight,
        maze.gridSize - maze.strokeWeight * 2,
        maze.gridSize - maze.strokeWeight * 2,
      );
    }

    if (maze.hasRainbowGrid) {
      maze.ctx.strokeStyle = `hsl(${map(this.x + this.y, 0, maze.width + maze.height, 0, 360)} 80% 40%)`;
    }

    maze.ctx.beginPath();

    if (this.S) {
      maze.ctx.moveTo(l, b);
      maze.ctx.lineTo(r, b);
    }

    if (this.N) {
      maze.ctx.moveTo(l, t);
      maze.ctx.lineTo(r, t);
    }

    if (this.W) {
      maze.ctx.moveTo(l, t);
      maze.ctx.lineTo(l, b);
    }

    if (this.E) {
      maze.ctx.moveTo(r, t);
      maze.ctx.lineTo(r, b);
    }

    maze.ctx.stroke();
  }
}
