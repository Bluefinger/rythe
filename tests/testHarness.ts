import tape from "tape";

const OPTIONS: tape.TestOptions = { timeout: 250 };

export const test = (
  name: string,
  callback: (assert: tape.Test) => void | Promise<void>
): void => {
  tape(name, OPTIONS, assert => {
    const { end } = assert;
    Promise.resolve(assert)
      .then(callback)
      .then(end, end);
  });
};