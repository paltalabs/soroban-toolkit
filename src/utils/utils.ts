import { readFileSync } from "fs";
import path from "path";

export function resolvePath(relativePath: string): Buffer {
  const absolutePath = path.resolve(relativePath);
  return readFileSync(absolutePath);
}

/**
 * Resolve and load a file as a Buffer.
 * @param filePath - Relative file path to resolve.
 * @returns Buffer containing the file contents.
 */
export function resolveInternalPath(filePath: string): Buffer {
  return readFileSync(path.resolve(__dirname, filePath));
}