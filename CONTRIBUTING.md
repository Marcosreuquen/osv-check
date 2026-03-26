# Contributing to osv-check

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-username>/osv-check.git
cd osv-check
```

2. Set up git hooks:

```bash
git config core.hooksPath .githooks
```

3. Verify the CLI works:

```bash
node bin/osv-check.js --version
node bin/osv-check.js lodash@4.17.20
```

No external dependencies are needed — everything uses the Node.js standard library.

## Project Structure

```
bin/osv-check.js   ← CLI entrypoint
src/api.js         ← OSV API client
src/parser.js      ← Package argument and package.json parser
src/reporter.js    ← Terminal output formatting
site-docs/         ← Documentation source (MkDocs)
```

## Making Changes

### Branching

- Create a feature branch from `main`: `git checkout -b feat/my-feature`
- For bug fixes: `git checkout -b fix/description`

### Code Style

- **Language**: JavaScript (ES Modules), Node.js >= 18
- **Zero dependencies**: Do not add external npm dependencies
- **Output discipline**: `stdout` for user-facing output, `stderr` for errors
- **Exit codes**: `0` = no vulnerabilities, `1` = vulnerabilities found or error

### Commit Messages

Use clear, conventional commit messages:

```
feat: add support for yarn.lock scanning
fix: handle scoped packages with no version
docs: update CLI reference in site-docs
```

## Submitting a Pull Request

1. Make sure the CLI works: `node bin/osv-check.js --version`
2. Test with a real package: `node bin/osv-check.js lodash@4.17.20`
3. Update the [CHANGELOG.md](./CHANGELOG.md) under an `## [Unreleased]` section
4. Open a PR against `main` with a clear description of what changed and why

## Reporting Issues

Open an issue on GitHub with:

- Your Node.js version (`node --version`)
- Steps to reproduce the problem
- Expected vs actual behaviour
- The full command you ran

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
