# Installation

## npm (recommended)

```bash
npm install -g osv-check
```

This installs the `osv-check` command globally.

## npx (no install)

Run without installing:

```bash
npx osv-check lodash@4.17.15
```

## From source

```bash
git clone https://github.com/Marcosreuquen/osv-check.git
cd osv-check
node bin/osv-check.js --version
```

No `npm install` needed — the project has zero dependencies.

## Verify

```bash
osv-check --version
osv-check --help
```

## Requirements

- **Node.js** >= 18.0.0 (uses built-in `fetch`)
