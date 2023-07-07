//@format
import { createInterface } from "readline";
import { createReadStream, appendFileSync } from "fs";
import { rm, rename } from "fs/promises";
import EventEmitter, { once } from "events";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import util from "util";
import { execute } from "@attestate/extraction-worker";

import * as database from "./database.mjs";
import workerMessage from "./schemata/messages/worker.mjs";
import { NotFoundError } from "./errors.mjs";
import { inDataDir, fileExists } from "./disc.mjs";
import logger from "./logger.mjs";

export const EXTRACTOR_CODES = {
  FAILURE: 1,
  SHUTDOWN_IN_INIT: 2,
  SHUTDOWN_IN_UPDATE: 3,
};

const log = logger("lifecycle");
const ajv = new Ajv();
addFormats(ajv);

function validateWorkerMessage(message) {
  const workerValidator = ajv.compile(workerMessage);
  const valid = workerValidator(message);

  if (!valid) {
    log("Found 1 or more validation error, ignoring worker message:", message);
    log(workerValidator.errors);
    return false;
  }

  return true;
}

export function prepareMessages(messages, commissioner) {
  return messages
    .map((message) => {
      return {
        commissioner,
        ...message,
      };
    })
    .filter(validateWorkerMessage);
}

export async function transform(name, strategy, state) {
  const inputPath = inDataDir(strategy.input.name);
  if (!(await fileExists(inputPath))) {
    log(
      `Skipping "${name}" transformation as input path doesn't exist "${inputPath}"`
    );
    return;
  }
  const rl = createInterface({
    input: createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  const outputPath = inDataDir(strategy.output.name);
  let buffer = [];
  rl.on("line", (line) => {
    const stateCopy = { ...state, line };
    const props = { args: strategy.args, state: stateCopy, execute };
    const write = strategy.module.onLine(props);
    if (write) {
      appendFileSync(outputPath, `${write}\n`);
    }
  });
  // TODO: Figure out how `onError` shall be handled.
  // NOTE: Actually, new strategies don't even implement this anymore.
  rl.on("error", (error) => {
    const props = { args: strategy.args, state, error, execute };
    const write = strategy.module.onError(props);
  });

  await once(rl, "close");
  const props = { args: strategy.args, state, execute };
  const write = strategy.module.onClose(props);
  if (write) {
    appendFileSync(outputPath, `${write}\n`);
  }
  return buffer;
}

export function extract(name, strategy, worker, messageRouter, state) {
  return new Promise(async (resolve, reject) => {
    let numberOfMessages = 0;
    const type = "extraction";
    const interval = setInterval(() => {
      log(
        `${name} extractor is running with ${numberOfMessages} messages pending`
      );
    }, 120_000);

    let result;
    const props = { args: strategy.args, state, execute };
    try {
      result = await strategy.module.init(props);
    } catch (err) {
      reject(err);
    }
    if (!result) {
      const error = new Error(
        `Strategy "${name}-extraction" didn't return a valid result: "${JSON.stringify(
          result
        )}"`
      );
      error.code = EXTRACTOR_CODES.FAILURE;
      clearInterval(interval);
      return reject(error);
    }

    const outputPath = inDataDir(strategy.output.name);
    if (result.write) {
      try {
        appendFileSync(outputPath, `${result.write}\n`);
      } catch (err) {
        const error = new Error(
          `Couldn't write to file after update. Output path: "${outputPath}", Content: "${result.write}"`
        );
        error.code = EXTRACTOR_CODES.FAILURE;
        clearInterval(interval);
        return reject(error);
      }
    }

    const callback = async (message) => {
      numberOfMessages--;
      log(`Leftover Lifecycle Messages: ${numberOfMessages}`);

      if (message.error) {
        log(
          `Received error message from worker for strategy "${name}": "${message.error}"`
        );
      } else {
        let result;
        const props = { args: strategy.args, state, message, execute };
        try {
          result = await strategy.module.update(props);
        } catch (err) {
          reject(err);
        }
        if (!result) {
          const error = new Error(
            `Strategy "${name}-extraction" didn't return a valid result: "${JSON.stringify(
              result
            )}"`
          );
          error.code = EXTRACTOR_CODES.FAILURE;
          messageRouter.off(`${name}-${type}`, callback);
          clearInterval(interval);
          return reject(error);
        }

        if (result.messages?.length !== 0) {
          prepareMessages(result.messages, name).forEach((message) => {
            numberOfMessages++;
            worker.postMessage(message);
          });
        }

        if (result.write) {
          try {
            appendFileSync(outputPath, `${result.write}\n`);
          } catch (err) {
            const error = new Error(
              `Couldn't write to file after update. Output Path: "${outputPath}", Content: "${result.write}"`
            );
            error.code = EXTRACTOR_CODES.FAILURE;
            messageRouter.off(`${name}-${type}`, callback);
            clearInterval(interval);
            return reject(error);
          }
        }
      }

      if (numberOfMessages === 0) {
        log("Shutting down extraction in update callback function");
        messageRouter.off(`${name}-${type}`, callback);
        clearInterval(interval);
        resolve({ code: EXTRACTOR_CODES.SHUTDOWN_IN_UPDATE });
      }
    };

    messageRouter.on(`${name}-${type}`, callback);

    let preparedMessages =
      result.messages?.length !== 0
        ? prepareMessages(result.messages, name)
        : 0;

    if (preparedMessages.length > 0) {
      preparedMessages.forEach((message) => {
        numberOfMessages++;
        worker.postMessage(message);
      });
    } else {
      log("Shutting down extraction in init follow-up function");
      messageRouter.off(`${name}-${type}`, callback);
      clearInterval(interval);
      resolve({ code: EXTRACTOR_CODES.SHUTDOWN_IN_INIT });
    }
  });
}

export async function load(name, strategy, db, state) {
  const inputPath = inDataDir(strategy.input.name);
  if (!(await fileExists(inputPath))) {
    log(
      `Skipping "${name}" loading as input path doesn't exist "${inputPath}"`
    );
    return;
  }
  const rl = createInterface({
    input: createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line === "") continue;

    const stateCopy = { ...state, line };
    const props = { args: strategy.args, state: stateCopy, execute };
    for (const { key, value } of strategy.module.order(props)) {
      await database.toOrder(db, name, key, value);
    }

    for (const { key, value } of strategy.module.direct(props)) {
      await database.toDirect(db, name, key, value);
    }
  }
}

function subscribe(messageRouter, worker) {
  worker.on("message", (message) => {
    // NOTE: This is fatal and we can't continue
    if (!message.commissioner) {
      const message = `Can't redirect; message.commissioner is ${message.commissioner}`;
      log(message);
      throw new Error(message);
    } else {
      messageRouter.emit(`${message.commissioner}-extraction`, message);
    }
  });
}

export async function latest(db, name, module) {
  const subdb = db.openDB(database.order(name));
  const local = await module.local(subdb);
  const remote = await module.remote(execute);
  return {
    local,
    remote,
  };
}

async function compute(db, name, module) {
  if (!db || (!module && (!module.local || !module.remote))) {
    return {};
  }
  return await latest(db, name, module);
}

export async function run(strategy, worker, messageRouter, reinvocation = run) {
  let db;
  if (strategy?.loader?.output?.name) {
    const path = inDataDir(strategy.loader.output.name);
    db = database.open(path);
  }
  const state = await compute(db, strategy.name, strategy.coordinator?.module);

  if (strategy.extractor) {
    log(
      `Starting extractor strategy "${
        strategy.name
      }" with params "${JSON.stringify(strategy.extractor.args)}"`
    );
    await extract(
      strategy.name,
      strategy.extractor,
      worker,
      messageRouter,
      state
    );
    log(`Ending extractor strategy "${strategy.name}"`);
  }

  if (strategy.transformer) {
    log(`Starting transformer strategy "${strategy.name}"`);
    await transform(strategy.name, strategy.transformer, state);
    log(`Ending transformer strategy "${strategy.name}"`);
  }

  if (strategy.loader) {
    log(`Starting loader strategy "${strategy.name}"`);
    await load(strategy.name, strategy.loader, db, state);
    log(`Ending loader strategy "${strategy.name}"`);
  }

  await tidy(strategy?.extractor?.output?.name, strategy?.coordinator?.archive);
  await tidy(
    strategy?.transformer?.output?.name,
    strategy?.coordinator?.archive
  );

  if (strategy.coordinator?.interval) {
    log(`Waiting "${strategy.coordinator.interval}ms" to repeat the task`);
    await new Promise((resolve) =>
      setTimeout(resolve, strategy.coordinator.interval)
    );
    return reinvocation(strategy, worker, messageRouter, reinvocation);
  }
}

export async function walk(worker, config, messageRouter) {
  log(
    `Starting to execute strategies with the following crawl path`,
    util.inspect(config.path, {
      depth: null,
      colors: true,
      breakLength: "Infinity",
      compact: true,
    })
  );

  return await Promise.allSettled(
    config.path.map((strategy) => run(strategy, worker, messageRouter))
  );
}

export async function tidy(name, archive) {
  if (!name) {
    log(`tidy: Archive name "${name}" is undefined. Skipping."`);
    return;
  }
  const path = inDataDir(name);
  if (!(await fileExists(path))) {
    log(`Skipping "${path}" removal as path doesn't exist`);
    return;
  }

  if (archive) {
    log(`Renaming "${name}" outputs to then repeat task`);
    const nextPath = (fileName) => inDataDir(`${Date.now()}_${fileName}`);
    await rename(path, nextPath(name));
  } else {
    log(`Deleting "${name}" outputs to then repeat task`);
    await rm(path);
  }
}

export async function init(worker, config) {
  const messageRouter = new EventEmitter();
  subscribe(messageRouter, worker);
  await walk(worker, config, messageRouter);

  log("All strategies executed");
  worker.postMessage({
    type: "exit",
    version: "0.0.1",
  });
}
