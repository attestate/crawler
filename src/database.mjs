// @format
import { open } from "lmdb";

import log from "./logger.mjs";

export const SEPARATOR = ":";
export const MARKER_DIRECT = "direct";
export const MARKER_ORDER = "order";

export async function all(db, key) {
  return Array.from(await db.getRange(key));
}

export async function last(db, key) {
  const results = await all(db, key);
  return results[results.length - 1];
}
