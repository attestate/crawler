const arweave = {
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
export default arweave;
