import Bloc from './entity/Bloc';

export const [N, S, E, W] = [1, 2, 4, 8];

export type Grid = Array<Array<Bloc>>;

export const OPPOSITES = { [E]: W, [N]: S, [S]: N, [W]: E };

export const directions: { [direction: number]: [number, number] } = {
  [E]: [1, 0],
  [N]: [0, -1],
  [S]: [0, 1],
  [W]: [-1, 0],
};
