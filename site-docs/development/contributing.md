# Contributing

Thanks for your interest in contributing! See the full [CONTRIBUTING.md](https://github.com/Marcosreuquen/osv-check/blob/main/CONTRIBUTING.md) on GitHub for detailed guidelines.

## Quick Start

```bash
git clone https://github.com/<your-username>/osv-check.git
cd osv-check
node bin/osv-check.js --version   # verify it works
```

## Code Style

- JavaScript (ES Modules), Node.js >= 22
- Zero external dependencies
- `stdout` for user-facing output; `stderr` for errors

## Pull Requests

1. CLI works: `node bin/osv-check.js --version`
2. Test with a real package: `node bin/osv-check.js lodash@4.17.20`
3. CHANGELOG.md updated
4. Clear description of what changed and why

## Reporting Issues

Include:

- Node.js version (`node --version`)
- Steps to reproduce
- Expected vs actual behaviour
