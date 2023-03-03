import { MazeProps, MazeType, labyrinthTypes } from './types';
import { PrimMaze } from './prim';
import { BacktrackingMaze } from './backtracking';
import Maze from './entity/Maze';

function log(message: string, code = 1) {
  console.log(message);
  process.exit(code);
}

function main(args: Array<string>) {
  console.clear();

  const props = new MazeProps();
  args.forEach((arg) => {
    if (arg === '--help') {
      log(
        `Available props: ${Object.entries(props)
          .map(([key, value]) => `\n  --${key}=${typeof value}`)
          .join(', ')}`,
        0,
      );
    }

    if (arg.startsWith('--') && arg.includes('=')) {
      arg = arg.substring(2);

      const [key, value] = arg.split('=');

      if (props[key] !== undefined) {
        if (typeof props[key] === 'string') {
          props[key] = value;
        } else if (typeof props[key] === 'number') {
          if (isNaN(parseInt(value))) {
            log(`Invalid value for parameter ${key}. Expected value of type int`);
          }
          props[key] = Math.abs(parseInt(value));
        } else if (typeof props[key] === 'boolean') {
          if (value === 'true' || value === '1') {
            props[key] = true;
          } else if (value === 'false' || value === '0') {
            props[key] = false;
          } else {
            log(`Invalid value for parameter ${key}. Expected value : 0, 1, false, true`);
          }
        }
      }
    }
  });

  const mazes: { [key in MazeType]: typeof Maze } = {
    backtracking: BacktrackingMaze,
    prims: PrimMaze,
  };

  let mazeClasses: Array<typeof Maze> = [];

  if (props.type === 'all') {
    mazeClasses = Object.values(mazes);
  } else {
    mazeClasses.push(mazes[props.type]);
  }

  if (!mazeClasses) {
    log(`Maze type ${props.type} does not exist.\nAllowed types are '${labyrinthTypes.join("', '")}'`);
  }

  console.log(
    `Parameters: ${Object.entries(props)
      .map(([key, value]) => `\n  --${key}=${value}`)
      .join(', ')}`,
  );

  console.log();

  mazeClasses.forEach((mazeClass) => {
    const maze = new mazeClass(props);

    if (props.draw) maze.drawMaze();
    if (props.draw && props.solution) maze.drawSolution('blue');
    if (props.draw) maze.saveCanvas(`${props.type}.png`);
  });

  console.log();
}

const args = process.argv;
main(args);
