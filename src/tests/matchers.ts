import { sortBy } from "es-toolkit";
// src/tests/sortby-matcher.ts
import { expect } from "vitest";

// Add custom matcher to Vitest's expect
expect.extend({
  /**
   * Compares two arrays after sorting them by specified properties using es-toolkit's sortBy
   * @param received - The array received from the code under test
   * @param expected - The expected array
   * @param sortProps - Properties to sort by, passed directly to es-toolkit's sortBy
   */
  toEqualSortedBy<T extends Record<string, unknown>>(
    received: T[],
    expected: T[],
    sortProps: keyof T | Array<keyof T>,
  ) {
    // Ensure sortProps is an array
    const props = Array.isArray(sortProps) ? sortProps : [sortProps];
    // Sort both arrays using es-toolkit's sortBy
    const sortedReceived = sortBy(received, props as string[]);
    const sortedExpected = sortBy(expected, props as string[]);
    // Check if the sorted arrays are equal
    const pass = this.equals(sortedReceived, sortedExpected);
    const propsDisplay = Array.isArray(sortProps)
      ? `[${String(sortProps).split(",").join(", ")}]`
      : String(sortProps);
    return {
      pass,
      message: () =>
        pass
          ? `Expected arrays not to be equal when sorted by ${propsDisplay}`
          : `Expected arrays to be equal when sorted by ${propsDisplay}\n` +
            `Received (sorted): ${JSON.stringify(sortedReceived, null, 2)}\n` +
            `Expected (sorted): ${JSON.stringify(sortedExpected, null, 2)}`,
      expected: sortedExpected,
      received: sortedReceived,
    };
  },
});

// Extend TypeScript types for the custom matcher with improved type safety
declare module "vitest" {
  interface Assertion<T> {
    /**
     * Compares arrays after sorting by the specified properties
     * @param expected - The expected array after sorting
     * @param sortProps - Properties to sort by
     */
    toEqualSortedBy<U extends Record<string, unknown>>(
      expected: U[],
      sortProps: keyof U | Array<keyof U>,
    ): void;
  }
  interface AsymmetricMatchersContaining {
    /**
     * Compares arrays after sorting by the specified properties
     * @param expected - The expected array after sorting
     * @param sortProps - Properties to sort by
     */
    toEqualSortedBy<U extends Record<string, unknown>>(
      expected: U[],
      sortProps: keyof U | Array<keyof U>,
    ): void;
  }
}
