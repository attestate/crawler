import { resolve } from "path";
import { env } from "process";

// crawlPath[i] and crawlPath[i+1] are executed in sequence
// crawlPath[i][j] and crawlPath[i][j+1] are executed in parallel
export default [
  [
    {
      name: "call-block-logs",
      extractor: {
        args: [16335993, 16335994],
      },
      transformer: {
        output: {
          resolve: true,
        },
        args: [
          resolve(env.DATA_DIR, "call-block-logs-extraction"),
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        ],
      },
    },
  ],
];
