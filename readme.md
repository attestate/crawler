# @attestate/crawler

[![dry run prettier](https://github.com/attestate/crawler/actions/workflows/prettier.yml/badge.svg)](https://github.com/attestate/crawler/actions/workflows/prettier.yml)
[![unit tests](https://github.com/attestate/crawler/actions/workflows/node.js.yml/badge.svg)](https://github.com/attestate-crawler/actions/workflows/node.js.yml)

The `@attestate/crawler` is a Node.js framework for scalably querying
Ethereum's JSON-RPC endpoints and to slice out portions of the Ethereum
network's data for local usage.

To modularize the crawler's data sources, developers can implement custom
strategies or re-use existing ones to compose crawl paths. Conceptually, the
crawler implements the Extract, Transform and Load separation, to minimize
downtime, dependencies on external interfaces and to increase reproducability.

The entire project is licensed licensed under the GPL3, to make it truly owned
by the community instead of a single entity. Branded as the "Neume Network",
the Attestate Crawler codebase has successfully been used to download the
metadata of the music NFT ecosystem.

- **[Getting Started](https://attestate.com/crawler/main/getting-started.html)**
- Documentation: [attestate.com/crawler/main](https://attestate.com/crawler/main)
- License: [SPDX-License-Identifier: GPL-3.0-only](https://spdx.org/licenses/GPL-3.0-only.html)
