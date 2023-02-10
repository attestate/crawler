// @format
import { rmSync } from "fs";

import { open } from "LMDB";
import test from "ava";

import { all, last, SEPARATOR, MARKER_ORDER } from "../src/database.mjs";

test.serial("getting last entry", async (t) => {
  const path = "./testdb";
  const db = new open({ path });
  const prefix = "abc";

  const key0 = "0x01";
  const value0 = "first";
  await db.put(key0, value0);

  const key1 = "0x09";
  const value1 = "last";
  await db.put(key1, value1);

  const result = await last(db, "0x");
  t.deepEqual(result, { key: "0x09", value: "last" });
  rmSync(path, { recursive: true });
});

test.serial("getting all entries", async (t) => {
  const path = "./testdb";
  const db = new open({ path });
  const prefix = "abc";

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
