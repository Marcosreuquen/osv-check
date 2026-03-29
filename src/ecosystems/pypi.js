import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** @type {import('./index.js').Ecosystem} */
export default {
  name: 'PyPI',
  manifestFile: 'requirements.txt',

  async parseManifest(dir = process.cwd()) {
    const reqPath = resolve(dir, 'requirements.txt');
    const content = await readFile(reqPath, 'utf-8');

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('-'))
      .map(parseLine)
      .filter(Boolean);
  },

  async fetchLatestVersion(name) {
    return fetchLatestPypiVersion(name);
  },
};

/**
 * Parse a single requirements.txt line.
 * Supports: package==version, package>=version, package~=version, etc.
 * Only extracts an exact version from == pins.
 */
function parseLine(line) {
  // Strip inline comments and environment markers
  const cleaned = line.split('#')[0].split(';')[0].trim();
  if (!cleaned) return null;

  // Match: package==version (exact pin — most useful for vulnerability checks)
  const exactMatch = cleaned.match(/^([a-zA-Z0-9._-]+)\s*==\s*([^\s,]+)/);
  if (exactMatch) {
    return { name: normalize(exactMatch[1]), version: exactMatch[2], ecosystem: 'PyPI' };
  }

  // Match: package>=version (lower bound — best-effort check)
  const lowerBound = cleaned.match(/^([a-zA-Z0-9._-]+)\s*>=\s*([^\s,]+)/);
  if (lowerBound) {
    return { name: normalize(lowerBound[1]), version: lowerBound[2], ecosystem: 'PyPI' };
  }

  // Match: package~=version (compatible release)
  const compatible = cleaned.match(/^([a-zA-Z0-9._-]+)\s*~=\s*([^\s,]+)/);
  if (compatible) {
    return { name: normalize(compatible[1]), version: compatible[2], ecosystem: 'PyPI' };
  }

  // Package without version — skip (can't query OSV without a version)
  return null;
}

/** Normalize PyPI package name (PEP 503: lowercase, replace [-_.] with -) */
function normalize(name) {
  return name.toLowerCase().replace(/[-_.]+/g, '-');
}

/**
 * Fetch the latest version of a PyPI package.
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function fetchLatestPypiVersion(name) {
  const response = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
  if (!response.ok) {
    throw new Error(`PyPI registry error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.info.version;
}
