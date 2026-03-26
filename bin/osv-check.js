#!/usr/bin/env node

import { queryPackage, queryMultiple } from '../src/api.js';
import { parsePackageArg, readPackageDeps } from '../src/parser.js';
import { reportSingle, reportMultiple } from '../src/reporter.js';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

const HELP = `
${BOLD}osv-check${RESET} — Check npm packages for known vulnerabilities (OSV.dev)

${BOLD}Usage:${RESET}
  osv-check <package@version>   Check a specific package
  osv-check                     Check all deps in ./package.json
  osv-check --help              Show this help message
  osv-check --version           Show version

${BOLD}Examples:${RESET}
  ${DIM}$ osv-check lodash@4.17.15${RESET}
  ${DIM}$ osv-check @angular/core@14.0.0${RESET}
  ${DIM}$ osv-check${RESET}
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, resolve } = await import('node:path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(await readFile(resolve(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(pkg.version);
    process.exit(0);
  }

  const target = args[0];

  try {
    if (target) {
      // Check single package
      const { name, version } = parsePackageArg(target);
      console.log(`${DIM}Checking ${name}@${version} against OSV database...${RESET}`);
      const data = await queryPackage(name, version);
      const count = reportSingle(name, version, data.vulns || []);
      process.exit(count > 0 ? 1 : 0);
    } else {
      // Check package.json
      console.log(`${DIM}Reading package.json...${RESET}`);
      const packages = await readPackageDeps();

      if (packages.length === 0) {
        console.log('No dependencies found in package.json.');
        process.exit(0);
      }

      console.log(`${DIM}Checking ${packages.length} packages against OSV database...${RESET}`);
      const results = await queryMultiple(packages);
      const count = reportMultiple(results);
      process.exit(count > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error(`\n❌ ${error.message}\n`);
    process.exit(1);
  }
}

main();
