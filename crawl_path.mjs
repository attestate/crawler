import { resolve } from "path";
import { env } from "process";
import * as blockLogs from "../crawler-call-block-logs/src/index.mjs";

const range = {
  start: 16370086,
  end: 16370087, // start + 1
};

//keccak - 256("Transfer(address,address,uint256)") == "0xddf...";
const topic0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const topic1 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export default [
  {
    name: "call-block-logs",
    extractor: {
      module: blockLogs.extractor,
      args: [range.start, range.end],
      output: {
        path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
      },
    },
    transformer: {
      module: blockLogs.transformer,
      args: [topic0, topic1],
      input: {
        path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
      },
      output: {
        path: resolve(env.DATA_DIR, "call-block-logs-transformation"),
      },
    },
  },
];
