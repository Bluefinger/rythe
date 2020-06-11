import { emitSKIP } from "../signal";

export const skipNullish = <T>(value: T | null | undefined): T =>
  value != null ? value : emitSKIP();
