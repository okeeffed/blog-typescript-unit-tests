// src/tests/sortby-matcher.ts
import { expect } from 'vitest';
import { sortBy } from 'es-toolkit';

// Add custom matcher to Vitest's expect
expect.extend({
	/**
	 * Compares two arrays after sorting them by specified properties using es-toolkit's sortBy
	 * @param received - The array received from the code under test
	 * @param expected - The expected array
	 * @param sortProps - Properties to sort by, passed directly to es-toolkit's sortBy
	 */
	toEqualSortedBy(
		received: any[],
		expected: any[],
		sortProps: string | string[]
	) {
		// Ensure sortProps is an array
		const props = Array.isArray(sortProps) ? sortProps : [sortProps];

		// Sort both arrays using es-toolkit's sortBy
		const sortedReceived = sortBy(received, props);
		const sortedExpected = sortBy(expected, props);

		// Check if the sorted arrays are equal
		const pass = this.equals(sortedReceived, sortedExpected);

		const propsDisplay = Array.isArray(sortProps)
			? `[${sortProps.join(', ')}]`
			: sortProps;

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
declare module 'vitest' {
	interface Assertion<T = any> {
		/**
		 * Compares arrays after sorting by the specified properties
		 */
		toEqualSortedBy<U extends any[]>(expected: U, sortProps: string | string[]): void;
	}
	interface AsymmetricMatchersContaining {
		/**
		 * Compares arrays after sorting by the specified properties
		 */
		toEqualSortedBy<U extends any[]>(expected: U, sortProps: string | string[]): void;
	}
}
