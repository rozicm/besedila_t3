import { describe, it, expect, beforeEach } from "@jest/globals";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

describe("Songs Router", () => {
  let ctx: ReturnType<typeof createTRPCContext>;

  beforeEach(() => {
    ctx = createTRPCContext({ req: {} as any, resHeaders: new Headers() });
  });

  it("should have list procedure defined", () => {
    expect(appRouter._def.procedures.list).toBeDefined();
  });

  it("should have create procedure defined", () => {
    expect(appRouter._def.procedures.create).toBeDefined();
  });

  it("should have update procedure defined", () => {
    expect(appRouter._def.procedures.update).toBeDefined();
  });

  it("should have delete procedure defined", () => {
    expect(appRouter._def.procedures.delete).toBeDefined();
  });
});

describe("Rounds Router", () => {
  let ctx: ReturnType<typeof createTRPCContext>;

  beforeEach(() => {
    ctx = createTRPCContext({ req: {} as any, resHeaders: new Headers() });
  });

  it("should have list procedure defined", () => {
    expect(appRouter._def.procedures.list).toBeDefined();
  });

  it("should have create procedure defined", () => {
    expect(appRouter._def.procedures.create).toBeDefined();
  });

  it("should have reorderSongs procedure defined", () => {
    expect(appRouter._def.procedures.reorderSongs).toBeDefined();
  });
});


