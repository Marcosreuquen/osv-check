const OSV_API_URL = 'https://api.osv.dev/v1/query';

/**
 * Query the OSV API for vulnerabilities in a specific package.
 * @param {string} name - Package name (e.g. "lodash")
 * @param {string} version - Package version (e.g. "4.17.15")
 * @param {string} [ecosystem="npm"] - Package ecosystem
 * @returns {Promise<{vulns: Array}>}
 */
export async function queryPackage(name, version, ecosystem = 'npm') {
  const response = await fetch(OSV_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: { name, ecosystem },
      version,
    }),
  });

  if (!response.ok) {
    throw new Error(`OSV API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Query multiple packages in parallel.
 * @param {Array<{name: string, version: string}>} packages
 * @returns {Promise<Array<{name: string, version: string, vulns: Array}>>}
 */
export async function queryMultiple(packages) {
  const results = await Promise.allSettled(
    packages.map(async ({ name, version }) => {
      const data = await queryPackage(name, version);
      return { name, version, vulns: data.vulns || [] };
    })
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      name: packages[i].name,
      version: packages[i].version,
      vulns: [],
      error: result.reason.message,
    };
  });
}
