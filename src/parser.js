import { detectAndParse, getEcosystem, inferEcosystem } from './ecosystems/index.js';

/**
 * Parse a "package@version" or "package" string.
 * Handles scoped packages like @scope/name@version.
 * When version is omitted, queries all versions.
 * @param {string} input
 * @param {string} [ecosystem] - Ecosystem name (defaults to auto-infer)
 * @returns {{name: string, version: string | undefined, ecosystem: string}}
 */
export function parsePackageArg(input, ecosystem) {
  const atIndex = input.lastIndexOf('@');

  let name, version;

  if (atIndex <= 0) {
    // No '@' found, or only a leading '@' (scoped package without version)
    name = input;
    version = undefined;
  } else {
    name = input.slice(0, atIndex);
    version = input.slice(atIndex + 1);

    if (!version) {
      throw new Error(
        `Invalid format: "${input}". Expected: package@version (e.g. lodash@4.17.15) or just the package name`
      );
    }
  }

  if (!name || (name.startsWith('@') && !name.includes('/'))) {
    throw new Error(
      `Invalid format: "${input}". Expected: package@version (e.g. lodash@4.17.15) or just the package name`
    );
  }

  const resolved = ecosystem || inferEcosystem();
  const eco = getEcosystem(resolved);
  if (!eco) {
    throw new Error(`Unknown ecosystem: "${resolved}". Supported: npm, pypi`);
  }

  return { name, version, ecosystem: eco.name };
}

/**
 * Detect manifest files in the project directory and read all dependencies.
 * @param {string} [dir=process.cwd()]
 * @returns {Promise<Array<{name: string, version: string, ecosystem: string}>>}
 */
export async function readProjectDeps(dir = process.cwd()) {
  const packages = await detectAndParse(dir);

  if (packages.length === 0) {
    throw new Error(
      'No dependencies found. Make sure you have a package.json, requirements.txt, or other supported manifest file.'
    );
  }

  return packages;
}
