export const bufferValues = <T>(stored: T[], value: T): T[] => {
  stored.push(value);
  return stored;
};
