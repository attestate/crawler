//@format
import { constants, writeFileSync, unlinkSync } from "fs";
import { readdir, access, unlink, rmdir } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import EventEmitter from "events";
import test from "ava";

import { inDataDir, fileExists } from "../src/disc.mjs";
import {
  extract,
  transform,
  load,
  EXTRACTOR_CODES,
  prepareMessages,
  tidy,
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

test.serial("tidy: non-existent file", async (t) => {
  process.env.DATA_DIR = resolve("test/fixtures");
  const filePath = "non-existent-file.txt";

  // Assert file doesn't exist
  t.false(await fileExists(inDataDir(filePath)));

  // Call tidy with non-existent file
  const archive = false;
  await t.notThrowsAsync(async () => {
    await tidy(filePath, archive);
  });
});

test.serial("tidy: file exists and archive is false", async (t) => {
  process.env.DATA_DIR = resolve("test/fixtures");
  const filePath = "test-file.txt";
  const fullFilePath = inDataDir(filePath);

  // Create a test file
  writeFileSync(fullFilePath, "Hello, world!");

  const archive = false;
  await tidy(filePath, archive);

  t.false(await fileExists(fullFilePath));

  try {
    unlinkSync(fullFilePath);
  } catch (e) {
    // Ignore
  }
});

test.serial("tidy: file exists and archive is true", async (t) => {
  const filePath = "test-file.txt";
  const fullFilePath = inDataDir(filePath);

  writeFileSync(fullFilePath, "Hello, world!");

  const archive = true;
  await tidy(filePath, archive);

  const files = await readdir(process.env.DATA_DIR);

  const archivedFileExists = files.some((file) =>
    file.endsWith(`_${filePath}`)
  );

  t.true(archivedFileExists);

  // TODO: This seems to not always delete all files
  if (archivedFileExists) {
    const archivedFile = files.find((file) => file.endsWith(`_${filePath}`));
    unlinkSync(inDataDir(archivedFile));
  }
});

test("load function without existent input file", async (t) => {
  const name = "abc";
  const strategy = {
    input: {
      name: "non-existent-file",
    },
  };
  await load(name, strategy);
  t.pass();
});

test("direct load function", async (t) => {
  let count = 0;
  t.plan(6);
  const dbMock = {
    openDB: (name) => {
      t.true(name === "test-strategy:direct" || name === "test-strategy:order");
      return {
        put: async (k, v) => {
          t.truthy(v);
          if (count === 0) t.deepEqual(k, ["a"]);
          if (count === 1) t.deepEqual(k, ["b"]);
          count++;
        },
      };
    },
  };
  const strategy = {
    name: "test-strategy",
    loader: {
      input: {
        name: "../fixtures/file1.data",
      },
      output: {
        name: "../fixtures/file1.output",
      },
      module: {
        order: function* () {},
        direct: function* ({ state: { line } }) {
          const list = JSON.parse(line);
          for (let elem of list) {
            yield {
              key: [elem.primary],
              value: elem,
            };
          }
        },
      },
    },
  };
  const state = {};
  await load(strategy.name, strategy.loader, dbMock, state);
});

test("order load function", async (t) => {
  let count = 0;
  t.plan(6);
  const dbMock = {
    openDB: (name) => {
      t.true(name === "test-strategy:direct" || name === "test-strategy:order");
      return {
        put: async (k, v) => {
          t.truthy(v);
          if (count === 0) t.deepEqual(k, ["a", "c"]);
          if (count === 1) t.deepEqual(k, ["b", "a"]);
          count++;
        },
      };
    },
  };
  const strategy = {
    name: "test-strategy",
    loader: {
      input: {
        name: "../fixtures/file1.data",
      },
      output: {
        name: "../fixtures/file1.output",
      },
      module: {
        direct: function* () {},
        order: function* ({ state: { line } }) {
          const list = JSON.parse(line);
          for (let elem of list) {
            yield {
              key: [elem.primary, elem.secondary],
              value: elem.primary,
            };
          }
        },
      },
    },
  };
  const state = {};
  await load(strategy.name, strategy.loader, dbMock, state);
});

test("if function transform gracefully returns when sourceFile doesn't exist", async (t) => {
  const strategy = {
    name: "test-strategy",
    transformer: {
      input: {
        name: "doesn't exist",
      },
      module: {
        onLine: () => {},
      },
    },
  };
  const result = await transform(strategy.name, strategy.transformer);
  t.falsy(result);
});

test("reading a file by line using the line reader", async (t) => {
  let count = 0;
  t.plan(3);
  const lineHandlerMock = ({ state }) => {
    if (count === 0) t.is(state.line, "line0");
    if (count === 1) t.is(state.line, "line1");
    count++;
    return { write: "hello world", messages: [] };
  };
  const strategy = {
    name: "test-strategy",
    transformer: {
      module: {
        onLine: lineHandlerMock,
        onClose: () => {},
      },
      args: { arg1: "argument1" },
      input: {
        name: "../fixtures/file0.data",
      },
      output: {
        name: "../fixtures/file0.output",
      },
    },
  };

  const state = {};
  await transform(strategy.name, strategy.transformer, state);
  t.is(count, 2);
  try {
    await access(inDataDir(strategy.transformer.output.name), constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
  } finally {
    await unlink(inDataDir(strategy.transformer.output.name));
  }
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
  const state = {};
  await t.throwsAsync(async () => {
    try {
      await extract(mockStrategy, worker, router, state);
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
  const state = {};
  await t.throwsAsync(
    async () => await extract(mockStrategy, worker, router, state)
  );
  t.is(router.eventNames().length, 0);
});

test("if extract function can handle lifecycle errors", async (t) => {
  const mockStrategy = {
    name: mockMessageCommissioner,
    extractor: {
      output: {
        name: "name",
      },
      args: {},
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
  const state = {};

  const { code } = await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router,
    state
  );
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_UPDATE);
  t.is(router.eventNames().length, 0);
});

test("if extract() resolves the promise and removes the listener on no new messages", async (t) => {
  const mockStrategy = {
    name: mockMessageCommissioner,
    extractor: {
      output: {
        name: "name",
      },
      args: {},
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
  const state = {};

  await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router,
    state
  );
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract() resolves the promise and removes the listener on no message from init", async (t) => {
  const mockStrategy = {
    name: "a name",
    extractor: {
      output: {
        name: "name",
      },
      args: {},
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
  const state = {};

  const { code } = await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router,
    state
  );
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_INIT);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract function can write to the correct output name", async (t) => {
  const mockStrategy = {
    name: "a name",
    extractor: {
      output: {
        name: "../fixtures/file3.output",
      },
      args: {},
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
  const state = {};

  await extract(
    mockStrategy.name,
    mockStrategy.extractor,
    worker,
    router,
    state
  );
  t.is(await fileExists(inDataDir(mockStrategy.extractor.output.name)), true);
  await unlink(inDataDir(mockStrategy.extractor.output.name));
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
