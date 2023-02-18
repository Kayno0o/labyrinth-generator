import { Maze } from './recursive-backtracking/1';

const maze = new Maze(40, 40, 6, 2, false);

maze.drawMaze();

// maze.drawSolution('blue', 2);

maze.saveCanvas();
