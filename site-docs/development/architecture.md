# Architecture

## Overview

osv-check is a zero-dependency Node.js CLI tool with a simple layered architecture.

```
┌─────────────────────────────────────────┐
│          bin/osv-check.js               │
│  CLI entrypoint: arg parsing, dispatch  │
├─────────────────────────────────────────┤
│            Core Modules                 │
│                                         │
│  api.js      → OSV API client           │
│  parser.js   → Package arg & pkg.json   │
│  reporter.js → Terminal output          │
└─────────────────────────────────────────┘
```

## Execution Flow

### Single package mode

1. **Parse argument** — extract `name` and `version` from `package@version` format
2. **Query OSV** — POST to `https://api.osv.dev/v1/query` with package info
3. **Report** — display vulnerabilities with severity, CVE IDs, and fix versions

### Bulk scan mode

1. **Read package.json** — extract all `dependencies` and `devDependencies`
2. **Clean versions** — strip semver range characters (`^`, `~`, `>=`)
3. **Query OSV in parallel** — `Promise.allSettled` for all packages
4. **Report** — display per-package results and summary

## Key Design Decisions

### Zero dependencies

The entire tool uses only Node.js built-in modules (`fetch`, `fs/promises`, `path`, `url`). This means no `node_modules`, no supply chain risk, and instant installs.

### ES Modules

The project uses `"type": "module"` for native ESM support. All imports use the `.js` extension.

### Exit codes as API

The CLI returns `0` for clean scans and `1` for vulnerabilities found. This makes it directly usable in CI pipelines without parsing output.

### Parallel queries

When scanning `package.json`, all packages are queried in parallel using `Promise.allSettled`. This ensures a single failed request doesn't block the entire scan.

## Module Reference

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `api.js` | `queryPackage`, `queryMultiple` | OSV API client |
| `parser.js` | `parsePackageArg`, `readPackageDeps` | Input parsing |
| `reporter.js` | `reportSingle`, `reportMultiple` | Terminal output |
