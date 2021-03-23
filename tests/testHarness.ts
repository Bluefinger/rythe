import tape from "tape";

const OPTIONS: tape.TestOptions = { timeout: 250 };

export const test = (
  name: string,
  callback: (assert: tape.Test) => void | Promise<void>
): void => {
  // eslint-disable-next-line
  tape(name, OPTIONS, (assert) => Promise.resolve(assert).then(callback));
};
