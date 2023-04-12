// @format
import { open as _open } from "lmdb";

import log from "./logger.mjs";

export const SEPARATOR = ":";
export const MARKER_DIRECT = "direct";
export const MARKER_ORDER = "order";

export const order = (name) => `${name}${SEPARATOR}${MARKER_ORDER}`;
export const direct = (name) => `${name}${SEPARATOR}${MARKER_DIRECT}`;

export function open(path) {
  return new _open({
    path,
    keyEncoding: "ordered-binary",
  });
}

export async function toOrder(db, name, key, value) {
  const orderDB = db.openDB(order(name));
  await orderDB.put(pack(key), value);
}

export async function toDirect(db, name, key, value) {
  const directDB = db.openDB(direct(name));
  await directDB.put(pack(key), value);
}

export function pack(value) {
  if (!Array.isArray(value)) {
    value = [value];
  }
  return value;
}

export async function all(db, key) {
  return Array.from(await db.getRange(key));
}
