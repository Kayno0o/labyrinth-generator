import { LabyrinthProps, LabyrinthType, labyrinthTypes } from './types';
import { PrimMaze } from './prim';
import { BacktrackingMaze } from './backtracking';

function error(message: string) {
  console.log(message);
  process.exit(1);
}

function main(args: Array<string>) {
  console.clear();

  const props = new LabyrinthProps();

  console.log(
    `Available props: ${Object.entries(props)
      .map(([key, value]) => `--${key}=${typeof value}`)
      .join(', ')}`,
  );

  args.forEach((arg) => {
    if (arg.startsWith('--') && arg.includes('=')) {
      arg = arg.substring(2);

      const [key, value] = arg.split('=');

      if (props[key]) {
        if (typeof props[key] === 'string') {
          if (key === 'type' && labyrinthTypes.includes(value as LabyrinthType)) {
            props[key] = value as LabyrinthType;
          } else {
            error(`Type ${value} does not exist.\nAllowed types are '${labyrinthTypes.join("', '")}'`);
          }
        } else if (typeof props[key] === 'number') {
          if (isNaN(parseInt(value))) {
            error(`Invalid value for parameter ${key}. Expected value of type int`);
          }
          props[key] = Math.abs(parseInt(value));
        } else if (typeof props[key] === 'boolean') {
          if (
            (value !== 'true' && value !== 'false' && isNaN(parseInt(value))) ||
            (!isNaN(parseInt(value)) && parseInt(value) !== 0 && parseInt(value) !== 1)
          ) {
            error(`Invalid value for parameter ${key}. Expected value : 0, 1, false, true`);
          }
          props[key] = !!value;
        }
      }
    }
  });

  let mazeClass: any | null;

  if (props.type === 'prims') {
    mazeClass = PrimMaze;
  }

  if (props.type === 'backtracking') {
    mazeClass = BacktrackingMaze;
  }

  if (mazeClass) {
    const backtrackingMaze = new mazeClass(
      props.width > 0 ? props.width : props.size,
      props.height > 0 ? props.height : props.size,
      props.blocSize,
      props.lineWidth,
      props.rainbowGrid,
    );

    if (props.drawMaze) backtrackingMaze.drawMaze();
    if (props.drawMaze && props.drawSolution) backtrackingMaze.drawSolution('blue');
    if (props.drawMaze) backtrackingMaze.saveCanvas(`${props.type}.png`);
  }
}

const args = process.argv;
main(args);
