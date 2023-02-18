/**
 * Return a number between min and max. If no max given, return a number between 0 and min
 *
 * @param min min value
 * @param max max value
 * @returns random number
 */
export function randomInt(min: number, max: number | null = null): number {
  return Math.floor(Math.random() * (max ? max - min : min) + (max ? min : 0));
}