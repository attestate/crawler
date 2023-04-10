// @format
import { execute } from "@attestate/extraction-worker";

import log from "./logger.mjs";

export async function retrieve(message) {
  const outcome = await execute(message);
  if (!outcome.results) {
    log(`Encountered error retrieving remote state: "${outcome.error}"`);
    throw new Error(outcome.error);
  }

  return parseInt(outcome.results, 16);
}
