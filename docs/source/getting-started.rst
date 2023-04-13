.. _getting_started:

======================
Getting Started
======================

Attestate Crawler is a JavaScript library for retrieving on-chain storage and
generating data derivatives. It is designed for building a web3 of peer-to-peer
applications.

For a list of features, please visit the `Features section
<https://attestate.com/crawler/main/index.html#features>`_ on the Attestate
Crawler website.

Running an Ethereum full node
-----------------------------

To run the crawler effectively, you'll either have to:

* make an account with an Ethereum full node provider in the cloud
* run a full node yourself.

Please consider that crawling Ethereum through a cloud provider is considerably
slower than co-locating the crawler and the Ethereum full node on one machine.
Co-location is faster simply through mere proximity of the processes and the
lack of having to transport over a big network that can produce latency and
failures.

Internally, we've successfully executed the crawler over > 1TB data sets by
running it on the same machine as a fully-sync'ed Erigon Ethereum full node.
But for testing things and playing around, Infura or Alchemy are more than
sufficient!

Example: NameRegistered Event
=============================

To better understand Attestate Crawler's functionality, let's use the
`NameRegistered` event from the following Solidity contract as an example:

.. code-block:: solidity

  contract BaseRegistrar {
      event NameRegistered(string name, address owner);

      function registerName(string calldata name, address owner) external {
          // ...
          emit NameRegistered(name, owner);
      }
  }

Attestate Crawler has a package called `call-block-logs` that allows
downloading events. Learn more about this strategy at `call-block-logs
documentation
<https://attestate.com/crawler-call-block-logs/main/index.html>`_. Here's a
sample configuration file for the Attestate Crawler:

.. code-block:: javascript

  import * as blockLogs from "@attestate/crawler-call-block-logs";

  export default {
    path: [
      {
        name: "call-block-logs",
        coordinator: { /* ... */ },
        extractor: {
          module: blockLogs.extractor,
          args: {
            start: 9380410,
            address: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
            topics: [ /* ... */ ],
            blockspan: 1000,
          },
          output: { /* ... */ },
        },
        transformer: {
          module: blockLogs.transformer,
          args: {},
          input: { /* ... */ },
          output: { /* ... */ },
        },
        loader: { /* ... */ },
      },
    ],
    queue: { /* ... */ },
    endpoints: { /* ... */ },
  };

For the full configuration file, refer to package's `documentation
<https://attestate.com/crawler-call-block-logs/main/usage.html>`_.

The Attestate Crawler processes the `NameRegistered` event using the Extractor,
Transformer, and Loader modules. To learn more about ETL, visit the `Extract,
Transform, Load (ETL) guide
<https://attestate.com/crawler/main/extract-transform-load.html>`_. Once it
completes, the output (in the ``DATA_DIR``) could be in a format similar to the
following example

.. code-block:: json

  [
    {
      "blockNumber": "0x123457",
      "transactionIndex": "0x4",
      "transactionHash": "0xddccbbaa...",
      "...": "...",
    }
  ]


Installation
---------------------------

First, we're downloading the source code:

.. code-block:: bash

  # EITHER: Clone the repository if you want to use the CLI
  git clone git@github.com:attestate/crawler.git

  # OR: install the dependency via npm
  npm install @attestate/crawler

  # Copy the example .env file
  # ⚠️ Be sure to update the variables in `.env` with the appropriate values!
  cp .env-copy .env

  # Install the dependencies
  npm i

Before we can run the crawler, however, we'll have to make sure all mandatory
environment variables are set in the ``.env`` file.

Configuring environment variables
---------------------------------

The following environment variables are required:

.. code-block:: bash

  RPC_HTTP_HOST=https://
  DATA_DIR=data
  IPFS_HTTPS_GATEWAY=https://
  ARWEAVE_HTTPS_GATEWAY=https://

For more details on the crawler's environment variable configuration, head over
to the :ref:`environment variable reference docs
<configuration-environment-variables>`.

Using the command line interface
--------------------------------

The crawler can be used on a UNIX-compatible command line interface. You can
find the ``crawler.mjs`` file in the root of the source code directory. For
docs, see this page :ref:`Crawler Cli <crawler-cli>`.

Configuring Your First Crawl
----------------------------

To run a crawl, next up, :ref:`configure the crawl path
<configuration-crawl-path>`.

