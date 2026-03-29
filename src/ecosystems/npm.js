import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** @type {import('./index.js').Ecosystem} */
export default {
  name: 'npm',
  manifestFile: 'package.json',

  async parseManifest(dir = process.cwd()) {
    const pkgPath = resolve(dir, 'package.json');
    const content = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    return Object.entries(deps).map(([name, version]) => ({
      name,
      version: cleanVersion(version),
      ecosystem: 'npm',
    }));
  },

  async fetchLatestVersion(name) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`);
    if (!response.ok) {
      throw new Error(`npm registry error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.version;
  },
};

function cleanVersion(version) {
  return version.replace(/^[\^~>=<\s]+/, '');
}
