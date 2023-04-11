import * as blockLogs from "@attestate/crawler-call-block-logs";

// done:
//
// - re-type args to object
// - add interval in schema
// - Change input and output path to "name"
// - change `args` into object from array
// - adjust entire documentation
//
// changes
//
// - 1 arguments are now to be passed in an object
// - the output path is now passed as a single string, not as a path. it is to be
// resolved within the program
// - it is now "output.name" and "input.name" (from "path")
// - interval reruns a task after some milli seconds
//
// todos
// - add interval functionality to lifecycle
// - we should create an extractor path that is of type: "ethereum" that then
//  resolves continuously everytime latest block is hit

export default {
  path: [
    {
      name: "call-block-logs",
      extractor: {
        module: blockLogs.extractor,
        args: {
          start: 16579759,
          end: 17024582,
          address: "0x0bC2A24ce568DAd89691116d5B34DEB6C203F342",
          topics: [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          stepSize: 1000,
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
