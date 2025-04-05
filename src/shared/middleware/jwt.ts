import { jwt as jwtBase } from "hono/jwt";

export const jwt = jwtBase({
  secret: "super-secret",
});
