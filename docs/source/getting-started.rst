Getting Started
===============

Running an Ethereum full node
-----------------------------

To run the crawler effectively, you'll either have to:

* make an account with an Ethereum full node provider in the cloud
* run a full node yourself.

But to make this decision, please consider that crawling Ethereum through a
cloud provider is considerably slower than co-locating the crawler and the
Ethereum full node on one machine. Co-location is faster simply through mere
proximity of the processes and the lack of having to transport over a big
network that can produce latency and failures.

Internally, we've successfully executed the crawler over > 1TB data sets by
running it on the same machine as a fully-sync'ed Erigon Ethereum full node.
But for testing things and playing around, Infura or Alchemy are more than
sufficient!

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
  EXTRACTION_WORKER_CONCURRENCY=12
  IPFS_HTTPS_GATEWAY=https://
  ARWEAVE_HTTPS_GATEWAY=https://

For more details on the crawler's environment variable configuration, head over
to the :ref:`environment variable reference docs
<configuration-environment-variables>`.

Using the command line interface
--------------------------------

Alternatively, the crawler can be used on a UNIX-compatible command line
interface. You can find the ``crawler.mjs`` file in the root of the source code
directory.

.. code-block:: bash

  Usage: crawler.mjs <options>

  Options:
    --help     Show help                                                 [boolean]
    --version  Show version number                                       [boolean]
    --path     Sequence of strategies that the crawler will follow.     [required]
    --config   Configuration for CLI
