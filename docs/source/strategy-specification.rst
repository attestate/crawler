Strategy Specification
======================

``@attestate/crawler`` defines a strategy interface that integrators can use
to custom-build strategies.


.. note::
  If you're interested in implementing a custom strategy, consider checking out the source of `github.com/attestate/crawler-call-block-logs <https://github.com/attestate/crawler-call-block-logs>`_, a reference implementation of a strategy we try to keep continuously updated.

Extractor
---------

* An extractor strategy's purpose is to communicate with the `extraction worker
  <https://github.com/attestate/extraction-worker>`_ by passing canonical
  messages back and forth. The worker implements support for a variety of data
  sources including IPFS, Arweave, GraphQL and JSON-RPC. 
* All worker messages are defined using JSON schema. To look-up a message's
  structure, visit this special folder in the crawler's `code base
  <https://github.com/attestate/crawler/tree/main/src/schemata/messages>`_.
* An extractor is an ESM module that exports a ``function init({ args, state, execute, environment })`` and a ``function update({ message })``. Both must
  return an object that complies to the below outlined "Lifecycle Return
  Message."
* For every invocation of an extractor strategy, ``function init({ args, state, execute, environment })`` is called once upon initiation.
* Subsequently, for every resolved message within ``messages: [...]``,
  ``function update({ message, state, args, execute, environment })`` is called.
* A strategy completes when either no new messages are in the worker's queue or
  when an explicit ``type: "exit"`` `message
  <https://github.com/attestate/crawler/blob/main/src/schemata/messages/exit.mjs>`_
  is sent to a worker.
* ``config.path[].extractor.args`` is an object of values that the crawler
  passes into an extractor's ``function init({ args, state, execute, environment })``.

**Lifecycle Return Message**:

Return values of ``function init({ args, state, execute, environment })`` and
``function update({ args, message, state, execute, environment })`` must be a
type of object that contain a ``messages: Array`` property and a ``write:
String || null``. ``write``'s value is written directly into a flat file at
``config.path[].extractor.output.name`` (line by line). All elements in
``messages`` are forwarded to the `extraction worker
<https://github.com/attestate/extraction-worker>`_. They are returned to
``function update({ args, message, state, execute, environment })`` upon
completion.

An example:

.. code-block:: javascript

  function init({ args, state, execute, environment }) {
    return {
      // NOTE: We write hello world to a new line at `output.name`.
      write: "hello world",
      // NOTE: We also fire a request to our Ethereum full node asking to
      //  download the event logs from block 0 to block 1 for the DAI stablecoin
      //  contract.
      messages: [
        {
          type: "json-rpc",
          method: "eth_getLogs",
          params: [
            {
              fromBlock: 0,
              toBlock: 1,
              address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
              topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
            },
          ],
          version: "0.0.1",
          options: {
            url: environment.rpcHttpHost
          
        }
      ]
    };
  }

Transformer
-----------

* A transformer's purpose is to sanitize, rearrange, and filter data on the
  user's file system after an extraction. The ``@attestate/crawler`` reads the
  ``config.path[].input.name`` line-by-line and invokes the ``function
  onLine({ state })``.
* A transformer ESM module exports a ``function onLine({ state, args })`` that
  must return an object containing a property ``write: String``. It doesn't
  trigger new extraction worker messages.
* ``config.path[].transformer.args`` is an object of values that the crawler
  passes into a transformer's ``function onLine({ state, args })``. The line
  can be accessed through ``state.line``.

.. note::

  Consider that running a transformer on extraction results is much cheaper
  than re-extracting data from external sources. So when building a new
  strategy, instead of making the extractor fail when an API has changed,
  ensure that the transformer fails as it's cheap to re-run.

Loader
------

* A loader's purpose is to store and arrange crawler results in an efficiently
  queryable data storage format.
* Attestate Crawler implements LMDB to enable direct storage access and
  creation of indices. To ensure proper sorting with LMDB, key values need to
  be formatted consistently by removing the "0x" prefix, serializing, and
  padding them.
* A loader ESM module exports two generator functions ``function* direct({
  state, args })`` and ``function* order({ state, args })``.
* ``function* order({ state, args })`` must ``yield`` an object ``{ key: any,
  value: any }`` where ``key`` is chosen and arranged such that it can be
  lexographically ordered (e.g., an Ethereum transaction's ``blockNumber`` and
  ``transactionIndex``). The key values should be serialized and padded as
  needed. The line can be accessed through ``state.line``.
* ``function* direct({ state, args })`` must ``yield`` an object ``{ key: any,
  value: any }`` where ``key`` must be unique in the entire set (e.g., an
  Ethereum transactions ``transactionHash``). The line can be accessed through
  ``state.line``.
* ``key`` and ``value`` must comply with the guidelines of the `LMDB
  documentation <https://www.npmjs.com/package/lmdb>`_.

Internally, the Attestate Crawler will create a new LMDB instance at
``config.path[].loader.output.name``. For each strategy, it'll create "order"
and "direct" tables from the following naming scheme

* for order ``{config.path[].strategy.name}:order`` and
* for direct ``{config.path[].strategy.name}:direct``. 

The yielded values for ``function* order()`` and ``function* direct()``
(``key`` and ``value``) will be stored in these database sub-tables
accordingly.

Coordinator
-----------

To be documented. For usage see the attestate Kiwistand client.
