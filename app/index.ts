import { BacktrackingMaze } from './backtracking';

const maze = new BacktrackingMaze(40, 40, 6, 2, false);

maze.drawMaze();

// maze.drawSolution('blue', 2);

maze.saveCanvas();
