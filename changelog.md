# Changelog

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
