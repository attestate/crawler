const ipfs = {
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
export default ipfs;
