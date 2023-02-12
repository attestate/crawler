# Changelog

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
