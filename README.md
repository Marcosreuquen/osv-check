# osv-check

CLI tool to check packages for known vulnerabilities using the [OSV.dev](https://osv.dev/) API.

Supports multiple ecosystems: **npm**, **PyPI**, and more coming soon.

Zero dependencies. Requires Node.js >= 22.

## Install

```bash
npm install -g osv-check
```

## Usage

### Check a specific package version

```bash
osv-check lodash@4.17.15
```

### Check the latest version of a package

```bash
osv-check lodash
```

Automatically resolves the latest version from the npm registry and checks it for vulnerabilities.

### List all known vulnerabilities across all versions

```bash
osv-check lodash --all
```

Shows every known vulnerability with affected version ranges.

### Check a PyPI package

```bash
osv-check requests@2.25.0 -e pypi
osv-check requests -e pypi          # latest version
osv-check requests -e pypi --all    # all versions
```

### Check all dependencies in your project

```bash
osv-check
```

This auto-detects manifest files (`package.json`, `requirements.txt`) in the current directory and checks all dependencies.

### Scoped packages (npm)

```bash
osv-check @angular/core@14.0.0
osv-check @angular/core              # latest version
```

### Options

| Flag | Description |
|------|-------------|
| `-e, --ecosystem <name>` | Ecosystem for single-package check (`npm`, `pypi`) |
| `-a, --all` | Show all vulnerabilities across all versions (requires package name without version) |
| `-h, --help` | Show help message |
| `-v, --version` | Show version |

## Supported ecosystems

| Ecosystem | Manifest file | Registry | Status |
|-----------|---------------|----------|--------|
| npm | `package.json` | registry.npmjs.org | ✅ |
| PyPI | `requirements.txt` | pypi.org | ✅ |

## Exit codes

- `0` — No vulnerabilities found
- `1` — Vulnerabilities found or error occurred

## Programmatic API

```js
import { queryPackage, queryMultiple } from 'osv-check';

// Check a specific version
const result = await queryPackage('lodash', '4.17.15');
console.log(result.vulns);

// Check without version (returns all vulnerabilities)
const allVulns = await queryPackage('lodash');
console.log(allVulns.vulns);

// PyPI package
const pyResult = await queryPackage('requests', '2.25.0', 'PyPI');
console.log(pyResult.vulns);
```

## Adding a new ecosystem

Create a new file in `src/ecosystems/` following this pattern:

```js
// src/ecosystems/my-ecosystem.js
export default {
  name: 'MyEcosystem',        // Must match OSV API ecosystem name
  manifestFile: 'manifest.lock',
  async parseManifest(dir) {
    // Read and parse the manifest file
    // Return: [{ name, version, ecosystem: 'MyEcosystem' }]
  },
  async fetchLatestVersion(name) {
    // Fetch latest version from the ecosystem registry
    // Return: '1.2.3'
  },
};
```

Then register it in `src/ecosystems/index.js`.

## License

MIT
