// @format
import { env } from "process";

import test from "ava";

import {
  set,
  optionalVars,
  requiredVars,
  collect,
} from "../src/environment.mjs";
import { NotFoundError } from "../src/errors.mjs";

test("setting environment variables through config", (t) => {
  delete env.RPC_HTTP_HOST;
  delete env.RPC_API_KEY;
  delete env.DATA_DIR;
  delete env.IPFS_HTTPS_GATEWAY;
  delete env.IPFS_HTTPS_GATEWAY_KEY;
  delete env.ARWEAVE_HTTPS_GATEWAY;
  t.falsy(env.RPC_HTTP_HOST);
  t.falsy(env.IPFS_HTTPS_GATEWAY_KEY);

  const config = {
    environment: {
      rpcHttpHost: "rpcHttpHost",
      ipfsHttpsGatewayKey: "ipfsHttpsGatwayKey",
    },
  };
  set(config.environment);

  t.is(env.RPC_HTTP_HOST, config.environment.rpcHttpHost);
  t.is(env.IPFS_HTTPS_GATEWAY_KEY, config.environment.ipfsHttpsGatewayKey);
});

test("collecting variables from environment where some vars are undefined", (t) => {
  env.RPC_HTTP_HOST = "rpcHttpHost";
  env.RPC_API_KEY = "rpcApiKey";
  env.DATA_DIR = "dataDir";
  delete env.IPFS_HTTPS_GATEWAY;
  delete env.IPFS_HTTPS_GATEWAY_KEY;
  delete env.ARWEAVE_HTTPS_GATEWAY;
  const collection = collect({ ...requiredVars, ...optionalVars });
  t.false(collection.hasOwnProperty("ipfsHttpsGateway"));
  t.false(collection.hasOwnProperty("ipfsHttpsGatewayKey"));
  t.false(collection.hasOwnProperty("arweaveHttpsGateway"));
  t.deepEqual(
    {
      rpcHttpHost: "rpcHttpHost",
      rpcApiKey: "rpcApiKey",
      dataDir: "dataDir",
    },
    collection
  );
});

test("collecting variables from environment", (t) => {
  env.RPC_HTTP_HOST = "rpcHttpHost";
  env.DATA_DIR = "dataDir";
  env.IPFS_HTTPS_GATEWAY = "ipfsHttpsGateway";
  env.ARWEAVE_HTTPS_GATEWAY = "arweaveHttpsGateway";
  env.RPC_API_KEY = "rpcApiKey";
  env.IPFS_HTTPS_GATEWAY_KEY = "ipfsHttpsGatewayKey";
  const collection = collect({ ...requiredVars, ...optionalVars });
  t.deepEqual(
    {
      rpcHttpHost: "rpcHttpHost",
      rpcApiKey: "rpcApiKey",
      dataDir: "dataDir",
      ipfsHttpsGateway: "ipfsHttpsGateway",
      ipfsHttpsGatewayKey: "ipfsHttpsGatewayKey",
      arweaveHttpsGateway: "arweaveHttpsGateway",
    },
    collection
  );
});
