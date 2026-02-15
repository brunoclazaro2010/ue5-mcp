import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { uePost, createTestBlueprint, deleteTestBlueprint, uniqueName } from "../helpers.js";

describe("add_node", () => {
  const bpName = uniqueName("BP_AddNodeTest");
  const packagePath = "/Game/Test";

  beforeAll(async () => {
    const res = await createTestBlueprint({ name: bpName });
    expect(res.error).toBeUndefined();
  });

  afterAll(async () => {
    await deleteTestBlueprint(`${packagePath}/${bpName}`);
  });

  it("adds a function call node (PrintString)", async () => {
    const data = await uePost("/api/add-node", {
      blueprint: bpName,
      graph: "EventGraph",
      nodeType: "CallFunction",
      functionName: "PrintString",
    });
    expect(data.error).toBeUndefined();
    expect(data.success).toBe(true);
    expect(data.nodeId).toBeDefined();
    expect(data.nodeType).toBe("CallFunction");
    expect(data.saved).toBe(true);
  });

  it("adds an event override node (BeginPlay)", async () => {
    const data = await uePost("/api/add-node", {
      blueprint: bpName,
      graph: "EventGraph",
      nodeType: "OverrideEvent",
      functionName: "ReceiveBeginPlay",
    });
    expect(data.error).toBeUndefined();
    expect(data.success).toBe(true);
    expect(data.nodeId).toBeDefined();
    // A fresh Actor BP already has ReceiveBeginPlay, so the server
    // returns the existing node with alreadyExists=true and no saved field.
    if (data.alreadyExists) {
      expect(data.alreadyExists).toBe(true);
    } else {
      expect(data.saved).toBe(true);
    }
  });

  it("rejects missing required fields", async () => {
    const data = await uePost("/api/add-node", {
      blueprint: bpName,
      // missing graph and nodeType
    });
    expect(data.error).toBeDefined();
  });

  it("rejects non-existent blueprint", async () => {
    const data = await uePost("/api/add-node", {
      blueprint: "BP_Nonexistent_XYZ_999",
      graph: "EventGraph",
      nodeType: "CallFunction",
      functionName: "PrintString",
    });
    expect(data.error).toBeDefined();
  });

  it("rejects non-existent graph", async () => {
    const data = await uePost("/api/add-node", {
      blueprint: bpName,
      graph: "FakeGraph",
      nodeType: "CallFunction",
      functionName: "PrintString",
    });
    expect(data.error).toBeDefined();
    expect(data.availableGraphs).toBeDefined();
  });
});
