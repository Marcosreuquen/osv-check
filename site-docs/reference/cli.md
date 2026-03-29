# CLI Commands

## `osv-check <package@version>`

Check a specific package version for known vulnerabilities.

```bash
$ osv-check lodash@4.17.15
Checking lodash@4.17.15 (npm) against OSV database...

🚨 lodash@4.17.15 — 4 vulnerabilities found

  [HIGH] GHSA-jf85-cpcp-j695 (CVE-2021-23337)
    Lodash Command Injection
    Fixed in: 4.17.21

  [MODERATE] GHSA-29mw-wpgm-hmr9 (CVE-2020-28500)
    Regular Expression Denial of Service (ReDoS)
    Fixed in: 4.17.21
```

## `osv-check <package>`

Check the latest version of a package. Resolves the latest version from the ecosystem registry (npm or PyPI) automatically.

```bash
$ osv-check lodash
Resolving latest version of lodash (npm)...
Latest version: 4.17.23
Checking lodash@4.17.23 (npm) against OSV database...

✅ lodash@4.17.23 — no known vulnerabilities
```

### Scoped packages

```bash
osv-check @angular/core
```

### PyPI packages

```bash
osv-check requests -e pypi
```

## `osv-check <package> --all`

List all known vulnerabilities across every version of a package, with affected version ranges.

```bash
$ osv-check lodash --all
Fetching all known vulnerabilities for lodash (npm)...

🚨 lodash — 8 vulnerabilities found across all versions

  [MODERATE] GHSA-29mw-wpgm-hmr9 (CVE-2020-28500)
    Regular Expression Denial of Service (ReDoS) in lodash
    Affected: 4.0.0 — 4.17.21
    Fixed in: 4.17.21

  [HIGH] GHSA-35jh-r3h4-6jhm (CVE-2021-23337)
    Command Injection in lodash
    Affected: 0 — 4.17.21
    Fixed in: 4.17.21
```

## `osv-check` (no arguments)

Reads manifest files (`package.json`, `requirements.txt`) from the current directory and checks all dependencies.

```bash
$ osv-check
Scanning project for manifest files...
Found 42 packages (40 npm, 2 PyPI). Checking against OSV database...

🚨 lodash@4.17.15 — 4 vulnerabilities found
  ...

─────────────────────────────────────────
Scanned 42 packages: 1 vulnerable, 41 clean
Total vulnerabilities: 4
```

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--ecosystem <name>` | `-e` | Ecosystem for single-package check (`npm`, `pypi`) |
| `--all` | `-a` | Show all vulnerabilities across all versions |
| `--help` | `-h` | Show help message |
| `--version` | `-v` | Show version |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No vulnerabilities found |
| `1` | Vulnerabilities found or error occurred |
