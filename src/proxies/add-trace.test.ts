import { IocKeys } from "@/config/ioc-keys";
import type { ILoggerService } from "@/services/logger-service";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { container } from "../config/ioc-test";
import { addTrace, addTraceCurried } from "./add-trace";

class Target {
  needle() {
    return null;
  }

  async needleAsync() {
    return Promise.resolve(null);
  }
}

describe("trace proxies", () => {
  let logger: ILoggerService;

  beforeEach(() => {
    logger = container.get<ILoggerService>(IocKeys.LoggerService);
  });

  describe("addTrace", () => {
    test("invokes two trace logs at the beginning and end of a function", () => {
      const spy = vi.spyOn(logger, "trace");
      const target = addTrace(new Target(), logger);

      expect(target.needle()).toBeNull();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls).toEqual([
        [{ args: [], className: "Target" }, "Target.needle() called"],
        [
          { className: "Target", duration: expect.any(String) },
          "Target.needle() returned",
        ],
      ]);
    });

    test("invokes two trace logs at the beginning and end of an async function", async () => {
      const spy = vi.spyOn(logger, "trace");
      const target = addTrace(new Target(), logger);

      expect(await target.needleAsync()).toBeNull();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls).toEqual([
        [{ args: [], className: "Target" }, "Target.needleAsync() called"],
        [
          { className: "Target", duration: expect.any(String) },
          "Target.needleAsync() returned",
        ],
      ]);
    });
  });

  describe("addTraceCurried", () => {
    test("full application invokes two trace logs at the beginning and end of a function", () => {
      const spy = vi.spyOn(logger, "trace");
      const partiallyAppliedFn = addTraceCurried(logger);
      const target = partiallyAppliedFn(new Target());

      expect(target.needle()).toBeNull();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls).toEqual([
        [{ args: [], className: "Target" }, "Target.needle() called"],
        [
          { className: "Target", duration: expect.any(String) },
          "Target.needle() returned",
        ],
      ]);
    });

    test("invokes two trace logs at the beginning and end of an async function", async () => {
      const spy = vi.spyOn(logger, "trace");
      const partiallyAppliedFn = addTraceCurried(logger);
      const target = partiallyAppliedFn(new Target());

      expect(await target.needleAsync()).toBeNull();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls).toEqual([
        [{ args: [], className: "Target" }, "Target.needleAsync() called"],
        [
          { className: "Target", duration: expect.any(String) },
          "Target.needleAsync() returned",
        ],
      ]);
    });
  });
});
