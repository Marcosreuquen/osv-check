import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { reportSingle, reportMultiple } from '../src/reporter.js';

// Suppress console.log during tests
let logSpy;

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
});

const makeVuln = (id, { severity, aliases, summary, ecosystem = 'npm', packageName = 'test-pkg', fixed } = {}) => ({
  id,
  summary: summary || `Vulnerability ${id}`,
  aliases: aliases || [],
  database_specific: severity ? { severity } : undefined,
  affected: fixed
    ? [{ package: { name: packageName, ecosystem }, ranges: [{ events: [{ fixed }] }] }]
    : undefined,
});

describe('reportSingle', () => {
  it('returns 0 and logs clean message when no vulns', () => {
    const count = reportSingle('lodash', '4.17.21', []);
    expect(count).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('lodash@4.17.21'));
  });

  it('returns 0 for null vulns', () => {
    const count = reportSingle('lodash', '4.17.21', null);
    expect(count).toBe(0);
  });

  it('returns vulnerability count when vulns exist', () => {
    const vulns = [
      makeVuln('GHSA-001', { severity: 'HIGH' }),
      makeVuln('GHSA-002', { severity: 'CRITICAL' }),
    ];
    const count = reportSingle('lodash', '4.17.15', vulns);
    expect(count).toBe(2);
  });

  it('displays fixed version info', () => {
    const vulns = [
      makeVuln('GHSA-001', { packageName: 'lodash', ecosystem: 'npm', fixed: '4.17.21' }),
    ];
    reportSingle('lodash', '4.17.15', vulns, 'npm');
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('4.17.21');
  });

  it('uses singular "vulnerability" for single vuln', () => {
    const vulns = [makeVuln('GHSA-001')];
    reportSingle('pkg', '1.0.0', vulns);
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('1 vulnerability found');
  });

  it('uses plural "vulnerabilities" for multiple vulns', () => {
    const vulns = [makeVuln('GHSA-001'), makeVuln('GHSA-002')];
    reportSingle('pkg', '1.0.0', vulns);
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('2 vulnerabilities found');
  });
});

describe('reportMultiple', () => {
  it('returns 0 for all-clean results', () => {
    const results = [
      { name: 'a', version: '1.0.0', ecosystem: 'npm', vulns: [] },
      { name: 'b', version: '2.0.0', ecosystem: 'npm', vulns: [] },
    ];
    const count = reportMultiple(results);
    expect(count).toBe(0);
  });

  it('returns total vuln count across packages', () => {
    const results = [
      { name: 'a', version: '1.0.0', ecosystem: 'npm', vulns: [makeVuln('V1'), makeVuln('V2')] },
      { name: 'b', version: '2.0.0', ecosystem: 'npm', vulns: [makeVuln('V3')] },
    ];
    const count = reportMultiple(results);
    expect(count).toBe(3);
  });

  it('prints summary with scan count', () => {
    const results = [
      { name: 'a', version: '1.0.0', ecosystem: 'npm', vulns: [] },
      { name: 'b', version: '2.0.0', ecosystem: 'npm', vulns: [makeVuln('V1')] },
    ];
    reportMultiple(results);
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('Scanned 2 packages');
  });

  it('reports errors separately', () => {
    const results = [
      { name: 'bad', version: '1.0.0', ecosystem: 'npm', vulns: [], error: 'API timeout' },
    ];
    reportMultiple(results);
    const allOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(allOutput).toContain('Errors');
    expect(allOutput).toContain('API timeout');
  });
});
