#!/usr/bin/env -S node --unhandled-rejections=throw

// Note: The -S flag for env is available for FreeBSD and coreutils >= 8.30
// It should work in macOS and newer linux versions
// https://www.gnu.org/software/coreutils/manual/html_node/env-invocation.html#g_t_002dS_002f_002d_002dsplit_002dstring-usage-in-scripts

import "dotenv/config";
import { resolve } from "path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { open } from "LMDB";

import { boot, getConfig } from "./src/boot.mjs";
import { SEPARATOR, all } from "./src/database.mjs";

const argv = yargs(hideBin(process.argv))
  .command(
    "run [path]",
    "Run a crawl given a path",
    (yargs) => {
      return yargs.positional("path", {
        describe: "Path to a file that configures the crawler.",
      });
    },
    async (argv) => {
      const config = await getConfig(argv.path);
      try {
        await boot(config);
      } catch (err) {
        console.error(err.toString());
      }
    }
  )
  .command(
    "range [path] [table] [key]",
    "Query an LMDB key range in a table",
    (yargs) => {
      return yargs
        .positional("path", {
          describe: "The path to the LMDB database",
        })
        .positional("table", {
          describe: "An table within the database",
        })
        .positional("key", {
          describe: "A range key (string) or colon-separated for tie-breaking",
        });
    },
    async (argv) => {
      const db = new open(resolve(argv.path));
      const subdb = db.openDB(argv.table);
      const key = argv.key ? argv.key.split(SEPARATOR) : "";
      const results = await all(subdb, key);
      results.forEach((elem) => console.log(elem));
    }
  )
  .parse();
