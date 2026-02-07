import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classname merge utility)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("deduplicates tailwind classes", () => {
    const result = cn("p-4 text-red-500", "p-2");
    expect(result).toBe("text-red-500 p-2");
  });
});
