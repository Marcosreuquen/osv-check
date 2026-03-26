# Changelog

All notable changes to this project are documented here. See the full [CHANGELOG.md](https://github.com/Marcosreuquen/osv-check/blob/main/CHANGELOG.md) on GitHub for the canonical version.

## [1.0.0] - 2026-03-26

### Added

- CLI entrypoint with `--help` and `--version` flags.
- Single package vulnerability check via OSV.dev API.
- Bulk scan of all dependencies from `package.json`.
- Scoped package support (`@scope/name@version`).
- Programmatic API: `queryPackage()` and `queryMultiple()`.
- Severity detection from CVSS vectors and OSV metadata.
- Colored terminal output with fix version info.
- Zero dependencies — Node.js built-in modules only.
- MIT License, CONTRIBUTING.md, documentation site.
- GitHub Actions CI, Release workflow, and docs deployment.
- Pre-commit git hook.
