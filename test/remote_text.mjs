// @format
import { env } from "process";

import test from "ava";

import * as remote from "../src/remote.mjs";

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

test("retrieving a message from a remote", async (t) => {
  const message = {
    type: "json-rpc",
    method: "eth_blockNumber",
    params: [],
    version: "0.0.1",
    options,
  };
  const blockNumber = await remote.retrieve(message);
  t.true(Number.isInteger(blockNumber));
});
