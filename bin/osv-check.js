#!/usr/bin/env node

import { queryPackage, queryMultiple } from '../src/api.js';
import { parsePackageArg, readProjectDeps } from '../src/parser.js';
import { reportSingle, reportAll, reportMultiple } from '../src/reporter.js';
import { fetchLatestVersion } from '../src/ecosystems/index.js';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

const HELP = `
${BOLD}osv-check${RESET} — Check packages for known vulnerabilities (OSV.dev)

${BOLD}Usage:${RESET}
  osv-check <package@version>   Check a specific package version (defaults to npm)
  osv-check <package>           Check latest version for vulnerabilities
  osv-check <package> --all     List all known vulnerabilities across all versions
  osv-check <pkg@ver> -e pypi   Check a package in a specific ecosystem
  osv-check                     Scan all manifest files in current directory
  osv-check --help              Show this help message
  osv-check --version           Show version

${BOLD}Options:${RESET}
  -e, --ecosystem <name>   Ecosystem for single-package check (npm, pypi)
  -a, --all                Show all vulnerabilities across all versions

${BOLD}Supported ecosystems:${RESET}
  npm    package.json
  pypi   requirements.txt

${BOLD}Examples:${RESET}
  ${DIM}$ osv-check lodash@4.17.15${RESET}
  ${DIM}$ osv-check lodash${RESET}                    ${DIM}# checks latest version${RESET}
  ${DIM}$ osv-check lodash --all${RESET}              ${DIM}# all vulns across all versions${RESET}
  ${DIM}$ osv-check requests -e pypi${RESET}
  ${DIM}$ osv-check requests@2.25.0 -e pypi${RESET}
  ${DIM}$ osv-check @angular/core${RESET}             ${DIM}# latest version of scoped package${RESET}
  ${DIM}$ osv-check${RESET}                          ${DIM}# scans package.json + requirements.txt${RESET}
`;

function parseArgs(argv) {
  const flags = { help: false, version: false, all: false, ecosystem: undefined, target: undefined };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--version' || arg === '-v') flags.version = true;
    else if (arg === '--all' || arg === '-a') flags.all = true;
    else if (arg === '--ecosystem' || arg === '-e') flags.ecosystem = argv[++i];
    else if (!arg.startsWith('-')) flags.target = arg;
  }

  return flags;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (flags.version) {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, resolve } = await import('node:path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(await readFile(resolve(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(pkg.version);
    process.exit(0);
  }

  try {
    if (flags.target) {
      const { name, version, ecosystem } = parsePackageArg(flags.target, flags.ecosystem);

      if (!version && flags.all) {
        // --all mode: query all vulnerabilities across all versions
        console.log(`${DIM}Fetching all known vulnerabilities for ${name} (${ecosystem})...${RESET}`);
        const data = await queryPackage(name, undefined, ecosystem);
        const count = reportAll(name, data.vulns || [], ecosystem);
        process.exit(count > 0 ? 1 : 0);
      }

      // Resolve version: use provided or fetch latest
      let resolvedVersion = version;
      if (!resolvedVersion) {
        console.log(`${DIM}Resolving latest version of ${name} (${ecosystem})...${RESET}`);
        resolvedVersion = await fetchLatestVersion(name, ecosystem);
        console.log(`${DIM}Latest version: ${resolvedVersion}${RESET}`);
      }

      console.log(`${DIM}Checking ${name}@${resolvedVersion} (${ecosystem}) against OSV database...${RESET}`);
      const data = await queryPackage(name, resolvedVersion, ecosystem);
      const count = reportSingle(name, resolvedVersion, data.vulns || [], ecosystem);
      process.exit(count > 0 ? 1 : 0);
    } else {
      // Scan all manifest files in project
      console.log(`${DIM}Scanning project for manifest files...${RESET}`);
      const packages = await readProjectDeps();

      const ecosystemGroups = {};
      for (const pkg of packages) {
        ecosystemGroups[pkg.ecosystem] = (ecosystemGroups[pkg.ecosystem] || 0) + 1;
      }
      const summary = Object.entries(ecosystemGroups).map(([e, c]) => `${c} ${e}`).join(', ');
      console.log(`${DIM}Found ${packages.length} packages (${summary}). Checking against OSV database...${RESET}`);

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
