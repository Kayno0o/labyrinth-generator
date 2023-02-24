import { randomInt } from './utils';
import { OPPOSITES, Wall, walls } from './types';
import Maze from './entity/Maze';
import Bloc from './entity/Bloc';

export class BacktrackingMaze extends Maze {
  protected carveGrid() {
    let i = 1;

    let bloc = this.start;
    let maxPos = 0;

    do {
      let [nextBloc, dir] = this.getNextBloc(bloc);

      if (!nextBloc) {
        if (bloc.pos === 0) return;

        do {
          bloc = this.getPreviousBloc(bloc);

          if (!bloc || bloc.pos === 0) return;

          [nextBloc, dir] = this.getNextBloc(bloc);
        } while (!nextBloc);

        ++i;
        continue;
      }

      this.carveBlocs(bloc, nextBloc, dir);

      nextBloc.pos = i;

      if (i > maxPos) maxPos = i;

      ++i;
      bloc = nextBloc;
      continue;
    } while (true);
  }

  private getNextBloc(bloc: Bloc): [Bloc | null, Wall] {
    const tries = [...walls];

    let dir: Wall;
    let randomPos: number;
    let nextBloc: Bloc | null;

    if (bloc.S || bloc.N || bloc.E || bloc.W) {
      do {
        randomPos = randomInt(tries.length);
        dir = tries[randomPos];

        tries.splice(randomPos, 1);

        if (!(bloc.value & dir)) {
          nextBloc = null;
          continue;
        }

        nextBloc = this.getBlocFromDirection(dir, bloc);

        if (!nextBloc || nextBloc.pos !== null || !(nextBloc.value & OPPOSITES[dir])) {
          nextBloc = null;
          continue;
        }
      } while (tries.length !== 0 && nextBloc === null);
    }

    return [nextBloc, dir];
  }
}
