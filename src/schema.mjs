//@format
export const https = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["https"],
    },
    commissioner: {
      type: "string",
    },
    version: {
      type: "string",
    },
    options: {
      type: "object",
      properties: {
        timeout: {
          $comment: "temporal unit is milliseconds",
          type: "integer",
        },
        url: {
          type: "string",
          format: "uri",
          pattern: "^(https|http)://",
        },
        method: { type: "string" },
        body: { type: "string" },
        headers: { type: "object" },
      },
      required: ["url", "method"],
    },
    results: {
      type: "object",
    },
    error: {
      type: "string",
    },
  },
  required: ["type", "commissioner", "version", "options"],
};

export const graphql = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["graphql"],
    },
    commissioner: {
      type: "string",
    },
    version: {
      type: "string",
    },
    options: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^(https|http)://",
        },
        body: { type: "string" },
        headers: { type: "object" },
      },
      required: ["url", "body"],
    },
    results: {
      type: "object",
    },
    error: {
      type: "string",
    },
  },
  required: ["type", "commissioner", "version", "options"],
};

export const jsonrpc = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["json-rpc"],
    },
    commissioner: {
      type: "string",
    },
    version: {
      type: "string",
    },
    options: {
      type: "object",
      properties: {
        timeout: {
          $comment: "temporal unit is milliseconds",
          type: "integer",
        },
        url: {
          type: "string",
          format: "uri",
          pattern: "^(https|http)://",
        },
      },
      required: ["url"],
    },
    method: {
      type: "string",
    },
    params: {
      type: "array",
    },
    results: {
      type: "object",
    },
    error: {
      type: "string",
    },
  },
  required: ["type", "commissioner", "method", "params", "version", "options"],
};

export const ipfs = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["ipfs"],
    },
    commissioner: {
      type: "string",
    },
    version: {
      type: "string",
    },
    options: {
      type: "object",
      properties: {
        timeout: {
          $comment: "temporal unit is milliseconds",
          type: "integer",
        },
        uri: {
          type: "string",
          format: "uri",
        },
        gateway: {
          type: "string",
          format: "uri",
          pattern: "^(https|http)?://[^/]+/(ip[fn]s)/",
          $comment:
            "Must equate to a regular IPFS path gateway. We had initially considered supporting subdomain gateways too, but a lack of expressing their URIs generically lead us ignore their support.",
        },
        headers: { type: "object" },
      },
      required: ["uri", "gateway"],
    },
    results: {
      type: "object",
    },
    error: {
      type: "string",
    },
  },
  required: ["type", "commissioner", "version", "options"],
};

export const arweave = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["arweave"],
    },
    commissioner: {
      type: "string",
    },
    version: {
      type: "string",
    },
    options: {
      type: "object",
      properties: {
        timeout: {
          $comment: "temporal unit is milliseconds",
          type: "integer",
        },
        uri: {
          type: "string",
          format: "uri",
          pattern: "ar://[a-zA-Z0-9-_]{43}.*",
        },
        gateway: {
          type: "string",
          format: "uri",
          pattern: "^(https|http)://",
        },
        headers: { type: "object" },
      },
      required: ["uri", "gateway"],
    },
    results: {
      type: "object",
    },
    error: {
      type: "string",
    },
  },
  required: ["type", "commissioner", "version", "options"],
};

export const exit = {
  type: "object",
  required: ["type", "version"],
  properties: {
    type: {
      type: "string",
      enum: ["exit"],
    },
    version: {
      type: "string",
    },
  },
};

export const workerMessage = {
  oneOf: [https, graphql, jsonrpc, ipfs, arweave, exit],
};

export const config = {
  type: "object",
  required: ["queue"],
  properties: {
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

export const version = {
  type: "string",
  // Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  pattern:
    "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
};

export const crawlPath = {
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
      extractor: {
        type: "object",
        properties: {
          module: {
            type: "object",
          },
          args: {
            type: "array",
          },
          input: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
            },
            required: ["path"],
          },
          output: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
            },
            required: ["path"],
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
            type: "array",
          },
          input: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
            },
            required: ["path"],
          },
          output: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
            },
            required: ["path"],
          },
        },
        required: ["input", "output", "module", "args"],
        additionalProperties: true,
      },
      loader: {
        type: "object",
        properties: {
          // PROBLEM: We cannot define "handler" as a type: function here.
          input: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
            },
            required: ["path"],
          },
        },
        required: ["input"],
        additionalProperties: true,
      },
    },
    required: ["name"],
  },
};
