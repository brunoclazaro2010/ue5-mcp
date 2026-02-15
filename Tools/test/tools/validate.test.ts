import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { uePost, createTestBlueprint, deleteTestBlueprint, uniqueName } from "../helpers.js";

describe("validate_blueprint", () => {
  const bpName = uniqueName("BP_ValidateTest");
  const packagePath = "/Game/Test";

  beforeAll(async () => {
    const bp = await createTestBlueprint({ name: bpName });
    expect(bp.error).toBeUndefined();
  });

  afterAll(async () => {
    await deleteTestBlueprint(`${packagePath}/${bpName}`);
  });

  it("validates a clean Blueprint successfully", async () => {
    const data = await uePost("/api/validate-blueprint", {
      blueprint: bpName,
    });
    expect(data.error).toBeUndefined();
    expect(data.blueprint).toBe(bpName);
    expect(data.isValid).toBe(true);
  });

  it("returns error for non-existent blueprint", async () => {
    const data = await uePost("/api/validate-blueprint", {
      blueprint: "BP_DoesNotExist_XYZ_999",
    });
    expect(data.error).toBeDefined();
  });

  it("rejects missing required fields", async () => {
    const data = await uePost("/api/validate-blueprint", {});
    expect(data.error).toBeDefined();
  });
});

describe("validate_all_blueprints", () => {
  it("validates all blueprints in /Game/Test path", async () => {
    const data = await uePost("/api/validate-all-blueprints", {
      filter: "/Game/Test",
    });
    expect(data.error).toBeUndefined();
    expect(typeof data.totalChecked).toBe("number");
    expect(typeof data.totalPassed).toBe("number");
    expect(typeof data.totalFailed).toBe("number");
  });

  it("validates with no filter (may take longer)", async () => {
    const data = await uePost("/api/validate-all-blueprints", {});
    expect(data.error).toBeUndefined();
    expect(data.totalChecked).toBeGreaterThanOrEqual(0);
  });
});
