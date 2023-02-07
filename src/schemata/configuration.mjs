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

const config = {
  type: "object",
  required: ["queue"],
  properties: {
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
