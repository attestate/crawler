@attestate/crawler
==================

A JavaScript library for retrieving on-chain storage and generating data
derivatives.

* **Modular:** :ref:`Extract, Transform and Load <extract-transform-load>`
  stage separation makes composing simple components into complex workflows
  possible. Stages are reunnable to recover errors.
* **Embedded:** Unlike Graph Protocol, Attestate's Crawler does not have a
  separate server process. It writes directly to `LMDB
  <http://www.lmdb.tech/doc/>`_, an embedded database that can be read-from
  thread-safely at any time.
* **Batteries-included:** Support for Ethereum, IPFS, Arweave, GraphQL and
  rate-limit pooling for Infura and Alchemy.

Attestate's Crawler is created to build a web3 of peer to peer applications.

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
     - CSV, JSON, LMDB
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

Demotime!
---------

.. raw:: html

  <iframe width="560" height="315" src="https://www.youtube.com/embed/dLWVAEW8E1s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Features
--------
* Rerunnable crawls using :ref:`Extract, Transform and Load <extract-transform-load>` stage separation
* Fast: GB/s extraction from Ethereum (co-located Erigon)
* Thread-safe reads with LMDB
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
  :caption: Concepts

  use-cases
  extract-transform-load

.. toctree::
  :caption: Basics

  getting-started
  configuration

.. toctree::
  :caption: Specifications

  strategy-specification
