# osv-check

CLI tool to check npm packages for known vulnerabilities using the [OSV.dev](https://osv.dev/) API.

Zero dependencies. Requires Node.js >= 18.

## Install

```bash
npm install -g osv-check
```

## Usage

### Check a specific package

```bash
osv-check lodash@4.17.15
```

### Check all dependencies in your project

```bash
osv-check
```

This reads `package.json` from the current directory and checks all `dependencies` and `devDependencies`.

### Scoped packages

```bash
osv-check @angular/core@14.0.0
```

## Exit codes

- `0` — No vulnerabilities found
- `1` — Vulnerabilities found or error occurred

## Programmatic API

```js
import { queryPackage, queryMultiple } from 'osv-check';

const result = await queryPackage('lodash', '4.17.15');
console.log(result.vulns);
```

## License

MIT
