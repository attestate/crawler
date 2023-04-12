// @format
import { rmSync } from "fs";
import { env } from "process";

import test from "ava";

import {
  open,
  all,
  SEPARATOR,
  MARKER_ORDER,
  toOrder,
} from "../src/database.mjs";

const padHexString = (hexString, length) => hexString.padStart(length, "0");

test.serial("if entries are sorted by key", async (t) => {
  const path = "./testdb";
  const db = open(path);

  const key1 = [padHexString("103c8ce", 8), padHexString("ac", 2)];
  const value1 = "last";
  await db.put(key1, value1);

  const key2 = [padHexString("f42400", 8), padHexString("00", 2)];
  const value2 = "first";
  await db.put(key2, value2);

  const key0 = [padHexString("ffb86f", 8), padHexString("90", 2)];
  const value0 = "middle";
  await db.put(key0, value0);

  const result = await all(db, "");
  const last = result[result.length - 1];
  t.deepEqual(last, { key: key1, value: "last" });
  rmSync(path, { recursive: true });
});

test.serial("getting all entries", async (t) => {
  const path = "./testdb";
  const db = open(path);

  const key0 = `0x01`;
  const value0 = "first";
  await db.put(key0, value0);

  const key1 = `0x09`;
  const value1 = "last";
  await db.put(key1, value1);

  const result = await all(db, "0x");
  t.deepEqual(result, [
    { key: "0x01", value: "first" },
    { key: "0x09", value: "last" },
  ]);
  rmSync(path, { recursive: true });
});
