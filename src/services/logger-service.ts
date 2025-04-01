import type pino from "pino";

export type ILoggerService = ReturnType<typeof pino<never>>;
