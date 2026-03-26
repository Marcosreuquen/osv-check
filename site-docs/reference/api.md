# Programmatic API

`osv-check` can be used as a library in your own Node.js scripts.

```js
import { queryPackage, queryMultiple } from 'osv-check';
```

## `queryPackage(name, version, ecosystem?)`

Query the OSV API for vulnerabilities in a specific package.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `string` | — | Package name (e.g. `"lodash"`) |
| `version` | `string` | — | Package version (e.g. `"4.17.15"`) |
| `ecosystem` | `string` | `"npm"` | Package ecosystem |

### Returns

`Promise<{ vulns: Array }>` — The raw OSV API response.

### Example

```js
const result = await queryPackage('lodash', '4.17.15');

if (result.vulns && result.vulns.length > 0) {
  console.log(`Found ${result.vulns.length} vulnerabilities`);
}
```

## `queryMultiple(packages)`

Query multiple packages in parallel.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `packages` | `Array<{ name, version }>` | List of packages to check |

### Returns

`Promise<Array<{ name, version, vulns, error? }>>` — Results for each package. Failed queries include an `error` field instead of throwing.

### Example

```js
const results = await queryMultiple([
  { name: 'lodash', version: '4.17.15' },
  { name: 'express', version: '4.18.2' },
]);

for (const pkg of results) {
  if (pkg.error) {
    console.error(`Error checking ${pkg.name}: ${pkg.error}`);
  } else if (pkg.vulns.length > 0) {
    console.log(`${pkg.name}@${pkg.version}: ${pkg.vulns.length} vulnerabilities`);
  }
}
```
