//@format
import { readFileSync } from "fs";

import test from "ava";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import configuration from "../src/schemata/configuration.mjs";
const crawlPath = configuration.properties.path;

import ipfs from "../src/schemata/messages/ipfs.mjs";
import arweave from "../src/schemata/messages/arweave.mjs";
import graphql from "../src/schemata/messages/graphql.mjs";
import jsonrpc from "../src/schemata/messages/jsonrpc.mjs";
import https from "../src/schemata/messages/https.mjs";

const ajv = new Ajv();
addFormats(ajv);

test("compile schema", (t) => {
  ajv.compile(configuration);
  ajv.compile(crawlPath);
  t.pass();
});

test("should be a valid config", (t) => {
  const check = ajv.compile(configuration);
  const example = {
    queue: {
      options: {
        concurrent: 10,
      },
    },
    endpoints: {
      "https://eth-mainnet.alchemyapi.io": {
        timeout: 3000,
        requestsPerUnit: 100,
        unit: "second",
      },
    },
  };

  const valid = check(example);
  t.true(valid);
});

test("should be an invalid config", (t) => {
  const check = ajv.compile(configuration);
  const example = {
    queue: {
      options: {
        // concurrent options is required but missing here
      },
    },
    endpoints: {
      "https://eth-mainnet.alchemyapi.io": {
        timeout: 3000,
        requestsPerUnit: 100,
        unit: "second",
      },
    },
  };

  const valid = check(example);
  t.false(valid);
});

test("should be a valid crawlPath", (t) => {
  const check = ajv.compile(crawlPath);
  const example = [
    {
      name: "a strategy",
      extractor: {
        module: {
          init: () => {},
          update: () => {},
        },
        args: [],
        output: {
          path: "output",
        },
      },
      transformer: {
        module: {
          onLine: () => {},
        },
        args: [],
        input: {
          path: "input",
        },
        output: {
          path: "output",
        },
      },
      loader: {
        handler: () => {},
        input: {
          path: "input",
        },
      },
    },
    {
      name: "another name",
      extractor: {
        module: {
          init: () => {},
          update: () => {},
        },
        args: [],
        output: {
          path: "output",
        },
      },
      transformer: {
        module: {
          onLine: () => {},
        },
        args: [],
        input: {
          path: "input",
        },
        output: {
          path: "output",
        },
      },
    },
  ];

  const valid = check(example);
  if (!valid) t.log(check.errors);
  t.true(valid);
});

test("should be a valid ipfs message", (t) => {
  const check = ajv.compile(ipfs);
  const message = {
    options: {
      uri: "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
      gateway: `https://ipfs.io/ipfs/`,
    },
    version: "1.0.0",
    type: "ipfs",
    commissioner: "test",
  };

  const valid = check(message);
  t.true(valid);
});

test("ipfs gateway is a https url", (t) => {
  const check = ajv.compile(ipfs);
  const message = {
    options: {
      uri: "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
      gateway: `bitcoin://abc`,
    },
    version: "1.0.0",
    type: "ipfs",
    commissioner: "test",
  };

  const valid = check(message);
  t.false(valid);
  t.true(check.errors[0].instancePath.includes("/options/gateway"));
});

test("ipfs message url should end with ipfs/", (t) => {
  const check = ajv.compile(ipfs);
  const message = {
    options: {
      uri: "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
      gateway: `https://ipfs.io/`,
    },
    version: "1.0.0",
    type: "ipfs",
    commissioner: "test",
  };

  const valid = check(message);
  t.false(valid);
  t.true(check.errors[0].instancePath.includes("/options/gateway"));
});

test("should be a valid arweave message", (t) => {
  const check = ajv.compile(arweave);
  const message = {
    options: {
      uri: "ar://ltmVC0dpe7_KxFHj0-S7mdvXSfmcJOec4_OfjwSzLRk/1",
      gateway: "https://arweave.net/",
    },
    version: "1.0.0",
    type: "arweave",
    commissioner: "test",
  };

  const valid = check(message);
  t.true(valid);
});

test("arweave gateway should be a https url", (t) => {
  const check = ajv.compile(arweave);
  const message = {
    options: {
      uri: "ar://ltmVC0dpe7_KxFHj0-S7mdvXSfmcJOec4_OfjwSzLRk/1",
      gateway: "arweave.net/",
    },
    version: "1.0.0",
    type: "arweave",
    commissioner: "test",
  };

  const invalid = check(message);
  t.falsy(invalid);
});

test("that all worker messages allow local (gateway) uris starting with 'http'", (t) => {
  const c1 = ajv.compile(arweave);
  const m1 = {
    options: {
      uri: "ar://ltmVC0dpe7_KxFHj0-S7mdvXSfmcJOec4_OfjwSzLRk/1",
      gateway: "http://localhost",
    },
    version: "1.0.0",
    type: "arweave",
    commissioner: "test",
  };
  const r1 = c1(m1);
  t.true(r1);

  const c2 = ajv.compile(ipfs);
  const m2 = {
    options: {
      uri: "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
      gateway: "http://localhost/ipfs/",
    },
    version: "1.0.0",
    type: "ipfs",
    commissioner: "test",
  };

  const r2 = c2(m2);
  t.true(r2);

  const c3 = ajv.compile(graphql);
  const m3 = {
    options: {
      url: "http://localhost",
      body: "abc",
    },
    version: "1.0.0",
    type: "graphql",
    commissioner: "test",
  };

  const r3 = c3(m3);
  t.true(r3);

  const c4 = ajv.compile(https);
  const m4 = {
    options: {
      url: "http://localhost",
      method: "GET",
    },
    version: "1.0.0",
    type: "https",
    commissioner: "test",
  };

  const r4 = c4(m4);
  t.true(r4);

  const c5 = ajv.compile(jsonrpc);
  const m5 = {
    options: {
      url: "http://localhost",
    },
    method: "eth_call",
    version: "1.0.0",
    type: "json-rpc",
    params: [],
    commissioner: "test",
  };

  const r5 = c5(m5);
  t.true(r5);
});
