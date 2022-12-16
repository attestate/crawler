import { resolve } from "path";
import { env } from "process";

// crawlPath[i] and crawlPath[i+1] are executed in sequence
// crawlPath[i][j] and crawlPath[i][j+1] are executed in parallel
export default [
  [
    {
      name: "call-block-logs",
      transformer: {
        output: {
          resolve: true,
        },
        args: [
          resolve(env.DATA_DIR, "call-block-logs-extraction"),
          {
            "0xf5819e27b9bad9f97c177bf007c1f96f26d91ca6": {
              name: "noizd",
            },
          },
        ],
      },
    },
  ],
];
