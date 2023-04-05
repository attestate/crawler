// @format
import test from "ava";
import { env } from "process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import {
  boot,
  createWorker,
  getConfig,
  validateConfig,
  augment,
} from "../src/boot.mjs";

import configuration from "../src/schemata/configuration.mjs";
import { requiredVars } from "../src/environment.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("if required environment vars in module and schema match", (t) => {
  const configVars = configuration.properties.environment.required;
  const envVars = Object.values(requiredVars);
  t.deepEqual(configVars, envVars);
});

test.serial("if non-existent environment object is handled gracefully", (t) => {
  env.RPC_API_KEY = "ABC";
  const config = {};
  const nextConfig = augment(config);
  t.is(nextConfig.environment.rpcApiKey, env.RPC_API_KEY);
});

test.serial("falling back on config vars when env vars aren't present", (t) => {
  delete env.RPC_API_KEY;
  const config = {
    environment: {
      rpcApiKey: "key",
    },
  };
  const nextConfig = augment(config);
  t.is(nextConfig.environment.rpcApiKey, config.environment.rpcApiKey);
});

test.serial("overwriting config variables with the environment", (t) => {
  env.RPC_API_KEY = "OVERWRITE";
  const config = {
    environment: {
      rpcApiKey: "key",
    },
  };
  const nextConfig = augment(config);
  t.is(nextConfig.environment.rpcApiKey, env.RPC_API_KEY);
});

test.serial("if boot can be started programmatically", async (t) => {
  let hitInit = false;
  let hitUpdate = false;
  const crawlPath = [
    {
      name: "customstrategy",
      extractor: {
        module: {
          init: () => {
            hitInit = true;
            return {
              write: null,
              messages: [
                {
                  type: "json-rpc",
                  method: "eth_blockNumber",
                  params: [],
                  version: "0.0.1",
                  options: {
                    url: env.RPC_HTTP_HOST,
                  },
                },
              ],
            };
          },
          update: () => {
            hitUpdate = true;
            return {
              write: null,
              messages: [],
            };
          },
        },
        args: [],
        output: {
          path: "output",
        },
      },
    },
  ];
  const config = {
    path: crawlPath,
    queue: {
      options: {
        concurrent: 1,
      },
    },
  };
  await boot(config);
  t.true(hitInit);
  t.true(hitUpdate);
});

test.serial("if boot can throw errors", async (t) => {
  const crawlPath = [{ name: "doesn't exist", extractor: {} }];
  const config = {
    path: crawlPath,
    queue: {
      options: {
        concurrent: 1,
      },
    },
  };
  await t.throwsAsync(async () => await boot(config));
});

test.serial("should be able to create worker", (t) => {
  return new Promise((resolve, reject) => {
    createWorker({
      environment: { dataDir: "data" },
      queue: { options: { concurrent: 10 } },
    }).then((w) => {
      setTimeout(() => {
        // NOTE: no error has occured until now, safe to pass the test
        t.pass();
        resolve();
      }, 1000);

      w.on("error", (error) => {
        t.fail(error.toString());
        reject();
      });
    });
  });
});

test("should be able getConfig for a valid path", async (t) => {
  const config = await getConfig(resolve(__dirname, "../config.mjs"));
  t.notThrows(() => validateConfig(config));
});

test("if getConfig fails on invalid config", async (t) => {
  const config = await getConfig(
    resolve(__dirname, "../test/fixtures/falseconfig.mjs")
  );
  t.throws(() => validateConfig(config));
});

test("getConfig should throw error for invalid path", async (t) => {
  await t.throwsAsync(() => getConfig(resolve(__dirname)));
});
