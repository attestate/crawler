//@format
import "dotenv/config";
import { Worker } from "worker_threads";
import { resolve } from "path";
import { env } from "process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import configSchema from "./schemata/configuration.mjs";
import { __dirname } from "./node_filler.mjs";
import logger from "./logger.mjs";
import { init } from "./lifecycle.mjs";
import * as environment from "./environment.mjs";
import * as disc from "./disc.mjs";

const workerPath = resolve(__dirname, "./worker_start.mjs");
const log = logger("boot");

export async function getConfig(configFile) {
  return (await import(resolve(configFile))).default;
}

export function validateConfig(config) {
  const ajv = new Ajv();
  addFormats(ajv);
  const check = ajv.compile(configSchema);
  const valid = check(config);
  if (!valid) {
    log(check.errors);
    throw new Error("Received invalid config");
  }
  return config;
}

export async function createWorker(config) {
  environment.validate(environment.requiredVars);
  await disc.provisionDir(resolve(env.DATA_DIR));

  const worker = new Worker(workerPath, {
    workerData: config,
  });

  return worker;
}

export async function boot(config) {
  validateConfig(config);
  // NOTE: We still use @neume-network/extraction-worker that implements a
  // older version of the crawler configuration. But since in
  // @attestate/crawler, we've merged the path and the config, we'll have to
  // pass a copy to it that doesn't include it.
  const configCopy = { ...config };
  delete configCopy.path;
  const worker = await createWorker(configCopy);
  return await init(worker, config.path);
}
