import { env } from "process";
import { resolve } from "path";

import * as blockLogs from "@attestate/crawler-call-block-logs";

const range = {
  start: 16370086,
  end: 16370087,
};

const address = "0x24da31e7bb182cb2cabfef1d88db19c2ae1f5572";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];

export default {
  path: [
    {
      name: "call-block-logs",
      extractor: {
        module: blockLogs.extractor,
        args: [range.start, range.end, address, topics],
        output: {
          path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
        },
      },
      transformer: {
        module: blockLogs.transformer,
        args: [],
        input: {
          path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
        },
        output: {
          path: resolve(env.DATA_DIR, "call-block-logs-transformation"),
        },
      },
    },
  ],
  queue: {
    options: {
      concurrent: 100,
    },
  },
  endpoints: {
    [env.RPC_HTTP_HOST]: {
      timeout: 10_000,
      requestsPerUnit: 25,
      unit: "second",
    },
    "https://metadata.sound.xyz": {
      timeout: 4000,
      requestsPerUnit: 6,
      unit: "second",
    },
    "https://ipfs.io": {
      timeout: 6000,
      requestsPerUnit: 50,
      unit: "second",
    },
  },
};
