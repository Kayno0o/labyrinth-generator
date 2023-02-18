import { Maze } from './recursive-backtracking/1';

const maze = new Maze(40, 40, undefined, undefined, true);

maze.drawMaze();

maze.drawSolution('black');

maze.saveCanvas();
