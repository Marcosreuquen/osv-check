# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-29

### Added

- **Name-only package lookup**: `osv-check lodash` resolves the latest version from the registry and checks it for vulnerabilities.
- **`--all` / `-a` flag**: `osv-check lodash --all` lists all known vulnerabilities across every version, with affected version ranges shown per vulnerability.
- **Latest version resolution**: fetches the latest version from the npm registry (`registry.npmjs.org`) or PyPI (`pypi.org/pypi`) when no version is specified.
- **Affected version ranges**: in `--all` mode, each vulnerability displays its `Affected:` range (e.g. `4.0.0 — 4.17.21`).
- **PyPI ecosystem support**: `osv-check requests -e pypi` checks PyPI packages. Reads `requirements.txt` in bulk scan mode.
- **`fetchLatestVersion()`**: new programmatic API to resolve the latest version of a package from its ecosystem registry.
- **New tests**: coverage for name-only parsing, scoped packages without version, and API calls without version.

### Changed

- `parsePackageArg()` now accepts package names without a version (returns `version: undefined`).
- `queryPackage()` omits the `version` field from the OSV API payload when not provided, returning all vulnerabilities.
- Help text and examples updated to reflect new usage patterns.

## [1.0.0] - 2026-03-26

### Added

- **CLI entrypoint** (`bin/osv-check.js`) with `--help` and `--version` flags.
- **Single package scan**: `osv-check lodash@4.17.15` queries the OSV.dev API for known vulnerabilities.
- **Bulk scan**: `osv-check` (no arguments) reads `package.json` from the current directory and checks all `dependencies` and `devDependencies`.
- **Scoped package support**: handles `@scope/name@version` format.
- **Programmatic API**: `queryPackage()` and `queryMultiple()` exported from `osv-check` for use as a library.
- **Severity detection**: extracts severity from OSV database_specific or CVSS vectors.
- **Colored terminal output**: severity-colored vulnerability reports with fix version info.
- **Zero dependencies**: uses only Node.js built-in modules (`fetch`, `fs`, `path`).
- **MIT License**.
- **CONTRIBUTING.md**: guide for contributors.
- **Documentation site**: MkDocs Material site with GitHub Pages deployment.
- **GitHub Actions CI**: tests on Node 22 across Ubuntu and macOS.
- **GitHub Actions Release**: automated version check, npm publish with provenance, git tag, and GitHub Release creation.
- **Pre-commit hook**: smoke tests before each commit.
