# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **GitHub Actions CI**: smoke tests on Node 18/20/22 across Ubuntu and macOS.
- **GitHub Actions Release**: automated version check, npm publish with provenance, git tag, and GitHub Release creation.
- **Pre-commit hook**: smoke tests before each commit.
