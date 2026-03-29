import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { parsePackageArg, readProjectDeps } from '../src/parser.js';

describe('parsePackageArg', () => {
  it('parses a simple package@version', () => {
    const result = parsePackageArg('lodash@4.17.15');
    expect(result).toEqual({ name: 'lodash', version: '4.17.15', ecosystem: 'npm' });
  });

  it('parses a scoped package @scope/name@version', () => {
    const result = parsePackageArg('@angular/core@14.0.0');
    expect(result).toEqual({ name: '@angular/core', version: '14.0.0', ecosystem: 'npm' });
  });

  it('uses specified ecosystem', () => {
    const result = parsePackageArg('requests@2.28.0', 'pypi');
    expect(result).toEqual({ name: 'requests', version: '2.28.0', ecosystem: 'PyPI' });
  });

  it('parses a package name without version', () => {
    const result = parsePackageArg('lodash');
    expect(result).toEqual({ name: 'lodash', version: undefined, ecosystem: 'npm' });
  });

  it('parses a scoped package without version', () => {
    const result = parsePackageArg('@angular/core');
    expect(result).toEqual({ name: '@angular/core', version: undefined, ecosystem: 'npm' });
  });

  it('throws on empty name (bare @version)', () => {
    expect(() => parsePackageArg('@4.17.15')).toThrow('Invalid format');
  });

  it('throws on unknown ecosystem', () => {
    expect(() => parsePackageArg('pkg@1.0.0', 'unknown')).toThrow('Unknown ecosystem');
  });
});

describe('readProjectDeps', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'osv-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('reads npm dependencies from package.json', async () => {
    await writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { jest: '~30.0.0' },
      })
    );

    const deps = await readProjectDeps(tmpDir);
    expect(deps).toEqual(
      expect.arrayContaining([
        { name: 'lodash', version: '4.17.21', ecosystem: 'npm' },
        { name: 'jest', version: '30.0.0', ecosystem: 'npm' },
      ])
    );
  });

  it('reads pip dependencies from requirements.txt', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'requests==2.28.0\nflask==2.3.0\n'
    );

    const deps = await readProjectDeps(tmpDir);
    expect(deps).toEqual([
      { name: 'requests', version: '2.28.0', ecosystem: 'PyPI' },
      { name: 'flask', version: '2.3.0', ecosystem: 'PyPI' },
    ]);
  });

  it('reads from both package.json and requirements.txt', async () => {
    await writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { express: '4.18.0' } })
    );
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'django==4.2.0\n'
    );

    const deps = await readProjectDeps(tmpDir);
    expect(deps).toHaveLength(2);
    expect(deps).toEqual(
      expect.arrayContaining([
        { name: 'express', version: '4.18.0', ecosystem: 'npm' },
        { name: 'django', version: '4.2.0', ecosystem: 'PyPI' },
      ])
    );
  });

  it('throws when no manifest files are found', async () => {
    await expect(readProjectDeps(tmpDir)).rejects.toThrow('No dependencies found');
  });
});
