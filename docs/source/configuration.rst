Configuration
=============

Compared to other tools that may help you replicate Ethereum state locally,
Attestate's Crawler comes with plenty of configuration options. This page's
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

``@attestate/crawler`` guarantees any downstream plugin or strategy the
presence and validity of environment variables. To avoid having to define
``.env`` files in applications that programmatically embed the crawler,
environment variables can be set in the config file and they'll be made
available through ``process.env``.

The environment variables with an asterisk \* are **required** for
``@attestate/crawler`` to run:

* ``RPC_HTTP_HOST``\* describes the host that Ethereum JSON-RPC extraction request are made against. It must be set to an URL to an Ethereum full node's JSON-RPC endpoint that starts with ``https://``. ``ws://`` or ``wss://`` prefixes are currently not supported. We support URLs that include the API's bearer token as is the case with, e.g., Infura or Alchemy.
* ``RPC_API_KEY`` is the API key for the host extraction requests are made against. It must be set if an Ethereum full node was provisioned behind an HTTP proxy that requires a bearer token authorization via the HTTP ``Authorization`` header. In this case, the header is structurally set as follows: ``Authorization: Bearer ${RPC_API_KEY}``.
* ``DATA_DIR``\* is the directory that stores all results from extraction and transformation of the crawler. It must be set to a file system path (relative or absolute).
* ``IPFS_HTTPS_GATEWAY``\* describes the host that IPFS extraction requests are made against. A list of publicly accessible IPFS gateways can be found `here <https://ipfs.github.io/public-gateway-checker/>`_.
* ``IPFS_HTTPS_GATEWAY_KEY`` is the API key for the IPFS host extraction requests are made against. It must be set if an IPFS node was provisioned behind an HTTP proxy that requires a bearer token authorization via the HTTP ``Authorization`` header. In this case, the header is structurally set as follows: ``Authorization: Bearer ${IPFS_HTTPS_GATEWAY_KEY}``.
* ``ARWEAVE_HTTPS_GATEWAY``\* describes the host that Arweave extraction requests are made against. A commonly-used Arweave gateway is ``https://arweave.net``.

.. note::
   In some cases, you may only work with Ethereum, however, the crawler will
   complain if, e.g., ``IPFS_HTTPS_GATEWAY`` isn't defined. Also, some Ethereum
   full node providers will append the API key in the ``RPC_HTTP_HOST`` URI. In
   those cases it is sufficient to define those variables as an empty string:
   ``RPC_API_KEY=""``.

Overwriting environment variables in the configuration
------------------------------------------------------

To use the crawler in downstream applications in JavaScript, we want to avoid
leaking the requirement of ``dotenv``, which requires a ``.env`` file to be
present in the application folder.

Hence, applications don't need to define the environmental variables in a
``.env`` file, they can pass those into the ``function boot(config)`` in
``config.environment``. However, those variables' names will then be mapped to
camel case such that ``RPC_HTTP_HOST`` becomes ``rpcHttpHost``.

Defining ``config.environment.rpcHttpHost`` will take presedence over
``RPC_HTTP_HOST``.

.. note::
   For all downstream applications, like strategies, the environment variables
   will always be defined, independently of whether the developer choses to
   write them in the ``config.mjs`` or ``.env`` file.


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
    // All environment variables can be alternatively defined as properties in
    // the configuration file. However, they're using camel-case format here, such
    // that "RPC_HTTP_HOST" becomes "rpcHttpHost".
    environment: {
      "rpcHttpHost": "https://example.com",
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
      ["https://ipfs.io"]: {
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

Below is a fully configured crawl path to fetch **all** Ethereum block logs and
the arguments declared as an object ``{start: 0, end: 1}``. The output of the
requests are stored in ``extractor.output.name`` with the pre-configured
``DATA_DIR`` environment variable.

.. code-block:: javascript

  const path = [
    {
      name: "call-block-logs",
      extractor: {
        module: {
          // NOTE: An extractor is an ESM module that exports a function init({
          // args, state, execute }) and a function update({ message }).
          // init: ({ args, state, execute }) => { /* ... */ },
          update: ({ message }) => { /* ... */ },
        },
        // NOTE: The arguments are passed into the module's init function
        args: {start: 0, end: 1},
        output: {
          name: "call-block-logs-extraction",
        },
      },
      "...": "..."
    },
  ];

Upon completing extraction, a transformation is scheduled to filter events by
the EIP-20/EIP-721 transfer signature. A transformer's module consists of a
single ``function onLine({ state })`` that is invoked for each line of the
``transformer.input.name``. 

.. code-block:: javascript

  const path = [
    {
      name: "call-block-logs",
      "...": "...",
      transformer: {
        module: {
          // NOTE: onLine gets invoked for each line in `input.name`.
          onLine: ({ state }) => { /* console.log(state.line) */ },
        },
        args: {
          topics: [
            /*
             * NOTE: After the extraction phase, we're filtering all events by topics.
             * We're generating the transfer event's signature using the keccak256 hash
             * function.
             *
             *  keccak256("Transfer(address,address,uint256)") == "0xddf...";
             */
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
          ]
        },
        // NOTE: A transformer always requires an `input.name` and
        // `output.name` // property to be present.
        input: {
          name: "call-block-logs-extraction",
        },
        output: {
          name: "call-block-logs-transformation",
        },
      },
      "...": "...",
    }
  ];

Upon completion of the transformation step, the loading phase is initiated. In
it the transformation's output is loaded into `LMDB
<http://www.lmdb.tech/doc/>`_. For that, a strategy must implement a
``loader.module.direct`` and ``loader.module.order`` `generator function
<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*>`_.
These functions must allocate a key-value relationship between each of the data
points:

* ``direct()``'s yielded ``key`` must be globally unique (like a primary key).
* ``order()``'s yielded ``key`` must be unique and totally, lexographically
  orderable.

.. code-block:: javascript

  const path = [
    {
      name: "call-block-logs",
      loader: {
        module: {
          direct: function* ({ state }) {
            const log = JSON.parse(state.line);
            // NOTE: To access a transaction directly by its identifier, in
            // `direct` we select ``transactionHash`` as the key for the entire
            // `log`.
            yield {
              key: log.transactionHash,
              value: log
            }
          },
          order: function* ({ state }) {
            const log = JSON.parse(state.line);
            // NOTE: For LMDB to be able to order the keys properly it is
            // important that they're correctly encoded and padded. To see how
            // this may be implemented, check out the key encoding logic at
            // https://github.com/attestate/crawler-call-block-logs/blob/main/src/loader.mjs
            // yield...
          },
        },
        input: {
          name: "call-block-logs-transformer",
        },
        output: {
          name: "call-block-logs-loader",
        }
      }
    },
  ];

And that's all! A full configuration of the Attestate crawler can be found on
`GitHub <https://github.com/attestate/crawler/blob/main/config.mjs>`_.
