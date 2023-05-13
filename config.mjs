import * as blockLogs from "@attestate/crawler-call-block-logs";

export default {
  path: [
    {
      name: "call-block-logs",
      coordinator: {
        archive: false,
        module: blockLogs.state,
        interval: 5000,
      },
      extractor: {
        module: blockLogs.extractor,
        args: {
          start: 16579759,
          address: "0x0bC2A24ce568DAd89691116d5B34DEB6C203F342",
          topics: [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          blockspan: 1000,
        },
        output: {
          name: "call-block-logs-extraction",
        },
      },
      transformer: {
        module: blockLogs.transformer,
        args: {},
        input: {
          name: "call-block-logs-extraction",
        },
        output: {
          name: "call-block-logs-transformation",
        },
      },
      loader: {
        module: blockLogs.loader,
        input: {
          name: "call-block-logs-transformation",
        },
        output: {
          name: "call-block-logs-load",
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
