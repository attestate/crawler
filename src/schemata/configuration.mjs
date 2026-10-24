//@format
const path = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    properties: {
      name: {
        type: "string",
        // PROBLEM: The message router expects a globally unique strategy name
        $comment: "strategy names for now must be globally unique",
      },
      coordinator: {
        type: "object",
        $comment:
          "Coordinates the state of the application by subscribing to new blocks via WebSocket.",
        additionalProperties: false,
        required: ["module"],
        properties: {
          archive: {
            type: "boolean",
            default: false,
            $comment:
              "If false, then extraction and transformation files in the data dir will be deleted. Otherwise they'll be prefixed with a timestamp to be archived (default: false).",
          },
          module: {
            type: "object",
          },
        },
      },
      extractor: {
        type: "object",
        properties: {
          module: {
            type: "object",
          },
          args: {
            type: "object",
          },
          input: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
          output: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
        },
        required: ["output", "module", "args"],
        additionalProperties: true,
      },
      transformer: {
        type: "object",
        properties: {
          module: {
            type: "object",
          },
          args: {
            type: "object",
          },
          input: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
          output: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
        },
        required: ["input", "output", "module", "args"],
        additionalProperties: true,
      },
      loader: {
        type: "object",
        properties: {
          module: {
            type: "object",
          },
          input: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
          output: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
        },
        required: ["input", "output", "module"],
        additionalProperties: true,
      },
    },
    required: ["name"],
  },
};

const httpUri = {
  type: "string",
  format: "uri",
  pattern: "^https?://",
};

const environment = {
  type: "object",
  additionalProperties: false,
  required: [
    "rpcHttpHost",
    "dataDir",
    "ipfsHttpsGateway",
    "arweaveHttpsGateway",
  ],
  properties: {
    rpcHttpHost: {
      oneOf: [
        httpUri,
        {
          type: "array",
          minItems: 1,
          items: httpUri,
        },
      ],
    },
    pollingInterval: {
      type: "integer",
      minimum: 1,
    },
    // Read by coordinators, e.g. @attestate/crawler-call-block-logs follows
    // an OP Stack sequencer's block gossip when it's set: true, a network
    // name or { network, udpPort, maxPeers }.
    gossip: {
      oneOf: [
        { type: "boolean" },
        { type: "string", minLength: 1 },
        {
          type: "object",
          properties: {
            network: {
              oneOf: [{ type: "string", minLength: 1 }, { type: "object" }],
            },
            udpPort: { type: "integer", minimum: 0, maximum: 65535 },
            maxPeers: { type: "integer", minimum: 1 },
          },
        },
      ],
    },
    rpcWsHost: {
      type: "string",
      format: "uri",
      pattern: "^wss?://",
    },
    rpcApiKey: {
      type: "string",
    },
    dataDir: {
      type: "string",
    },
    ipfsHttpsGateway: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    ipfsHttpsGatewayKey: {
      type: "string",
    },
    arweaveHttpsGateway: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
  },
};

const config = {
  type: "object",
  required: ["queue"],
  properties: {
    environment,
    path: { ...path },
    queue: {
      type: "object",
      required: ["options"],
      properties: {
        options: {
          type: "object",
          required: ["concurrent"],
          properties: {
            concurrent: { type: "integer" },
          },
        },
      },
    },
    endpoints: {
      type: "object",
      propertyNames: {
        format: "uri",
      },
      patternProperties: {
        "^.*$": {
          type: "object",
          properties: {
            requestsPerUnit: {
              type: "number",
            },
            unit: {
              enum: ["second", "minute", "hour", "day"],
            },
            timeout: {
              type: "number",
            },
          },
          dependencies: {
            requestsPerUnit: ["unit"],
            unit: ["requestsPerUnit"],
          },
          additionalProperties: false,
        },
      },
    },
  },
};

export default config;
