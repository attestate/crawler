const jsonrpc = {
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
export default jsonrpc;
