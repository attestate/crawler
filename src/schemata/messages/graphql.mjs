const graphql = {
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
export default graphql;
