import Bloc from './entity/Bloc';
import Maze from './entity/Maze';
import { walls } from './types';
import { randomInt } from './utils';

export class PrimMaze extends Maze {
  frontiers: Array<Bloc> = [];

  protected carveGrid() {
    let i = 0;

    let bloc = this.start;
    this.frontiers = this.uncarvedNeighbours(bloc);

    do {
      this.filterFrontiers();
      if (this.frontiers.length === 0) return;

      const frontier = this.frontiers[randomInt(this.frontiers.length)];
      this.frontiers.push(...this.uncarvedNeighbours(frontier));

      const blocs = this.carvedNeighbours(frontier);
      bloc = blocs[randomInt(blocs.length)];

      const dir = this.getDirFromBlocs(frontier, bloc);
      if (dir !== -1) this.carveBlocs(bloc, frontier, dir);

      frontier.pos = ++i;
    } while (true);
  }

  private neighbours(bloc: Bloc): Array<Bloc> {
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

  private carvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => n.isCarved || n.pos === 0);
  }

  private uncarvedNeighbours(bloc: Bloc): Array<Bloc> {
    return this.neighbours(bloc).filter((n) => n.isUncarved);
  }

  private filterFrontiers() {
    this.frontiers = this.frontiers.filter((bloc) => bloc.isUncarved);
  }
}
