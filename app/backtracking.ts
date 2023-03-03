import { randomInt } from './utils';
import { Wall } from './types';
import Maze from './entity/Maze';
import Bloc from './entity/Bloc';

export class BacktrackingMaze extends Maze {
  protected carveGrid() {
    let i = 1;

    let bloc = this.start;

    do {
      let [nextBloc, dir] = this.getNextBloc(bloc);

      while (!nextBloc) {
        if (bloc.pos === 0) return;

        bloc = this.getPreviousBloc(bloc);

        if (!bloc || bloc.pos === 0) return;

        [nextBloc, dir] = this.getNextBloc(bloc);
      }

      this.carveBlocs(bloc, nextBloc, dir);

      bloc = nextBloc;
      bloc.pos = i++;
    } while (true);
  }

  private getNextBloc(bloc: Bloc): [Bloc | null, Wall] {
    let dir: Wall;
    let nextBloc: Bloc | null = null;

    if (bloc.value > 0) {
      const tries = bloc.walls;

      do {
        const randomPos = randomInt(tries.length);
        dir = tries[randomPos];

        tries.splice(randomPos, 1);

        nextBloc = this.getBlocFromDirection(dir, bloc);

        if (!nextBloc || nextBloc.pos !== null) {
          nextBloc = null;
          continue;
        }
      } while (tries.length !== 0 && nextBloc === null);
    }

    return [nextBloc, dir];
  }
}
