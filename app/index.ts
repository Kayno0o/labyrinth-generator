import { PrimMaze } from './prim';
import { BacktrackingMaze } from './backtracking';

console.clear();

const size = 400;

backtrackingMaze();
console.log('\n\n------------\n\n');
primMaze();

function backtrackingMaze() {
  const backtrackingMaze = new BacktrackingMaze(size, size, 6, 2, false);

  backtrackingMaze.drawMaze();
  backtrackingMaze.drawSolution('blue', 2);
  backtrackingMaze.saveCanvas('backtracking.png');
}

function primMaze() {
  const primMaze = new PrimMaze(size, size, 6, 2, false);

  primMaze.drawMaze();
  primMaze.drawSolution('pink', 2);
  primMaze.saveCanvas('prims.png');
}
