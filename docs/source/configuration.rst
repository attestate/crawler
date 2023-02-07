Configuration
=============

Compared to other tools that may help you replicate Ethereum state locally,
Attestate's crawler comes with plenty of configuration options. This page's
purpose is to serve as a reference for all configurable options.

Overview
--------

There are two files which we are using to configure the crawler:

* a ``.env`` file defines all environmental variables. We've built the crawler
  such that only variables go into it that aren't supposed to be checked into
  version control, e.g. your Infura API key.
* a ``config.mjs`` file that contains a sharable set up of crawler instructions.

First, let's walk you throught the ``.env`` file.

..  _configuration-environment-variables:

Environment Variables
---------------------

``@attestate/crawler`` internally uses `dotenv
<https://www.npmjs.com/package/dotenv>`_ to automatically load environment
variables from a ``.env`` file in the project root into Node.js's
``process.env`` object. However, if necessary, environment variables that have
already been set in, e.g., the ``.env`` file can be overwritten by passing them
before an invoking command.

The following environment variables are **required** for ``@attestate/crawler``
to run:

* ``RPC_HTTP_HOST`` describes the host that Ethereum JSON-RPC extraction request are made against. It must be set to an URL to an Ethereum full node's JSON-RPC endpoint that starts with ``https://``. ``ws://`` or ``wss://`` prefixes are currently not supported. We support URLs that include the API's bearer token as is the case with, e.g., Infura or Alchemy.
*  ``RPC_API_KEY`` is the API key for the host extraction requests are made against. It must be set if an Ethereum full node was provisioned behind an HTTP proxy that requires a bearer token authorization via the HTTP ``Authorization`` header. In this case, the header is structurally set as follows: ``Authorization: Bearer ${RPC_API_KEY}``.
* ``DATA_DIR`` is the directory that stores all results from extraction and transformation of the crawler. It must be set to a file system path (relative or absolute).
* ``IPFS_HTTPS_GATEWAY`` describes the host that IPFS extraction requests are made against. A list of publicly accessible IPFS gateways can be found `here <https://ipfs.github.io/public-gateway-checker/>`_.
*  ``IPFS_HTTPS_GATEWAY_KEY`` is the API key for the IPFS host extraction requests are made against. It must be set if an IPFS node was provisioned behind an HTTP proxy that requires a bearer token authorization via the HTTP ``Authorization`` header. In this case, the header is structurally set as follows: ``Authorization: Bearer ${IPFS_HTTPS_GATEWAY_KEY}``.
* ``ARWEAVE_HTTPS_GATEWAY`` describes the host that Arweave extraction requests are made against. A commonly-used Arweave gateway is ``https://arweave.net``.

.. note::
   In some cases, you may only work with Ethereum, however, the crawler will
   complain if, e.g., ``IPFS_HTTPS_GATEWAY`` isn't defined. Also, some Ethereum
   full node providers will append the API key in the ``RPC_HTTP_HOST`` URI. In
   those cases it is sufficient to define those variables as an empty string:
   ``RPC_API_KEY=""``.

..  _configuration-crawl-path:

Configuration File
------------------

The configuration file is a ``.mjs`` that, using ESM's ``export default``,
exports a list of tasks to be run. It is normatively specified as a JSON schema
in the `code base
<https://github.com/attestate/crawler/blob/main/src/schemata/configuration.mjs>`_.

The ``@attestate/crawler`` repository always contains a pre-defined
``config.mjs`` file that you can copy.

Structurally, it is defined as follows:

.. code-block:: javascript

  export default {
    // First, there is the crawl path property, which we'll describe later in
    // this section.
    path: { 
      "...": "..."
    },
    queue: {
      options: {
        // The queue's concurrency controls how many requests are sent to
        // external resources concurrently.
        concurrent: 100
      },
    },
    // In case an external resource implements rate limiting, then the crawler
    // can be rate limited here to not pass any of these limits.
    endpoints: {
      ["https://ipfs.io]: {
        timeout: 10_000,
        requestsPerUnit: 25,
        unit: "second",
      },
    }
  };


Structurally, the path property looks as follows

.. code-block:: javascript

  const path = [
    {
      name: "Task #1",
      extractor: { /* ... */ },
      transformer: { /* ... */ },
      loader: { /* ... */ },
    }, 
    {
      name: "Task #2",
      "...": "..."
    }
  ]

The crawler implements an :ref:`Extract, Transform and Load
<extract-transform-load>` stage separation which is reflected in the names of a
task's phases. Attestate Crawler executes them sequentially in order: (1)
extraction, (2) transformation, (3) loading.

Below is a fully configured crawl path to fetch **all** Ethereum block logs
within a range of ``start=0`` block and ``end=1`` block (``extractor.args``).
The output of the requests are stored in ``extractor.output.path`` with the
pre-configured ``DATA_DIR`` environment variable.

.. code-block:: javascript

  const path = [
    {
      name: "call-block-logs",
      extractor: {
        module: {
          // NOTE: By convention, an extractior module must always implement an
          // init and an update function.
          init: (arg1, arg2, ...) => { /* ... */ },
          update: (message) => { /* ... */ },
        },
        // NOTE: The arguments are passed into the module's init function
        args: [0, 1],
        output: {
          // NOTE: An output path is defined to persist the extractor's
          // requests.
          path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
        },
      },
      "...": "..."
    },
  ];

Upon completing extraction, a transformation is scheduled to filter events by
the EIP-20/EIP-721 transfer signature. A transformer's module consists of a
single ``function onLine(line)`` that is invoked for each line of the
``transformer.input.path``. The input's path is set to the data we have
extracted in the extraction phase prioly.

.. code-block:: javascript

  /*
   * NOTE: After the extraction phase, we're filtering all events by topics.
   * We're generating the transfer event's signature using the keccak256 hash
   * function.
   *
   *  keccak256("Transfer(address,address,uint256)") == "0xddf...";
   */

  const topic0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const path = [
    {
      name: "call-block-logs",
      "...": "...",
      transformer: {
        module: {
          // NOTE: onLine gets invoked for each line in `input.path`.
          onLine: line => { /* ... */ },
        },
        args: [topic0],
        // NOTE: A transformer always requires an `input.path` and `output.path`
        // property to be present.
        input: {
          path: resolve(env.DATA_DIR, "call-block-logs-extraction"),
        },
        output: {
          path: resolve(env.DATA_DIR, "call-block-logs-transformation"),
        },
      },
      "...": "...",
    }
  ];

Upon completion of the transformation step, the loading phase is initiated. In
it the transformation's output is loaded into an output container. In the case
below, ``loader.handler`` stores each line from ``input.path`` in a database.

.. code-block:: javascript

  const path = [
    {
      name: "call-block-logs",
      loader: {
        handler: line => {
          // db.store(line) 
        },
        input: {
          path: resolve(env.DATA_DIR, "call-block-logs-transformer"),
        }
      }
    },
  ];

The full configuration can be found on `GitHub
<https://github.com/attestate/crawler/blob/main/config.mjs>`_.
