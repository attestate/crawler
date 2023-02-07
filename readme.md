# @attestate/crawler

[![dry run prettier](https://github.com/attestate/crawler/actions/workflows/prettier.yml/badge.svg)](https://github.com/attestate/crawler/actions/workflows/prettier.yml)
[![unit tests](https://github.com/attestate/crawler/actions/workflows/node.js.yml/badge.svg)](https://github.com/attestate-crawler/actions/workflows/node.js.yml)

A JavaScript library for retrieving on-chain storage and generating data
derivatives.

- **Modular:** Extract, Transform and Load stage separation makes composing
  simple components into complex workflows possible. Stages are reunnable to
  recover errors.
- **Embedded:** Unlike Graph Protocol, attestate's crawler does not have a
  separate server process. It can directly write to self-contained databases
  like LevelDB or sqlite.
- **Batteries-included:** Support for Ethereum, IPFS, Arweave, GraphQL and
  rate-limit pooling for Infura and Alchemy.

* **[Getting Started](https://attestate.com/crawler/main/getting-started.html)**
* Documentation: [attestate.com/crawler/main](https://attestate.com/crawler/main)

### License

[SPDX-License-Identifier: GPL-3.0-only](https://spdx.org/licenses/GPL-3.0-only.html)
