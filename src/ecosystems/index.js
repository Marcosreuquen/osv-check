import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import npm from './npm.js';
import pypi from './pypi.js';

/**
 * @typedef {{
 *   name: string;
 *   manifestFile: string;
 *   parseManifest: (dir?: string) => Promise<Array<{name: string, version: string, ecosystem: string}>>;
 *   fetchLatestVersion?: (name: string) => Promise<string>;
 * }} Ecosystem
 */

/** All registered ecosystems — add new ones here. */
const ecosystems = [npm, pypi];

/** Map of ecosystem name (lowercase) to ecosystem object. */
const byName = Object.fromEntries(ecosystems.map((e) => [e.name.toLowerCase(), e]));

/**
 * Resolve an ecosystem by name (case-insensitive).
 * @param {string} name
 * @returns {Ecosystem | undefined}
 */
export function getEcosystem(name) {
  return byName[name.toLowerCase()];
}

/**
 * Detect which manifest files exist in a directory and parse all of them.
 * @param {string} [dir=process.cwd()]
 * @returns {Promise<Array<{name: string, version: string, ecosystem: string}>>}
 */
export async function detectAndParse(dir = process.cwd()) {
  const results = [];

  for (const eco of ecosystems) {
    const manifestPath = resolve(dir, eco.manifestFile);
    try {
      await access(manifestPath);
      const packages = await eco.parseManifest(dir);
      results.push(...packages);
    } catch {
      // Manifest not found — skip this ecosystem
    }
  }

  return results;
}

/**
 * Infer ecosystem from a package@version string.
 * Returns 'npm' by default; users can override with --ecosystem.
 */
export function inferEcosystem() {
  return 'npm';
}

/**
 * Fetch the latest version of a package from its ecosystem registry.
 * @param {string} name - Package name
 * @param {string} ecosystemName - Ecosystem name (e.g. 'npm', 'PyPI')
 * @returns {Promise<string>}
 */
export async function fetchLatestVersion(name, ecosystemName) {
  const eco = getEcosystem(ecosystemName);
  if (!eco?.fetchLatestVersion) {
    throw new Error(`Latest version lookup is not supported for ecosystem "${ecosystemName}"`);
  }
  return eco.fetchLatestVersion(name);
}

export { ecosystems };
