export const delay = <T>(ms: number, value?: T, error?: true) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(error ? reject : resolve, ms, value)
  );
