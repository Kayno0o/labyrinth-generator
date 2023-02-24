import { PrimMaze } from './prim';
import { BacktrackingMaze } from './backtracking';

// backtrackingMaze();
primMaze();

function backtrackingMaze() {
  const backtrackingMaze = new BacktrackingMaze(40, 40, 6, 2, false);

  backtrackingMaze.drawMaze();
  // backtrackingMaze.drawSolution('blue', 2);
  backtrackingMaze.saveCanvas('backtracking.png');
}

function primMaze() {
  const primMaze = new PrimMaze(20, 20, 100, 20, false);

  primMaze.drawMaze();
  primMaze.saveCanvas('prims.png');
}
