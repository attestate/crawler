import { resolve } from "path";

import * as blockLogs from "@attestate/crawler-call-block-logs";

const range = {
  start: 16579759,
  end: 16589761,
};
const stepSize = 1000;

const address = "0x0bC2A24ce568DAd89691116d5B34DEB6C203F342";
const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
];

const dataDir = resolve("./data");
export default {
  path: [
    {
      name: "call-block-logs",
      extractor: {
        module: blockLogs.extractor,
        args: [range.start, range.end, address, topics, stepSize],
        output: {
          path: resolve(dataDir, "call-block-logs-extraction"),
        },
      },
      transformer: {
        module: blockLogs.transformer,
        args: [],
        input: {
          path: resolve(dataDir, "call-block-logs-extraction"),
        },
        output: {
          path: resolve(dataDir, "call-block-logs-transformation"),
        },
      },
      loader: {
        module: blockLogs.loader,
        input: {
          path: resolve(dataDir, "call-block-logs-transformation"),
        },
        output: {
          path: resolve(dataDir, "call-block-logs-load"),
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
    //[env.RPC_HTTP_HOST]: {
    //  timeout: 10_000,
    //  requestsPerUnit: 25,
    //  unit: "second",
    //},
    "https://ipfs.io": {
      timeout: 6000,
      requestsPerUnit: 50,
      unit: "second",
    },
  },
};
