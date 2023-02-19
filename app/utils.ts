/**
 * Map a value from a range to another
 *
 * @param value The value to map
 * @param imin Min input value
 * @param imax Max input value
 * @param omin Min output value
 * @param omax Max output value
 * @returns Computed value
 */
export function map(value: number, imin: number, imax: number, omin: number, omax: number): number {
  return omin + (omax - omin) * ((value - imin) / (imax - imin));
}

/**
 * Return a number between min and max. If no max given, return a number between 0 and min
 *
 * @param min Min value
 * @param max Max value
 * @returns Random number
 */
export function randomInt(min: number, max: number | null = null): number {
  return Math.floor(Math.random() * (max ? max - min : min) + (max ? min : 0));
}
