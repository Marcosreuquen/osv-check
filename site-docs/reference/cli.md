# CLI Commands

## `osv-check <package@version>`

Check a specific package for known vulnerabilities.

```bash
$ osv-check lodash@4.17.15
Checking lodash@4.17.15 against OSV database...

🚨 lodash@4.17.15 — 3 vulnerabilities found

  [HIGH] GHSA-jf85-cpcp-j695 (CVE-2021-23337)
    Lodash Command Injection
    Fixed in: 4.17.21

  [HIGH] GHSA-35jh-r3h4-6jhm (CVE-2020-28500)
    Regular Expression Denial of Service (ReDoS)
    Fixed in: 4.17.21

  [CRITICAL] GHSA-4xc9-xhrj-v574 (CVE-2020-8203)
    Prototype Pollution
    Fixed in: 4.17.19
```

### Scoped packages

```bash
osv-check @angular/core@14.0.0
```

## `osv-check` (no arguments)

Reads `package.json` from the current directory and checks all `dependencies` and `devDependencies`.

```bash
$ osv-check
Reading package.json...
Checking 42 packages against OSV database...

🚨 lodash@4.17.15 — 3 vulnerabilities found
  ...

─────────────────────────────────────────
Scanned 42 packages: 1 vulnerable, 41 clean
Total vulnerabilities: 3
```

## `osv-check --help`

Shows usage information and examples.

## `osv-check --version`

Prints the current version number.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No vulnerabilities found |
| `1` | Vulnerabilities found or error occurred |
