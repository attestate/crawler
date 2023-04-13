.. _crawler-cli:

Crawler CLI
===========

The crawler command line interface (CLI) provides two primary commands for
interacting with the web crawler:

1. `run`: Executes a crawl using a specified configuration file.
2. `range`: Queries an LMDB key range in a specified table.

Commands
--------

run [path]
~~~~~~~~~~

Execute a crawl using the specified configuration file.

Usage:
  run [path]

Arguments:
  path - Path to a file that configures the crawler.

Example:
  crawler run my_config.json

range [path] [table] [key]
~~~~~~~~~~~~~~~~~~~~~~~~~~

Query an LMDB key range in a specified table.

Usage:
  range [path] [table] [key]

Arguments:
  path - The path to the LMDB database.
  table - A table within the database.
  key - A range key (string) or colon-separated for tie-breaking.

Example:
  crawler range /path/to/database myTable myKey:tieBreaker

