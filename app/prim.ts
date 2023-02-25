import Bloc from './entity/Bloc';
import Maze from './entity/Maze';
import { randomInt } from './utils';

export class PrimMaze extends Maze {
  frontiers: Array<Bloc> = [];

  protected carveGrid() {
    this.frontiers = [];
    let i = 0;

    let bloc = this.start;
    this.addUncarvedNeighbours(bloc);

    while (true) {
      if (this.frontiers.length === 0) return;

      const frontierIndex = randomInt(this.frontiers.length);
      const frontier = this.frontiers[frontierIndex];

      const blocs = this.carvedNeighbours(frontier);
      bloc = blocs[randomInt(blocs.length)];

      const dir = this.getDirFromBlocs(frontier, bloc);
      if (dir !== -1) this.carveBlocs(bloc, frontier, dir);

      this.addUncarvedNeighbours(frontier);

      frontier.pos = ++i;

      this.frontiers.splice(frontierIndex, 1);
    }
  }

  private addUncarvedNeighbours(bloc: Bloc) {
    const neighbours = this.uncarvedNeighbours(bloc);

    for (let i = 0; i < neighbours.length; i++) {
      if (neighbours[i].pos === -1) continue;

      this.frontiers.push(neighbours[i]);
      neighbours[i].pos = -1;
    }
  }
}
