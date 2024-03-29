// @format
import { env } from "process";
import { resolve } from "path";
import { constants } from "fs";
import { access, mkdir } from "fs/promises";

export function inDataDir(name) {
  const path = resolve(env.DATA_DIR, name);
  return path;
}

export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

export function toCSV(list) {
  return list.map((entry) => Object.values(entry).join(",")).join("\n");
}

export function toJSON(list, expr) {
  return list.map((entry) => {
    const match = expr.exec(entry);
    return match.groups;
  });
}

export async function provisionDir(path) {
  try {
    await access(path, constants.R_OK);
  } catch (err) {
    await mkdir(path);
  }
}
