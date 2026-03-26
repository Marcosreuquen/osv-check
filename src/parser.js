import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * Parse a "package@version" string.
 * Handles scoped packages like @scope/name@version.
 * @param {string} input
 * @returns {{name: string, version: string}}
 */
export function parsePackageArg(input) {
  const atIndex = input.lastIndexOf('@');
  if (atIndex <= 0) {
    throw new Error(
      `Invalid format: "${input}". Expected: package@version (e.g. lodash@4.17.15)`
    );
  }

  const name = input.slice(0, atIndex);
  const version = input.slice(atIndex + 1);

  if (!name || !version) {
    throw new Error(
      `Invalid format: "${input}". Expected: package@version (e.g. lodash@4.17.15)`
    );
  }

  return { name, version };
}

/**
 * Read package.json from given directory and extract all dependencies with versions.
 * @param {string} [dir=process.cwd()]
 * @returns {Promise<Array<{name: string, version: string}>>}
 */
export async function readPackageDeps(dir = process.cwd()) {
  const pkgPath = resolve(dir, 'package.json');
  let content;

  try {
    content = await readFile(pkgPath, 'utf-8');
  } catch {
    throw new Error(`Could not read ${pkgPath}. Are you in a Node.js project?`);
  }

  const pkg = JSON.parse(content);
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  return Object.entries(deps).map(([name, version]) => ({
    name,
    version: cleanVersion(version),
  }));
}

/**
 * Strip semver range characters to get a clean version for OSV queries.
 * @param {string} version
 * @returns {string}
 */
function cleanVersion(version) {
  return version.replace(/^[\^~>=<\s]+/, '');
}
