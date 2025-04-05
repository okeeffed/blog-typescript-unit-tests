import { z } from "@hono/zod-openapi";

export const baseGetHeaders = z.object({
  "X-Correlation-Id": z.string().uuid().optional(),
});

export const basePostHeaders = z.object({
  "X-Correlation-Id": z.string().uuid().optional(),
  "X-Idempotency-Key": z.string().uuid(),
});
