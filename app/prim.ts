import { randomInt } from 'crypto';
import Bloc from './entity/Bloc';
import Maze from './entity/Maze';
import { E, N, S, W, OPPOSITES } from './types';

export class PrimMaze extends Maze {
  frontiers: Array<Bloc> = [];

  protected carveGrid() {
    let bloc = this.start;
    let i = 1;

    this.frontiers = [];
    this.frontiers = this.frontiers.concat(this.uncarvedNeighbours(bloc).filter((n) => !this.frontiers.includes(n)));

    this.carveRandomNeighbour(i);
  }

  private carveRandomNeighbour(i: number) {
    const frontier = this.frontiers[randomInt(this.frontiers.length)];

    const neighbours = this.carvedNeighbours(frontier);
    const neighbour = neighbours[randomInt(neighbours.length)];

    const dirX = frontier.x - neighbour.x;
    const dirY = frontier.y - neighbour.y;

    if (dirY === 0) {
      if (dirX === -1) {
        frontier.value -= W;
        neighbour.value -= OPPOSITES[W];
      }
      if (dirX === 1) {
        frontier.value -= E;
        neighbour.value -= OPPOSITES[E];
      }
    }

    if (dirX === 0) {
      if (dirY === -1) {
        frontier.value -= N;
        neighbour.value -= OPPOSITES[N];
      }
      if (dirY === 1) {
        frontier.value -= S;
        neighbour.value -= OPPOSITES[S];
      }
    }

    frontier.pos = i;

    console.table([frontier, neighbour]);
  }

  private neighbours(bloc: Bloc): Array<Bloc> {
    const neighbours = [];

    [N, S, E, W].forEach((dir) => {
      const neighbour = this.getBlocFromDirection(dir, bloc);

      if (neighbour !== null && !neighbour.isCarved) {
        neighbours.push(neighbour);
      }
    });

    return neighbours;
  }

  private carvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => n.isCarved || n.pos === 0);
  }

  private uncarvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => !n.isCarved);
  }
}
