import { resolve } from "path";
import { env } from "process";

export default [
  {
    name: "get-block-number",
    extractor: {
      module: {
        init: () => ({
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
        }),
        update: () => {
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
