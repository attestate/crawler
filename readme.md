# @attestate/crawler

[![dry run prettier](https://github.com/attestate/crawler/actions/workflows/prettier.yml/badge.svg)](https://github.com/attestate/crawler/actions/workflows/prettier.yml)
[![unit tests](https://github.com/attestate/crawler/actions/workflows/node.js.yml/badge.svg)](https://github.com/attestate-crawler/actions/workflows/node.js.yml)

`@attestate/crawler` is a tool chain to retrieve on-chain data from Ethereum.
It implements an **E**xtract, **T**ransform and **L**oad separation of
components to effectively extract massive amounts of data from Ethereum full
node clients like Erigon. `@attestate/crawler` is fully licensed under the GPL3
making it owned by the community and not a single entity. ETL strategies of
`@attestate/crawler` allow downloading the metadata of the music NFTs ecosystem.

### prerequsites

- Run and sync an Ethereum full node.

```bash
# Clone the repository
git clone git@github.com:attestate/crawler.git

# Copy the example .env file
# ⚠️ Be sure to update the variables in `.env` with the appropriate values!
cp .env-copy .env

# Install the dependencies
npm i
```

You can then use `npm run dev` to start an exemplary crawl.
`@attestate/crawler` defaults to using using the `./crawl_path.mjs` and
`config.mjs` file.

### configuring environment variables

The following environment variables are required:

```
RPC_HTTP_HOST=https://
DATA_DIR=data
EXTRACTION_WORKER_CONCURRENCY=12
IPFS_HTTPS_GATEWAY=https://
ARWEAVE_HTTPS_GATEWAY=https://
```

- `DATA_DIR` is a directory containing all outputs that accumulate during a
  crawl.
- If `RPC_HTTP_HOST` requires Bearer-token authorization, users must define
  `RPC_API_KEY` to be used in an HTTP `Authorization: Bearer ${RPC_API_KEY}`
  header.
- If `IPFS_HTTPS_GATEWAY` requires Bearer-token authorization, users must define
  `IPFS_HTTPS_GATEWAY_KEY` to be used in an HTTP
  `Authorization: Bearer ${IPFS_HTTPS_GATEWAY_KEY}` header.

### javascript usage

The package can be imported as a JavaScript utility to run strategies too:

```js
import { boot } from "@attestate/crawler";

const crawlPath = [[{ name: "get-xkcd", extractor: {} }]];
const config = {
  queue: {
    options: {
      concurrent: 1,
    },
  },
};
(async () => {
  await boot(crawlPath, config);
})();
```

### command line interface

Alternatively, the CLI can be used to run strategies.

#### options

```
Usage: crawler.mjs <options>

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --path     Sequence of strategies that the crawler will follow.     [required]
  --config   Configuration for CLI
```

### crawl path

A crawl path defines what strategies are executed by the crawler and in what
order. It can be defined as an `.mjs` file and must follow a particular schema.
Check `@neume-network/schema` for more information.

## license

Licensed as
[SPDX-License-Identifier: GPL-3.0-only](https://spdx.org/licenses/GPL-3.0-only.html)
