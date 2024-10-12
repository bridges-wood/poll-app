/**
 * Converts an index to a sequence of letters, starting from A.
 *
 * @param index The index to convert to a letter
 * @returns A sequence of letters corresponding to the index, starting from A.
 * @example indexToLetter(0) => 'A'
 *          indexToLetter(25) => 'Z'
 *          indexToLetter(26) => 'AA'
 */
export const indexToLetter = (index: number): string => {
  if (index <= 25) {
    return String.fromCharCode(65 + index);
  }

  return (
    String.fromCharCode(65 + (index % 26)) +
    indexToLetter(Math.floor(index / 26))
  );
};
