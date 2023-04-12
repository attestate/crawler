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

export * as database from "./database.mjs";

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
  await disc.provisionDir(resolve(config.environment.dataDir));

  const worker = new Worker(workerPath, {
    workerData: config,
  });

  return worker;
}

export function augment(config) {
  const { requiredVars, optionalVars } = environment;
  const collected = environment.collect({ ...requiredVars, ...optionalVars });
  const configEnv = config.environment ?? {};
  const copy = { ...config };
  copy.environment = { ...configEnv, ...collected };
  return copy;
}

export async function boot(config) {
  config = augment(config);
  validateConfig(config);
  environment.set(config.environment);
  // NOTE: @attestate/extraction-worker still supports an old version of the
  // schema, where the path and the configuration haven't been merged yet.
  const configCopy = { ...config };
  delete configCopy.path;
  const worker = await createWorker(configCopy);
  return await init(worker, config);
}
