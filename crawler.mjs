#!/usr/bin/env -S node --unhandled-rejections=throw

// Note: The -S flag for env is available for FreeBSD and coreutils >= 8.30
// It should work in macOS and newer linux versions
// https://www.gnu.org/software/coreutils/manual/html_node/env-invocation.html#g_t_002dS_002f_002d_002dsplit_002dstring-usage-in-scripts

import "dotenv/config";
import { resolve } from "path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { boot, getConfig } from "./src/boot.mjs";

const argv = yargs(hideBin(process.argv))
  .demandOption("path")
  .describe("config", "Configuration for CLI")
  .nargs("config", 1).argv;

(async () => {
  const config = await getConfig(argv.config);
  try {
    await boot(config);
  } catch (err) {
    console.error(err.toString());
  }
})();
