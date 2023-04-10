// @format
import { open } from "lmdb";

import log from "./logger.mjs";
import { retrieve } from "./remote.mjs";

export const SEPARATOR = ":";
export const MARKER_DIRECT = "direct";
export const MARKER_ORDER = "order";

export const order = (name) => `${name}${SEPARATOR}${MARKER_ORDER}`;
export const direct = (name) => `${name}${SEPARATOR}${MARKER_DIRECT}`;

export async function toOrder(db, name, key, value) {
  const orderDB = db.openDB(order(name));
  await orderDB.put(pack(key), value);
}

export async function toDirect(db, name, key, value) {
  const directDB = db.openDB(direct(name));
  await directDB.put(pack(key), value);
}

export function pack(value) {
  if (Array.isArray(value)) return value;
  return [value];
}

export async function all(db, key) {
  return Array.from(await db.getRange(key));
}

export async function last(db, name, key) {
  const orderDB = db.openDB(order(name));
  const results = await all(orderDB, key);
  const elem = results[results.length - 1];
  if (!elem) throw new Error("No last element in index found");
  return parseInt(elem.key, 16);
}

export async function latest(db, name, state) {
  const key = "";
  const local = await last(db, name, key);
  const remote = await retrieve(state.remote());
  return {
    local,
    remote,
  };
}
