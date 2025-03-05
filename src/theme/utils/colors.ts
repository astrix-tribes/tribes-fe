/**
 * Converts an HSL color string to a React Native compatible color value
 * @param hslString - HSL color in format "H S% L%"
 * @returns CSS HSL color string
 */
export const hsl = (hslString: string): string => {
  return `hsl(${hslString})`;
}; 