.. _extraction-worker:

Extraction Worker
=================

Overview
--------

The ``@attestate/extraction-worker`` is a sub-package of the attestate/crawler
(GitHub: https://github.com/attestate/extraction-worker/), designed for
executing extraction tasks using JSON objects. It supports multiple protocols,
including JSON-RPC, GraphQL, HTTPS, Arweave, IPFS, and exit messages.

To use the extraction worker, you can send HTTP messages with the required
parameters. Note that the "commissioner" property is specific to the crawler's
lifecycle and might not be necessary when using the "execute" function of the
worker. Below are examples for each supported protocol with a brief
description.

HTTPS
-----

Sends an HTTPS request to the specified URL.

.. code-block:: javascript

  {
    "type": "https",
    "version": "0.0.1",
    "options": {
      "url": "https://example.com",
      "method": "GET"
    }
  }

GraphQL
-------

Executes a GraphQL query on the specified endpoint.

.. code-block:: javascript

  {
    "type": "graphql",
    "version": "0.0.1",
    "options": {
      "url": "https://api.example.com/graphql",
      "body": "{\"query\":\"{ viewer { login }}\"}"
    }
  }

JSON-RPC
--------

Sends a JSON-RPC request to the specified URL.

.. code-block:: javascript

  {
    "type": "json-rpc",
    "version": "0.0.1",
    "options": {
      "url": "https://api.example.com/jsonrpc"
    },
    "method": "eth_getTransactionReceipt",
    "params": ["0x..."]
  }

IPFS
----

Retrieves data from the IPFS network using the specified URI and gateway.

.. code-block:: javascript

  {
    "type": "ipfs",
    "version": "0.0.1",
    "options": {
      "uri": "ipfs://...",
      "gateway": "https://ipfs.example.com"
    }
  }

Arweave
-------

Retrieves data from the Arweave network using the specified URI and gateway.

.. code-block:: javascript

  {
    "type": "arweave",
    "version": "0.0.1",
    "options": {
      "uri": "ar://...",
      "gateway": "https://arweave.example.com"
    }
  }

Exit
----

Signals the end of a task or sequence of tasks.

.. code-block:: javascript

  {
    "type": "exit",
    "version": "0.0.1"
  }
