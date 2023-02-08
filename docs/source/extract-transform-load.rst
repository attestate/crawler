Extract, Transform, Load
========================

..  _extract-transform-load:

Benefits of ETL Stage Separation
--------------------------------

The Attestate Crawler implements an "`Extract, Transform and Load
<https://en.wikipedia.org/wiki/Extract,_transform,_load>`_" stage separation to
improve work flow reliabilty. ETL is concept from data warehousing, typically
developed to implement separation on concerns for data extraction (e.g.,
network requests), transformation (cleaning, sanitizing) and loading the data
into an output container.

The crawler business logic is separated into three stages to ensure the
efficiency of a crawl. The benefits of this approach can be demonstrated by
naively implementing a crawler that lacks this separation. Consider the
following pseudo code for downloading Ethereum blocks:

.. code-block:: javascript

  function crawl() {
    // We first download all block headers from.
    const result = await fetch("https://ethereum-example-api.com/blocks")

    // In a second step, we collect all transactions from the first block
    const txs = filterTxs(result.blocks[0])

    // Finally, we store each transaction in a database
    txs.forEach(tx => db.store(tx))
  }

In this case, if ``function crawl()`` fails, the developer has to fix the error
and re-run the entire script, including downloading all block headers.

While for small extraction tasks, this isn't a problem, when we extract big
amounts of data, having to repeat all network requests is wasteful. A data
source could implement rate-limiting too, block the script entirely or respond
slowly, which would worsen our turn-around time.

So a problem with mixing extraction, transformation and loading logic is that
it slows down debugging. Instead of re-running the ``filterTxs`` function on a
crawl result, the developer has to wait for the network task to finish, to then
re-run ``filterTxs`` for debugging. This increases their feedback loop's
duration and slows down their software development cycle.

ETL in Attestate Crawler
------------------------

For the above reasons, the Attestate Crawler implements a three phase stage
separation of tasks using ETL. Each stage fulfils a specific purpose in
separating the crawl's concerns:

Extraction
__________

During the extraction phase, the crawler queries the network, e.g. the JSON-RPC
endpoint of an Ethereum node, and writes the incoming results to a flat file.

A convention in designing an extractor module is to avoid transforming any
results as this risks crashing the process. The stage's goal is complete and
persist as many network requests as possible.

Transformation
______________

After downloading the data source and writing the results to disk, during the
transformation phase, the data is formatted, cleaned and sanitized. 

The benefit or separating extraction and transformation is that running the
transformation after extraction is cheap as it happens on disk. In case a data
source's structure has changed, only having to adjust the transformation step
accelerates the developer's feedback loop without needing to make more network
requests.

If crashes must occur because of upstream changes to a data source (e.g., when
an API changes), we recommend having them happen during the transformation
phase, conceptually like a "predetermined breaking point."

Loading
_______

Once all data has been transformed and persisted to disk, it is then read from
the transformation output file and loaded into an instance of `LMDB
<http://www.lmdb.tech/doc/>`_.

Within the strategy, a user can define a range-accessible and
lexographically-ordered identifier, as well as one for direct access to a
value. Both identifiers will be stored by the crawler in the LMDB storage and
it is thread-safely accessible by any other process.

This means that the crawler process can run and write continuously to the
database while another part of the application is constantly able to safely
read the data too.

Implementing an ETL Strategy
----------------------------

The Attestate Crawler allows developers to implement custom strategies. The
crawler invokes standard functions of a strategy module. An exemplary strategy
is `@attestate/crawler-call-block-logs
<https://attestate.com/crawler-call-block-logs/main/index.html>`_.

.. warning::
  This section is incomplete and needs a better description.
