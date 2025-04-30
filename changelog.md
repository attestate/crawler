# Changelog

## 0.6.3

- Fix potential memory leak by ensuring the worker message listener is properly removed after crawler tasks complete. This improves stability when running the crawler programmatically multiple times within the same process.

## 0.6.2

- Add `end` parameter as a new stage to crawl path. It calls an async function
  that can be used to clean up after crawling or trigger some processes needed
  to refresh data in the application.

## 0.6.1

- Update extraction-worker and eth-fun to new minor versions which allow
  getting a transaction by hash.

## 0.6.0

- `config.environment` (including overwritten environment variables) is now
  passed into `extractor.{init|update}`. We stop recommend using `process.env`
  in strategies.
- For `coordinator.remote` the input is now an object `remote({environment, execute})`. Here, we also stop recommend using `process.env` directly.
- Previously, although stated in the docs, defining a value in
  `config.environment` did NOT take presedence over its `process.env`
  counter-part. It does now.
- Priorly, only the first path element in the configuration file could define a
  "coordinator". We now allow all path elements to define coordinators. They're
  executed in parallel. However, coordinators are still not documented...

## 0.5.3

- Add flag `path[0].coordinator.archive: Boolean` that allows to delete
  extraction and transformation files after a single coordinator run.
- Fix a crash that occurred in coordinator when transformation or extraction
  files were not present (e.g. when there weren't any crawl results).

## 0.5.2

- @attestate/kiwistand was crashing on a small Digital Ocean instance because
  all MDB readers were used
  [[issue](https://github.com/attestate/kiwistand/issues/34)]. We demonstrated
  that it can be fixed by increasing lmdb's `maxReaders` to 500. Hence, we have
  added a parameter to `database.open(path, maxReaders)`.

## 0.5.1

- `function lifecycle.load()` now exits gracefully when prior transform job has
  no processable outputs.

## 0.5.0

- (breaking) `config.path[]` for transformer, extractor and loader, the
  properties `output.path` and `input.path` were renamed to `output.name` and
  doesn't have to be a path anymore. Instead, they are file names that are
  automatically resolved from within `env.DATA_DIR`.
- (breaking) `process.env` variables defined in the `.env` file can now also be
  defined (and overwritten) in the `config.mjs` file's `environment` property.
- (breaking) All lifecycle methods now have an updated interface as outlined
  below:
  - extractor `function init({ state, args, execute })`
  - extractor `function update({ message })`
  - tranformer `function onLine({ state })` where `state.line` is the line
    function. `args` can be matched too.
  - loader `function* order({ state })` where `state.line` is the line
  - loader `function* direct({ state })` where `state.line` is the line
- There is a new component to a strategy called the "coordinator" that keeps
  track of state. The config.mjs file (the `path` property) features a new
  field called `coordinator` where a `module` and an `interval` can be defined.
  They're used to re-run the first path once all jobs have been completed, to
  e.g. keep in synchronization with a network like Ethereum.
- We forked the extraction-worker from the neume-network organization and added
  a feature to immediately execute a worker message. More details:
  https://github.com/attestate/extraction-worker/.
- Reference docs for the extraction worker have been added.
- Reference docs for the crawler CLI have been added.
- Note: The `@attestate/crawler-call-block-logs` module at version 0.3.0 is
  compatible.

## 0.4.0

- (breaking) Create two separate LMDB tables for "order" and "load" data
- Add `crawler.mjs range` command
- Add Strategy Specification sphinx page

## 0.3.0

- (breaking) Change `loader.handler` to two generator functions `order` and
  `direct` as a property called `module` (consistent with extractor and
  transformer)
- (breaking) `configuration.output.path` object is now required
- (breaking) `configuration.loader.module` object is now required
- Integrate with LMDB to persist loader data

## 0.2.0

- (breaking) Merge crawl path and configuration file into configuration file
- (breaking) Move `EXTRACTION_WORKER_CONCURRENCY` into configuration file

## 0.1.0

[skipped by accident]

## 0.0.1

- Initial release
