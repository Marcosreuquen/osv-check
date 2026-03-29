const SEVERITY_COLORS = {
  CRITICAL: '\x1b[91m',  // bright red
  HIGH: '\x1b[31m',      // red
  MODERATE: '\x1b[33m',  // yellow
  LOW: '\x1b[36m',       // cyan
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

/**
 * Extract severity label from a vulnerability object.
 */
function getSeverity(vuln) {
  const dbSeverity = vuln.database_specific?.severity;
  if (dbSeverity) return dbSeverity.toUpperCase();

  const cvss = vuln.severity?.find((s) => s.type === 'CVSS_V3' || s.type === 'CVSS_V4');
  if (cvss?.score) {
    const match = cvss.score.match(/AV:\w\/AC:\w/);
    // Rough mapping from CVSS base score
    const baseScore = parseCvssBaseScore(cvss.score);
    if (baseScore >= 9.0) return 'CRITICAL';
    if (baseScore >= 7.0) return 'HIGH';
    if (baseScore >= 4.0) return 'MODERATE';
    return 'LOW';
  }

  return 'UNKNOWN';
}

function parseCvssBaseScore(cvssVector) {
  // Extract base score from common patterns, fallback to rough estimate
  const parts = cvssVector.split('/');
  let score = 5.0; // default moderate

  for (const part of parts) {
    if (part.startsWith('AV:N')) score += 1.0;
    if (part.startsWith('AC:L')) score += 0.5;
    if (part.startsWith('C:H') || part.startsWith('VC:H')) score += 1.0;
    if (part.startsWith('I:H') || part.startsWith('VI:H')) score += 1.0;
    if (part.startsWith('A:H') || part.startsWith('VA:H')) score += 0.5;
  }

  return Math.min(score, 10.0);
}

function colorize(severity, text) {
  const color = SEVERITY_COLORS[severity] || DIM;
  return `${color}${text}${RESET}`;
}

/**
 * Report all vulnerabilities for a package (--all mode).
 * Shows affected version ranges for each vulnerability.
 */
export function reportAll(name, vulns, ecosystem) {
  if (!vulns || vulns.length === 0) {
    console.log(`\n${BOLD}✅ ${name}${RESET} — no known vulnerabilities across any version\n`);
    return 0;
  }

  console.log(`\n${BOLD}🚨 ${name}${RESET} — ${vulns.length} vulnerabilit${vulns.length === 1 ? 'y' : 'ies'} found across all versions\n`);

  for (const vuln of vulns) {
    const severity = getSeverity(vuln);
    const aliases = vuln.aliases?.join(', ') || '';
    const fixedVersions = getFixedVersions(vuln, name, ecosystem);
    const affectedVersions = getAffectedVersions(vuln, name, ecosystem);

    console.log(`  ${colorize(severity, `[${severity}]`)} ${BOLD}${vuln.id}${RESET}${aliases ? ` (${aliases})` : ''}`);
    console.log(`    ${vuln.summary || 'No description available'}`);
    if (affectedVersions) {
      console.log(`    ${DIM}Affected: ${affectedVersions}${RESET}`);
    }
    if (fixedVersions) {
      console.log(`    ${DIM}Fixed in: ${fixedVersions}${RESET}`);
    }
    console.log();
  }

  return vulns.length;
}

function getAffectedVersions(vuln, packageName, ecosystem) {
  const affected = vuln.affected?.find(
    (a) => a.package?.name === packageName && (!ecosystem || a.package?.ecosystem === ecosystem)
  );
  if (!affected) return null;

  const parts = [];

  // Version ranges (introduced → fixed)
  if (affected.ranges) {
    for (const range of affected.ranges) {
      const events = range.events || [];
      const introduced = events.find((e) => e.introduced)?.introduced;
      const fixed = events.find((e) => e.fixed)?.fixed;

      if (introduced && fixed) {
        parts.push(`${introduced} — ${fixed}`);
      } else if (introduced) {
        parts.push(`>= ${introduced}`);
      }
    }
  }

  // Specific listed versions (fallback if no ranges)
  if (parts.length === 0 && affected.versions?.length) {
    const versions = affected.versions;
    if (versions.length <= 5) {
      parts.push(versions.join(', '));
    } else {
      parts.push(`${versions.slice(0, 5).join(', ')} (+${versions.length - 5} more)`);
    }
  }

  return parts.length > 0 ? parts.join(' | ') : null;
}

/**
 * Report vulnerabilities for a single package.
 */
export function reportSingle(name, version, vulns, ecosystem) {
  const label = version ? `${name}@${version}` : name;

  if (!vulns || vulns.length === 0) {
    console.log(`\n${BOLD}✅ ${label}${RESET} — no known vulnerabilities\n`);
    return 0;
  }

  console.log(`\n${BOLD}🚨 ${label}${RESET} — ${vulns.length} vulnerabilit${vulns.length === 1 ? 'y' : 'ies'} found\n`);

  for (const vuln of vulns) {
    const severity = getSeverity(vuln);
    const aliases = vuln.aliases?.join(', ') || '';
    const fixedVersions = getFixedVersions(vuln, name, ecosystem);

    console.log(`  ${colorize(severity, `[${severity}]`)} ${BOLD}${vuln.id}${RESET}${aliases ? ` (${aliases})` : ''}`);
    console.log(`    ${vuln.summary || 'No description available'}`);
    if (fixedVersions) {
      console.log(`    ${DIM}Fixed in: ${fixedVersions}${RESET}`);
    }
    console.log();
  }

  return vulns.length;
}

function getFixedVersions(vuln, packageName, ecosystem) {
  const affected = vuln.affected?.find(
    (a) => a.package?.name === packageName && (!ecosystem || a.package?.ecosystem === ecosystem)
  );
  if (!affected?.ranges) return null;

  const fixed = affected.ranges
    .flatMap((r) => r.events || [])
    .filter((e) => e.fixed)
    .map((e) => e.fixed);

  return fixed.length > 0 ? fixed.join(', ') : null;
}

/**
 * Report vulnerabilities for multiple packages (package.json scan).
 */
export function reportMultiple(results) {
  let totalVulns = 0;
  let packagesWithVulns = 0;

  const vulnerable = results.filter((r) => r.vulns && r.vulns.length > 0);
  const withErrors = results.filter((r) => r.error);
  const clean = results.filter((r) => !r.error && (!r.vulns || r.vulns.length === 0));

  if (vulnerable.length > 0) {
    for (const result of vulnerable) {
      totalVulns += reportSingle(result.name, result.version, result.vulns, result.ecosystem);
      packagesWithVulns++;
    }
  }

  if (withErrors.length > 0) {
    console.log(`\n${BOLD}⚠️  Errors:${RESET}`);
    for (const result of withErrors) {
      console.log(`  ${DIM}${result.name}@${result.version}: ${result.error}${RESET}`);
    }
  }

  // Summary
  console.log(`${DIM}─────────────────────────────────────────${RESET}`);
  console.log(
    `${BOLD}Scanned ${results.length} packages:${RESET} ` +
    `${packagesWithVulns > 0 ? `${SEVERITY_COLORS.HIGH}${packagesWithVulns} vulnerable${RESET}` : '✅ 0 vulnerable'}, ` +
    `${clean.length} clean` +
    (withErrors.length > 0 ? `, ${withErrors.length} errors` : '')
  );
  console.log(`${BOLD}Total vulnerabilities: ${totalVulns}${RESET}\n`);

  return totalVulns;
}
