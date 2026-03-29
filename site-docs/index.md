# osv-check

CLI tool to check packages for known vulnerabilities using the [OSV.dev](https://osv.dev/) API.

Supports multiple ecosystems: **npm**, **PyPI**, and more coming soon.

## The Problem

Running `npm audit` only checks your installed dependency tree. If you want to quickly check whether a specific package version has known vulnerabilities — before installing it, or from a CI pipeline — you need a lightweight tool that talks directly to a vulnerability database.

## The Solution

`osv-check` queries the [OSV.dev API](https://osv.dev/) to check any package for known vulnerabilities. Zero dependencies, works with Node.js >= 22.

## Key Features

- **Single package check** — `osv-check lodash@4.17.15`
- **Latest version check** — `osv-check lodash` resolves and checks the latest version
- **All vulnerabilities** — `osv-check lodash --all` lists every known vulnerability with affected ranges
- **Multi-ecosystem** — supports npm and PyPI, with `--ecosystem` flag
- **Bulk scan** — run `osv-check` in a project to scan all dependencies from `package.json` and `requirements.txt`
- **Scoped packages** — `osv-check @angular/core`
- **Programmatic API** — import `queryPackage` and `queryMultiple` for use in scripts
- **Zero dependencies** — uses only Node.js built-in modules
- **Severity detection** — extracts severity from CVSS vectors and OSV metadata
- **Colored output** — clear, severity-colored terminal reports

## Quick Start

```bash
npm install -g osv-check
osv-check lodash           # check latest version
osv-check lodash --all     # see all known vulnerabilities
osv-check lodash@4.17.15   # check a specific version
```

See the [Installation guide](getting-started/installation.md) for more options.
