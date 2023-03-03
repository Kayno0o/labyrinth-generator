import Bloc from './entity/Bloc';

export type Wall = 1 | 2 | 4 | 8;

export const N: Wall = 1;
export const S: Wall = 2;
export const E: Wall = 4;
export const W: Wall = 8;

export type Grid = Array<Array<Bloc>>;

export const OPPOSITES = { [E]: W, [N]: S, [S]: N, [W]: E };

export const walls: Array<Wall> = [N, S, E, W];

export const directions: { [key in Wall]: { x: number; y: number } } = {
  [E]: { x: 1, y: 0 },
  [N]: { x: 0, y: -1 },
  [S]: { x: 0, y: 1 },
  [W]: { x: -1, y: 0 },
};

export type Dictionnary<T = any> = { [key: string]: T };

export type MazeType = 'prims' | 'backtracking';

export const labyrinthTypes: Array<MazeType> = ['prims', 'backtracking'];

export class MazeProps {
  blocSize: number = 40;
  draw: boolean = true;
  solution: boolean = true;
  height: number = -1;
  lineWidth: number = 10;
  rainbowGrid: boolean = false;
  size: number = 40;
  type: MazeType | 'all' = 'backtracking';
  width: number = -1;
  benchmark: boolean = false;
}
