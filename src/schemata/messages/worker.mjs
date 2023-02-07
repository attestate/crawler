import https from "./https.mjs";
import graphql from "./graphql.mjs";
import jsonrpc from "./jsonrpc.mjs";
import ipfs from "./ipfs.mjs";
import arweave from "./arweave.mjs";
import exit from "./exit.mjs";

const worker = {
  oneOf: [https, graphql, jsonrpc, ipfs, arweave, exit],
};

export default worker;
