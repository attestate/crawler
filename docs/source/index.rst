@attestate/crawler
==================

A JavaScript library for retrieving on-chain storage and generating data
derivatives.

* **Modular:** `Extract, Transform and Load
  <https://en.wikipedia.org/wiki/Extract,_transform,_load>`_ stage separation
  makes composing simple components into complex workflows possible. Stages are
  reunnable to recover errors.
* **Embedded:** Unlike Graph Protocol, attestate's crawler does not have a
  separate server process. It can directly write to self-contained databases
  like LevelDB or sqlite.
* **Batteries-included:** Support for Ethereum, IPFS, Arweave, GraphQL and
  rate-limit pooling for Infura and Alchemy.

Attestate's crawler is created to build a web3 of peer to peer applications.

Comparison
----------

Compare Attestate's crawler with the Graph Protocol using the table below.

.. list-table::
   :widths: 25 25 50
   :header-rows: 1

   * - Trait
     - Attestate Crawler
     - Graph Protocol
   * - **Embeddable**
     - ✓ (Run as your app)
     - ✘ (Runs as a network)
   * - **Output Formats**
     - CSV, JSON, any database
     - GraphQL
   * - **Web2 support**
     - HTTP, JSON-RPC, GraphQL
     - Partial
   * - **Free**
     - ✓
     - ✘ (tokens required)
   * - **Complexity**
     - A few JS files
     - Big code base
   * - **Censorship-resistant**
     - ✓
     - `Partially <https://twitter.com/schmid_si/status/1568617843562008576>`_
   * - **Customizable**
     - ✓ (Compose & implement custom strategies)
     - ✓ (Query many subgraphs)
   * - **License**
     - GPL-3
     - Apache 2.0/MIT
   * - **Replicate data**
     - ✓
     - ✓
   * - **Derive data**
     - ✓
     - Multi-graph app

For a more in-depth discussion of uses cases, visit the :ref:`use cases <use-cases>` site.

Features
--------

* Rerunnable crawls using Extract, Transform and Load stage separation
* Fast: GB/s extraction from Ethereum (co-located Erigon)
* Database-agnostic: LevelDB, sqlite, PostgreSQL, etc.
* Rate-limiting support for Infura & Alchemy
* Efficient: Minimized network calls through separation of concerns
* No token launch, no miners, no fees: Just a community FOSS GPL3 project
* Support for Ethereum JSON-RPC, GraphQL, IPFS, Arweave
* Production-ready & unit-tested

.. warning::
  We're currently actively working on these documents. They're still far from complete!

Strategies
----------

* `attestate/crawler-call-block-logs <https://attestate.com/crawler-call-block-logs/main/index.html>`_

Table of Contents
-----------------

.. toctree::
  :caption: Information

  use-cases

.. toctree::
  :caption: Basics

  getting-started
  configuration

