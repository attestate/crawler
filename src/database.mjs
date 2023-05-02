// @format
import { open as _open } from "lmdb";

import log from "./logger.mjs";

export const SEPARATOR = ":";
export const MARKER_DIRECT = "direct";
export const MARKER_ORDER = "order";

export const order = (name) => `${name}${SEPARATOR}${MARKER_ORDER}`;
export const direct = (name) => `${name}${SEPARATOR}${MARKER_DIRECT}`;

// TODO: Ideally, at one point, we expose all lmdb-js options here
export function open(path, maxReaders) {
  const options = {
    path,
    keyEncoding: "ordered-binary",
  };
  if (maxReaders) {
    options.maxReaders = maxReaders;
  }
  return new _open(options);
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
