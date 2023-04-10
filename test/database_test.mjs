// @format
import { rmSync } from "fs";
import { env } from "process";

import { open } from "LMDB";
import test from "ava";

import {
  latest,
  all,
  last,
  SEPARATOR,
  MARKER_ORDER,
  toOrder,
} from "../src/database.mjs";

test.serial("get latest state values", async (t) => {
  const options = {
    url: env.RPC_HTTP_HOST,
  };

  if (env.RPC_API_KEY) {
    options.headers = {
      Authorization: `Bearer ${env.RPC_API_KEY}`,
    };
  }

  const module = {
    remote: () => ({
      type: "json-rpc",
      method: "eth_blockNumber",
      params: [],
      version: "0.0.1",
      options,
    }),
  };

  const path = "./testdb";
  const db = new open({ path });
  const name = "abc";
  const localNumber = Number(10);
  const key = localNumber.toString(16);
  const value = "a value";
  await toOrder(db, name, key, value);

  const result = await latest(db, name, module);
  t.true(Number.isInteger(result.local));
  t.true(Number.isInteger(result.remote));
  t.is(result.local, localNumber);
  t.true(result.remote > 17017259);

  rmSync(path, { recursive: true });
});

test.serial("getting last entry", async (t) => {
  const path = "./testdb";
  const db = new open({ path });
  const name = "abc";

  const key0 = "01";
  const value0 = "first";
  await toOrder(db, name, key0, value0);

  const key1 = "09";
  const value1 = "last";
  await toOrder(db, name, key1, value1);

  const result = await last(db, name, "");
  t.is(result, parseInt(key1, 16));
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
