// @format
import { env } from "process";

import invert from "lodash.invert";

import { NotFoundError } from "./errors.mjs";

export const requiredVars = {
  RPC_HTTP_HOST: "rpcHttpHost",
  DATA_DIR: "dataDir",
  IPFS_HTTPS_GATEWAY: "ipfsHttpsGateway",
  ARWEAVE_HTTPS_GATEWAY: "arweaveHttpsGateway",
};

export const optionalVars = {
  RPC_API_KEY: "rpcApiKey",
  RPC_WS_HOST: "rpcWsHost",
  IPFS_HTTPS_GATEWAY_KEY: "ipfsHttpsGatewayKey",
};

export function collect(vars) {
  const config = {};
  for (const [envAlias, configAlias] of Object.entries(vars)) {
    if (env[envAlias]) config[configAlias] = env[envAlias];
  }
  return config;
}

export function set(configuration) {
  const allVars = invert({ ...requiredVars, ...optionalVars });
  for (const [configAlias, envAlias] of Object.entries(allVars)) {
    env[envAlias] = configuration[configAlias];
  }
}
