// @format
import { env } from "process";

import * as blockLogs from "@attestate/crawler-call-block-logs";

export default {
  environment: {
    rpcHttpHost: env.RPC_HTTP_HOST || env.OPTIMISM_RPC_HTTP_HOST,
    rpcApiKey: env.RPC_API_KEY || "",
    rpcWsHost: env.RPC_WS_HOST,
    ipfsHttpsGateway: env.IPFS_HTTPS_GATEWAY || "https://",
    arweaveHttpsGateway: env.ARWEAVE_HTTPS_GATEWAY || "https://",
  },
  path: [
    {
      name: "list-delegations-2",
      coordinator: {
        archive: false,
        module: blockLogs.state,
      },
      extractor: {
        module: blockLogs.extractor,
        args: {
          start: 140309527, // Delegator3 deployment block
          address: "0x418910fef46896eb0bfe38f656e2f7df3eca7198", // Delegator3 address
          topics: [
            // keccak256("Delegate(bytes32[3],address)") ===
            "0xcd9cc59d1cc3aa17955023d009176720c8a383000a973ae2933c1cf6cbeee480",
          ],
          blockspan: 5000,
          includeTimestamp: false,
        },
        output: {
          name: "list-delegations-extraction-2",
        },
      },
      transformer: {
        module: blockLogs.transformer,
        args: {
          inputs: [
            {
              type: "bytes32[3]",
              name: "data",
              indexed: false,
            },
            {
              type: "address",
              name: "sender",
              indexed: false,
            },
          ],
        },
        input: {
          name: "list-delegations-extraction-2",
        },
        output: {
          name: "list-delegations-transformation-2",
        },
      },
      loader: {
        module: blockLogs.loader,
        input: {
          name: "list-delegations-transformation-2",
        },
        output: {
          name: "list-delegations-load-2",
        },
      },
      end: () => console.log("crawl ended"),
    },
  ],
  queue: {
    options: {
      concurrent: 10,
    },
  },
  endpoints: {
    [env.RPC_HTTP_HOST || env.OPTIMISM_RPC_HTTP_HOST]: {
      timeout: 10_000,
      requestsPerUnit: 15,
      unit: "second",
    },
  },
};
