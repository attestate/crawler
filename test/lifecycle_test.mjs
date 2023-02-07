//@format
import { constants } from "fs";
import { access, unlink } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import EventEmitter from "events";
import test from "ava";

import { fileExists } from "../src/disc.mjs";
import {
  extract,
  transform,
  EXTRACTOR_CODES,
  prepareMessages,
} from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockMessageCommissioner = "mockCommissioner";
const mockMessage = {
  type: "https",
  version: "0.0.1",
  options: {
    url: "https://attestate.com",
    method: "GET",
  },
};

test("if function transform gracefully returns when sourceFile doesn't exist", async (t) => {
  const strategy = {
    name: "test-strategy",
    transformer: {
      input: {
        path: "doesn't exist",
      },
      module: {
        onLine: () => {},
      },
    },
  };
  const result = await transform(strategy.name, strategy.transformer);
  t.falsy(result);
});

test.skip("reading a file by line using the line reader", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file0.data");
  const outputPath = resolve(__dirname, "./fixtures/file0.output");
  let count = 0;
  t.plan(3);
  const lineHandlerMock = (line) => {
    if (count === 0) t.is(line, "line0");
    if (count === 1) t.is(line, "line1");
    count++;
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy && strategy.module && strategy.module.name === "call-tokenuri"
  );
  const strategy = { ...strategies[0].module, onLine: lineHandlerMock };
  await transform({ module: strategy }, sourcePath, outputPath, []);
  t.is(count, 2);
  await unlink(outputPath);
});

test.skip("applying transformation strategies to a file", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file1.data");
  const outputPath = resolve(__dirname, "./fixtures/file1.output");
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy && strategy.module && strategy.module.name === "call-tokenuri"
  );
  await transform(strategies[0], sourcePath, outputPath, []);
  try {
    await access(outputPath, constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
    return;
  }
  await unlink(outputPath);
  t.pass();
});

test.skip("strategy transformer should receive inputs", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file1.data");
  const outputPath = resolve(__dirname, "./fixtures/file2.output");
  t.plan(3);
  const lineHandlerMock = (line, arg1) => {
    t.is(arg1, "arg1");
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy && strategy.module && strategy.module.name === "call-tokenuri"
  );
  const strategy = { ...strategies[0].module, onLine: lineHandlerMock };
  await transform({ module: strategy }, sourcePath, outputPath, ["arg1"]);
  try {
    await access(outputPath, constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
    return;
  }
  await unlink(outputPath);
  t.pass();
});

test("if extract rejects result if it is invalid", async (t) => {
  const mockStrategy = {
    module: {
      name: "mockMessage",
      init: () => {
        return false;
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();
  await t.throwsAsync(async () => {
    try {
      await extract(mockStrategy, worker, router);
    } catch (e) {
      throw e;
    }
  });
});

test("if extract function can handle bad results from update", async (t) => {
  const mockStrategy = {
    module: {
      name: mockMessageCommissioner,
      init: () => {
        return {
          messages: [mockMessage],
          write: null,
        };
      },
      update: () => {
        return false;
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();
  await t.throwsAsync(async () => await extract(mockStrategy, worker, router));
  t.is(router.eventNames().length, 0);
});

test("if extract function can handle lifecycle errors", async (t) => {
  const mockStrategy = {
    name: mockMessageCommissioner,
    extractor: {
      output: {
        path: "path",
      },
      args: [],
      module: {
        init: () => {
          return {
            messages: [{ ...mockMessage, error: "this is an error" }],
            write: null,
          };
        },
        update: () => {
          t.fail();
        },
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  const { code } = await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router
  );
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_UPDATE);
  t.is(router.eventNames().length, 0);
});

test("if extract() resolves the promise and removes the listener on no new messages", async (t) => {
  const mockStrategy = {
    name: mockMessageCommissioner,
    extractor: {
      output: {
        path: "path",
      },
      args: [],
      module: {
        init: () => {
          return { messages: [mockMessage], write: null };
        },
        update: () => {
          return { messages: [], write: null };
        },
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  await extract(mockStrategy.name, mockStrategy.extractor, worker, router);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract() resolves the promise and removes the listener on no message from init", async (t) => {
  const mockStrategy = {
    name: "a name",
    extractor: {
      output: {
        path: "path",
      },
      args: [],
      module: {
        init: () => {
          return { messages: [], write: null };
        },
        update: () => {
          return { messages: [], write: null };
        },
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  const { code } = await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router
  );
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_INIT);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract function can write to the correct output path", async (t) => {
  const mockStrategy = {
    name: "a name",
    extractor: {
      output: {
        path: resolve(__dirname, "./fixtures/file3.output"),
      },
      args: [],
      module: {
        init: () => {
          return { messages: [], write: "some-test-data" };
        },
        update: () => {
          return null;
        },
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  await extract(mockStrategy.name, mockStrategy.extractor, worker, router);
  t.is(await fileExists(mockStrategy.extractor.output.path), true);
  await unlink(mockStrategy.extractor.output.path);
});

test("if prepareMessages filters invalid message and prepare message for worker", async (t) => {
  const messages = [mockMessage, {}, { ...mockMessage, type: "invalid-type" }];

  const preparedMessages = prepareMessages(messages, mockMessageCommissioner);

  t.is(preparedMessages.length, 1);
  t.is(preparedMessages[0].commissioner, mockMessageCommissioner);
});

test("if filterValidWorkerMessages throws error on invalid input", async (t) => {
  t.throws(() => prepareMessages(null));
});
