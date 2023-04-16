.. _javascript-usage:

JavaScript Usage
===================

This module provides the main functionality for @attestate/crawler. Below is a
reference-style documentation for the exported functions along with usage
examples.

**validateConfig(config)**
  - Accepts a configuration object "config".
  - Validates the provided configuration against the schema.
  - Throws an error if the configuration is invalid.

  Usage Example:

  .. code-block:: javascript

    import { validateConfig } from '@attestate/crawler';

    const config = {
      // Your configuration object
    };

    try {
      validateConfig(config);
      console.log('Configuration is valid.');
    } catch (error) {
      console.error('Configuration is invalid:', error);
    }

**boot(config)**
  - Accepts a configuration object "config".
  - Validates, sets the environment, and initializes a worker for the provided
    configuration.
  - Returns the result of the initialization.

  Usage Example:

  .. code-block:: javascript

    import { boot } from '@attestate/crawler';

    const config = {
      // Your configuration object
    };

    const result = await boot(config);
    console.log('Boot result:', result);

**order(name)**
  - Accepts a string "name".
  - Returns a string with the "name" and "MARKER_ORDER" separated by
    "SEPARATOR".
  - This string is used as a subtable name for LMDB and can be inputted into
    db.openDB.

  Usage Example:

  .. code-block:: javascript

    import { order } from '@attestate/crawler';

    const dbName = 'exampleDB';
    const orderName = order(dbName);
    console.log('Order subtable name:', orderName);

**direct(name)**
  - Accepts a string "name".
  - Returns a string with the "name" and "MARKER_DIRECT" separated by
    "SEPARATOR".
  - This string is used as a subtable name for LMDB and can be inputted into
    db.openDB.

  Usage Example:

  .. code-block:: javascript

    import { direct } from '@attestate/crawler';

    const dbName = 'exampleDB';
    const directName = direct(dbName);
    console.log('Direct subtable name:', directName);

**open(path)**
  - Accepts a string "path".
  - Opens an LMDB database at the specified path.
  - Returns the opened database instance.

  Usage Example:

  .. code-block:: javascript

    import { open } from '@attestate/crawler';

    const dbPath = 'path/to/your/database';
    const db = open(dbPath);
    console.log('Opened database:', db);

**all(db, key)**
  - Accepts a database instance "db" and a key.
  - Retrieves all values associated with the key in the database.
  - Returns an array of values.

  Usage Example:

  .. code-block:: javascript

    import { open, all } from '@attestate/crawler';

    const dbPath = 'path/to/your/database';
    const db = open(dbPath);
    const key = 'exampleKey';

    const values = await all(db, key);
    console.log('All values:', values);
