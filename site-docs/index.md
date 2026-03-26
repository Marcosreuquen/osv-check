# osv-check

CLI tool to check npm packages for known vulnerabilities using the [OSV.dev](https://osv.dev/) API.

## The Problem

Running `npm audit` only checks your installed dependency tree. If you want to quickly check whether a specific package version has known vulnerabilities — before installing it, or from a CI pipeline — you need a lightweight tool that talks directly to a vulnerability database.

## The Solution

`osv-check` queries the [OSV.dev API](https://osv.dev/) to check any npm package for known vulnerabilities. Zero dependencies, works with Node.js >= 18.

## Key Features

- **Single package check** — `osv-check lodash@4.17.15`
- **Bulk scan** — run `osv-check` in a project to scan all dependencies from `package.json`
- **Scoped packages** — `osv-check @angular/core@14.0.0`
- **Programmatic API** — import `queryPackage` and `queryMultiple` for use in scripts
- **Zero dependencies** — uses only Node.js built-in modules
- **Severity detection** — extracts severity from CVSS vectors and OSV metadata
- **Colored output** — clear, severity-colored terminal reports

## Quick Start

```bash
npm install -g osv-check
osv-check lodash@4.17.15
```

See the [Installation guide](getting-started/installation.md) for more options.
