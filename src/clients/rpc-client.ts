import type { ApiFetcherArgs } from "@ts-rest/core";
import axios, { isAxiosError } from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { merge } from "es-toolkit";

const BASE_MS = 100;
const MAX_MS = 10000;
const JITTER_FACTOR = 0.5;

interface TsRestClientConfig {
  span?: { name: string; options?: Record<string, unknown> };
  shouldRetry?: (error: AxiosError) => boolean; // Custom function to determine retry
  retries?: number;
  timeout?: number; // in milliseconds
  retryableStatuses?: number[]; // Add specific status codes to retry
  retryDelay?: {
    baseMs?: number; // Base delay in milliseconds (default: 100)
    maxMs?: number; // Maximum delay cap in milliseconds (default: 10000)
    jitterFactor?: number; // How much jitter to add (0-1, default: 0.5)
  };
}

type ExtendedApiFetcherArgs = TsRestClientConfig & ApiFetcherArgs;

const configDefaults = {
  retries: 0,
  retryDelay: {
    baseMs: BASE_MS,
    maxMs: MAX_MS,
    jitterFactor: JITTER_FACTOR,
  },
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export class TsRestClient {
  private config: TsRestClientConfig;
  private axiosRequestConfig: AxiosRequestConfig;

  constructor(
    config: TsRestClientConfig = {},
    axiosRequestConfig: AxiosRequestConfig = {},
  ) {
    this.config = config;
    this.axiosRequestConfig = axiosRequestConfig;
  }

  public async handler(extendedApiFetcherArgs: ExtendedApiFetcherArgs) {
    return this.tryExecute({
      extendedApiFetcherArgs,
      attempt: 0,
    });
  }

  // @ts-expect-error: let it infer
  private async tryExecute({
    extendedApiFetcherArgs,
    attempt,
  }: {
    extendedApiFetcherArgs: ExtendedApiFetcherArgs;
    attempt: number;
  }) {
    const args = merge(this.config, extendedApiFetcherArgs);
    const {
      span,
      timeout,
      retries = configDefaults.retries,
      retryDelay = configDefaults.retryDelay,
    } = args;

    try {
      const axiosConfig: AxiosRequestConfig = {
        ...this.axiosRequestConfig,
        url: args.path,
        method: args.method,
        headers: args.headers,
        data: args.body,
        timeout,
      };

      const response = await axios(axiosConfig);

      if (span) {
        // TODO: End span
      }

      return {
        headers: response.headers,
        status: response.status,
        body: response.data,
      };
    } catch (error) {
      if (attempt < retries && this.isRetryable(error)) {
        const baseDelay = 2 ** (attempt + 1) * (retryDelay.baseMs ?? BASE_MS);
        const jitter =
          1 -
          (retryDelay.jitterFactor ?? JITTER_FACTOR) +
          Math.random() * 2 * (retryDelay.jitterFactor ?? JITTER_FACTOR);
        const delay = Math.min(
          Math.floor(baseDelay * jitter),
          retryDelay.maxMs ?? MAX_MS,
        );

        console.log(
          `Retrying in ${delay}ms (attempt ${attempt + 1} of ${retries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.tryExecute({
          extendedApiFetcherArgs,
          attempt: attempt + 1,
        });
      }

      if (span) {
        // TODO: End span
      }

      if (isAxiosError(error) && error.response) {
        return {
          headers: error.response.headers,
          status: error.response.status,
          body: error.response.data,
        };
      }

      throw error;
    }
  }

  private isRetryable(error: unknown): boolean {
    if (this.config.shouldRetry && isAxiosError(error))
      return this.config.shouldRetry(error);
    if (isAxiosError(error)) {
      return (
        !error.response ||
        (
          this.config.retryableStatuses ?? configDefaults.retryableStatuses
        ).includes(error.response.status)
      );
    }
    return (
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("network") ||
        error.message.includes("connection"))
    );
  }
}
