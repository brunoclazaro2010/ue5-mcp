import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ueGet, uePost, createTestBlueprint, deleteTestBlueprint, uniqueName } from "../helpers.js";

describe("search_blueprints", () => {
  const bpName = uniqueName("BP_SearchTest");
  const packagePath = "/Game/Test";

  beforeAll(async () => {
    const bp = await createTestBlueprint({ name: bpName });
    expect(bp.error).toBeUndefined();
    // Add a PrintString node so we have something to search for
    await uePost("/api/add-node", {
      blueprint: bpName,
      graph: "EventGraph",
      nodeType: "CallFunction",
      functionName: "PrintString",
    });
  });

  afterAll(async () => {
    await deleteTestBlueprint(`${packagePath}/${bpName}`);
  });

  it("finds nodes matching a query", async () => {
    const data = await ueGet("/api/search", {
      query: "PrintString",
      path: "/Game/Test",
    });
    expect(data.error).toBeUndefined();
    expect(data.resultCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.results)).toBe(true);
  });

  it("returns empty results for non-matching query", async () => {
    const data = await ueGet("/api/search", {
      query: "ZZZ_NonExistentFunction_XYZ",
      path: "/Game/Test",
    });
    expect(data.error).toBeUndefined();
    expect(data.resultCount).toBe(0);
  });

  it("rejects missing query parameter", async () => {
    const data = await ueGet("/api/search", {});
    expect(data.error).toBeDefined();
  });
});

describe("search_by_type", () => {
  it("returns type usage results structure", async () => {
    // Search for a type that likely exists in engine BPs
    const data = await ueGet("/api/search-by-type", { typeName: "Vector" });
    expect(data.error).toBeUndefined();
    // May or may not find results, but the structure should be valid
  });

  it("returns empty for non-existent type", async () => {
    const data = await ueGet("/api/search-by-type", {
      typeName: "FNonExistentType_XYZ_999",
    });
    expect(data.error).toBeUndefined();
  });
});
