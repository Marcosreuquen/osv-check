import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import npm from '../src/ecosystems/npm.js';
import pypi from '../src/ecosystems/pypi.js';
import { getEcosystem, detectAndParse, ecosystems } from '../src/ecosystems/index.js';

describe('npm ecosystem', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'osv-npm-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('has correct metadata', () => {
    expect(npm.name).toBe('npm');
    expect(npm.manifestFile).toBe('package.json');
  });

  it('parses dependencies and devDependencies', async () => {
    await writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({
        dependencies: { express: '^4.18.0', lodash: '~4.17.21' },
        devDependencies: { jest: '>=30.0.0' },
      })
    );

    const deps = await npm.parseManifest(tmpDir);
    expect(deps).toEqual([
      { name: 'express', version: '4.18.0', ecosystem: 'npm' },
      { name: 'lodash', version: '4.17.21', ecosystem: 'npm' },
      { name: 'jest', version: '30.0.0', ecosystem: 'npm' },
    ]);
  });

  it('returns empty array for project with no deps', async () => {
    await writeFile(join(tmpDir, 'package.json'), JSON.stringify({ name: 'empty' }));
    const deps = await npm.parseManifest(tmpDir);
    expect(deps).toEqual([]);
  });

  it('throws when package.json does not exist', async () => {
    await expect(npm.parseManifest(tmpDir)).rejects.toThrow();
  });
});

describe('pypi ecosystem', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'osv-pypi-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('has correct metadata', () => {
    expect(pypi.name).toBe('PyPI');
    expect(pypi.manifestFile).toBe('requirements.txt');
  });

  it('parses pinned versions (==)', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'requests==2.28.0\nflask==2.3.0\n'
    );

    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([
      { name: 'requests', version: '2.28.0', ecosystem: 'PyPI' },
      { name: 'flask', version: '2.3.0', ecosystem: 'PyPI' },
    ]);
  });

  it('parses lower-bound versions (>=)', async () => {
    await writeFile(join(tmpDir, 'requirements.txt'), 'django>=4.2.0\n');
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([{ name: 'django', version: '4.2.0', ecosystem: 'PyPI' }]);
  });

  it('parses compatible release (~=)', async () => {
    await writeFile(join(tmpDir, 'requirements.txt'), 'numpy~=1.24.0\n');
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([{ name: 'numpy', version: '1.24.0', ecosystem: 'PyPI' }]);
  });

  it('skips comments and blank lines', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      '# this is a comment\n\nrequests==2.28.0\n\n# another comment\n'
    );
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([{ name: 'requests', version: '2.28.0', ecosystem: 'PyPI' }]);
  });

  it('skips packages without a version', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'requests\nflask==2.3.0\n'
    );
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([{ name: 'flask', version: '2.3.0', ecosystem: 'PyPI' }]);
  });

  it('normalizes package names (PEP 503)', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'Flask_SQLAlchemy==3.0.0\nPython.Dateutil==2.8.0\n'
    );
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps[0].name).toBe('flask-sqlalchemy');
    expect(deps[1].name).toBe('python-dateutil');
  });

  it('strips inline comments and environment markers', async () => {
    await writeFile(
      join(tmpDir, 'requirements.txt'),
      'requests==2.28.0  # HTTP library\nuvicorn==0.20.0 ; sys_platform == "linux"\n'
    );
    const deps = await pypi.parseManifest(tmpDir);
    expect(deps).toEqual([
      { name: 'requests', version: '2.28.0', ecosystem: 'PyPI' },
      { name: 'uvicorn', version: '0.20.0', ecosystem: 'PyPI' },
    ]);
  });

  it('throws when requirements.txt does not exist', async () => {
    await expect(pypi.parseManifest(tmpDir)).rejects.toThrow();
  });
});

describe('ecosystem registry', () => {
  it('lists all registered ecosystems', () => {
    expect(ecosystems.length).toBeGreaterThanOrEqual(2);
    const names = ecosystems.map((e) => e.name);
    expect(names).toContain('npm');
    expect(names).toContain('PyPI');
  });

  it('resolves ecosystem by name (case-insensitive)', () => {
    expect(getEcosystem('npm')).toBe(npm);
    expect(getEcosystem('NPM')).toBe(npm);
    expect(getEcosystem('pypi')).toBe(pypi);
    expect(getEcosystem('PyPI')).toBe(pypi);
  });

  it('returns undefined for unknown ecosystem', () => {
    expect(getEcosystem('unknown')).toBeUndefined();
  });

  describe('detectAndParse', () => {
    let tmpDir;

    beforeEach(async () => {
      tmpDir = await mkdtemp(join(tmpdir(), 'osv-detect-'));
    });

    afterEach(async () => {
      await rm(tmpDir, { recursive: true, force: true });
    });

    it('returns empty array when no manifests found', async () => {
      const result = await detectAndParse(tmpDir);
      expect(result).toEqual([]);
    });

    it('detects and parses all available manifests', async () => {
      await writeFile(
        join(tmpDir, 'package.json'),
        JSON.stringify({ dependencies: { express: '4.18.0' } })
      );
      await writeFile(join(tmpDir, 'requirements.txt'), 'flask==2.3.0\n');

      const result = await detectAndParse(tmpDir);
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          { name: 'express', version: '4.18.0', ecosystem: 'npm' },
          { name: 'flask', version: '2.3.0', ecosystem: 'PyPI' },
        ])
      );
    });
  });
});
