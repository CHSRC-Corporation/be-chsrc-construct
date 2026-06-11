import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { versions } from 'node:process';

type PackageJson = {
  version?: string;
};

export const SERVICE_NAME = 'be-chsrc-construct';

let cachedPackageVersion: string | null = null;

function getPackageVersion(): string {
  if (cachedPackageVersion) {
    return cachedPackageVersion;
  }

  try {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as PackageJson;

    cachedPackageVersion = packageJson.version ?? '0.0.0-local';
    return cachedPackageVersion;
  } catch {
    cachedPackageVersion = '0.0.0-local';
    return cachedPackageVersion;
  }
}

export function getVersionInfo() {
  const gitSha = process.env.GIT_SHA ?? process.env.GITHUB_SHA ?? 'local';

  return {
    service: SERVICE_NAME,
    version: process.env.APP_VERSION ?? getPackageVersion(),
    gitSha: gitSha === 'local' ? gitSha : gitSha.slice(0, 7),
    nodeVersion: versions.node,
    environment: process.env.NODE_ENV ?? 'development',
  };
}
