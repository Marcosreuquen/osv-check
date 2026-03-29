# Configuration

`osv-check` is designed to work with zero configuration. All behaviour is controlled via CLI arguments.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No vulnerabilities found |
| `1` | Vulnerabilities found or error occurred |

This makes it easy to use in CI pipelines:

```bash
osv-check || exit 1
```

## Scanning Modes

### Single package (specific version)

```bash
osv-check lodash@4.17.15
```

### Single package (latest version)

```bash
osv-check lodash
```

Resolves the latest version from the ecosystem registry and checks it.

### All vulnerabilities

```bash
osv-check lodash --all
```

Lists all known vulnerabilities across every version, with affected ranges.

### All project dependencies

Run without arguments in a directory with `package.json` or `requirements.txt`:

```bash
osv-check
```

This reads both `dependencies` and `devDependencies` and checks each one against the OSV database.

## Ecosystem Selection

By default, `osv-check` uses the **npm** ecosystem. Use `-e` to specify a different one:

```bash
osv-check requests -e pypi
osv-check requests@2.25.0 -e pypi
```

## Semver Range Handling

When scanning `package.json`, version ranges like `^4.17.15` or `~2.0.0` are cleaned to their base version (`4.17.15`, `2.0.0`) before querying the OSV API.

## CI/CD Usage

Add to your GitHub Actions workflow:

```yaml
- name: Check for vulnerabilities
  run: npx osv-check
```

Or check a specific package before installing:

```yaml
- name: Security audit (OSV)
  run: |
    npm install -g osv-check
    osv-check lodash
```
