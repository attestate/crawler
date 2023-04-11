//@format
import { createInterface } from "readline";
import { createReadStream, appendFileSync } from "fs";
import EventEmitter, { once } from "events";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import util from "util";
import { open } from "lmdb";

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

export async function transform(name, strategy) {
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
  rl.on("line", async (line) => {
    const write = strategy.module.onLine(line, strategy.args);
    if (write) {
      appendFileSync(outputPath, `${write}\n`);
    }
  });
  // TODO: Figure out how `onError` shall be handled.
  rl.on("error", (error) => {
    const write = strategy.onError(error);
  });

  await once(rl, "close");
  const write = strategy.module.onClose();
  if (write) {
    appendFileSync(outputPath, `${write}\n`);
  }
  return buffer;
}

export function extract(name, strategy, worker, messageRouter) {
  return new Promise(async (resolve, reject) => {
    let numberOfMessages = 0;
    const type = "extraction";
    const interval = setInterval(() => {
      log(
        `${name} extractor is running with ${numberOfMessages} messages pending`
      );
    }, 120_000);

    let result;
    try {
      result = await strategy.module.init(strategy.args);
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
        try {
          result = await strategy.module.update(message);
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

export async function load(name, strategy, db) {
  const inputPath = inDataDir(strategy.input.name);
  const rl = createInterface({
    input: createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line === "") continue;

    for (const { key, value } of strategy.module.order(line)) {
      await database.toOrder(db, name, key, value);
    }

    for (const { key, value } of strategy.module.direct(line)) {
      await database.toDirect(db, name, key, value);
    }
  }
}

export async function init(worker, crawlPath) {
  const messageRouter = new EventEmitter();

  worker.on("message", (message) => {
    // This is fatal we can't continue
    if (!message.commissioner) {
      throw new Error(
        `Can't redirect; message.commissioner is ${message.commissioner}`
      );
    } else {
      messageRouter.emit(`${message.commissioner}-extraction`, message);
    }
  });

  log(
    `Starting to execute strategies with the following crawlPath`,
    util.inspect(crawlPath, {
      depth: null,
      colors: true,
      breakLength: "Infinity",
      compact: true,
    })
  );

  for await (const strategy of crawlPath) {
    if (strategy.extractor) {
      log(
        `Starting extractor strategy "${
          strategy.name
        }" with params "${JSON.stringify(strategy.extractor.args)}"`
      );
      await extract(strategy.name, strategy.extractor, worker, messageRouter);
      log(`Ending extractor strategy "${strategy.name}"`);
    }

    if (strategy.transformer) {
      log(`Starting transformer strategy "${strategy.name}"`);
      await transform(strategy.name, strategy.transformer);
      log(`Ending transformer strategy "${strategy.name}"`);
    }

    if (strategy.loader) {
      log(`Starting loader strategy "${strategy.name}"`);
      const db = new open({
        path: inDataDir(strategy.loader.output.name),
      });
      await load(strategy.name, strategy.loader, db);
      log(`Ending loader strategy "${strategy.name}"`);
    }
  }

  log("All strategies executed");
  worker.postMessage({
    type: "exit",
    version: "0.0.1",
  });
}
