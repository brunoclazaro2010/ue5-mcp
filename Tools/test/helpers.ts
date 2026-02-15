/**
 * helpers.ts — HTTP wrappers and fixture management for integration tests.
 */

import { TEST_BASE_URL } from "./bootstrap.js";

// ---------------------------------------------------------------------------
// HTTP helpers (mirror the production ueGet/uePost in src/index.ts)
// ---------------------------------------------------------------------------

export async function ueGet(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<any> {
  const url = new URL(endpoint, TEST_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const resp = await fetch(url.toString(), {
    signal: AbortSignal.timeout(30_000),
  });
  return resp.json();
}

export async function uePost(
  endpoint: string,
  body: Record<string, any>,
): Promise<any> {
  const resp = await fetch(`${TEST_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  return resp.json();
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Generate a unique Blueprint name using a prefix and timestamp. */
export function uniqueName(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Create a test Blueprint via the HTTP API.
 * Returns the full JSON response from /api/create-blueprint.
 */
export async function createTestBlueprint(opts: {
  name: string;
  packagePath?: string;
  parentClass?: string;
  blueprintType?: string;
}): Promise<any> {
  return uePost("/api/create-blueprint", {
    blueprintName: opts.name,
    packagePath: opts.packagePath ?? "/Game/Test",
    parentClass: opts.parentClass ?? "Actor",
    blueprintType: opts.blueprintType ?? "Normal",
  });
}

/**
 * Delete a test Blueprint via the HTTP API (force = true to skip reference checks).
 * Returns the full JSON response from /api/delete-asset.
 */
export async function deleteTestBlueprint(
  assetPath: string,
): Promise<any> {
  return uePost("/api/delete-asset", {
    assetPath,
    force: true,
  });
}
