//@format
import { constants } from "fs";
import { rmdir, access } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { toJSON, toCSV, provisionDir } from "../src/disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("transforming to CSV", (t) => {
  const list = [
    { address: "abc", tokenId: "1", tokenURI: "https://example.com" },
    { address: "def", tokenId: "2", tokenURI: "https://example2.com" },
  ];
  const result = toCSV(list);
  t.is("abc,1,https://example.com\ndef,2,https://example2.com", result);
});

test("tranform from original => JSON => CSV", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toCSV(toJSON(list, expr));
  t.is(`${addr},1\n${addr},2`, result);
});

test("transforming to JSON", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toJSON(list, expr);
  t.deepEqual(
    [
      { address: addr, tokenId: "1" },
      { address: addr, tokenId: "2" },
    ],
    result
  );
});

test("provisioning an existing directory", async (t) => {
  const testDir = "fixtures";
  const existentDir = resolve(__dirname, testDir, "existent");
  await provisionDir(existentDir);
  t.pass();
});

test("provisioning a non-existent directory", async (t) => {
  const testDir = "fixtures";
  const nonExistentDir = resolve(__dirname, testDir, "nonexistent");
  await provisionDir(nonExistentDir);

  try {
    await rmdir(nonExistentDir);
  } catch (err) {
    console.error(err);
    t.fail();
  }
  t.pass();
});
