import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock fetch globally before importing the module
let queryPackage, queryMultiple;

beforeEach(async () => {
  global.fetch = jest.fn();
  // Re-import to get fresh module
  const api = await import('../src/api.js');
  queryPackage = api.queryPackage;
  queryMultiple = api.queryMultiple;
});

afterEach(() => {
  delete global.fetch;
});

describe('queryPackage', () => {
  it('sends correct request to OSV API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ vulns: [] }),
    });

    await queryPackage('lodash', '4.17.15', 'npm');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.osv.dev/v1/query',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: { name: 'lodash', ecosystem: 'npm' },
          version: '4.17.15',
        }),
      })
    );
  });

  it('sends correct ecosystem for PyPI', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ vulns: [] }),
    });

    await queryPackage('requests', '2.28.0', 'PyPI');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.osv.dev/v1/query',
      expect.objectContaining({
        body: JSON.stringify({
          package: { name: 'requests', ecosystem: 'PyPI' },
          version: '2.28.0',
        }),
      })
    );
  });

  it('sends request without version when not provided', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ vulns: [] }),
    });

    await queryPackage('lodash', undefined, 'npm');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.osv.dev/v1/query',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: { name: 'lodash', ecosystem: 'npm' },
        }),
      })
    );
  });

  it('returns parsed response', async () => {
    const mockVulns = [{ id: 'GHSA-123', summary: 'Test vuln' }];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ vulns: mockVulns }),
    });

    const result = await queryPackage('lodash', '4.17.15');
    expect(result).toEqual({ vulns: mockVulns });
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(queryPackage('lodash', '4.17.15')).rejects.toThrow('OSV API error: 500');
  });
});

describe('queryMultiple', () => {
  it('queries all packages in parallel', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ vulns: [] }),
    });

    const packages = [
      { name: 'lodash', version: '4.17.15', ecosystem: 'npm' },
      { name: 'requests', version: '2.28.0', ecosystem: 'PyPI' },
    ];

    const results = await queryMultiple(packages);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ name: 'lodash', version: '4.17.15', ecosystem: 'npm', vulns: [] });
    expect(results[1]).toEqual({ name: 'requests', version: '2.28.0', ecosystem: 'PyPI', vulns: [] });
  });

  it('handles individual package errors gracefully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vulns: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

    const packages = [
      { name: 'lodash', version: '4.17.15', ecosystem: 'npm' },
      { name: 'bad-pkg', version: '1.0.0', ecosystem: 'npm' },
    ];

    const results = await queryMultiple(packages);

    expect(results[0].vulns).toEqual([]);
    expect(results[0].error).toBeUndefined();
    expect(results[1].vulns).toEqual([]);
    expect(results[1].error).toContain('OSV API error');
  });
});
