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

Attestate Crawler business logic for strategies is separated into these three
stages to ensure the efficiency of a crawl. The benefits of this approach can
be demonstrated with a naively implemented crawler that lacks this separation.

Consider the following pseudo code for downloading Ethereum blocks:

.. code-block:: javascript

  // We first download all block headers from.
  const result = await fetch("https://ethereum-example-api.com/blocks")

  // In a second step, we collect all transactions from the first block
  const txs = filterTxs(result.blocks[0])

  // Finally, we store each transaction in a database
  txs.forEach(tx => db.store(tx))

Now, let's consider an un-happy path for this script, e.g., that ``function
filterTxs`` errors. In this case, the developer has to fix the function's
implementation and re-run the script. While for small extraction tasks, this
isn't a problem, when we extract big amounts of data from a source, having to
repeat all network related tasks is wasteful. A data source could implement
rate-limiting, block the script entirely or respond slowly.

An additional problem with mixing extraction, transformation and loading logic
is that it makes debugging slow. Instead of re-running the ``filterTxs``
function on a crawl result, the developer has to now wait for the network task
to finish. This increases their feedback loop's duration and makes software
development miserable.

ETL in Attestate Crawler
------------------------

For the above reasons, the Attestate Crawler implements a three phase stage
separation of tasks using ETL. Each stage fulfils a specific purpose in
separating the crawl's concerns:

Extraction
__________

During the extraction phase, the crawler queries the network, e.g. the JSON-RPC
endpoint of an Ethereum node, and writes incoming results directly to a flat
file on disk. 

A convention in designing an extractor module is to avoid transforming any
results, as this risks crashing the process. The stage's goal is complete and
persist as many network requests as possible.

Transformation
______________

After downloading the data source and writing the results to disk, during the
transformation phase, the data is formatted, cleaned and sanitized. The benefit
or separating extraction and transformation is that running the transformation
afterwards is cheap (it happens on disk). In case a data source's structure has
changed, only having to adjust the transformation step accelerates the
developer's feedback loop without needing to make more network requests.

If crashes must occur because of upstream changes to the data source, it's best
they happen in the transformation phase.

Loading
_______

Finally, once all data has been transformed and persisted to disk again, it is
read from the transformation output file and loaded into an output container
(e.g., a database).

Implementing an ETL Strategy
----------------------------

The Attestate Crawler allows developers to implement custom strategies. The
crawler invokes standard functions of a strategy module. An exemplary strategy
is `@attestate/crawler-call-block-logs
<https://attestate.com/crawler-call-block-logs/main/index.html>`_.

.. warning::
  This section is incomplete and needs a better description.
