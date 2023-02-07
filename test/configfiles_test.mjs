// @format
import { resolve } from "path";

import test from "ava";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import configSchema from "../src/schemata/configuration.mjs";
const crawlPathSchema = configSchema.path;

test("if distributed example config complies to schema", async (t) => {
  const config = (await import(resolve("./config.mjs"))).default;
  const ajv = new Ajv();
  addFormats(ajv);
  const check = ajv.compile(configSchema);
  const valid = check(config);
  if (!valid) {
    t.fail(check.errors);
  } else {
    t.pass();
  }
});
