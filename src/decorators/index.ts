/**
 * A decorator designed to auto-run all of your methods after the constructor.
 * Designed to only be used with controller classes that expose entry-point
 * methods for an API. Be aware that you will get unexpected outcomes if you
 * declare methods (private or public) on your Controller class that are NOT
 * designed to add routes to your Hono controller.
 *
 * @experimental
 */
export function controller<T extends { new(...args: any[]): {} }>(constructor: T): T {
	return class extends constructor {
		constructor(...args: any[]) {
			super(...args);
			const proto = constructor.prototype;
			setTimeout(() => {
				Object.getOwnPropertyNames(proto).forEach((key) => {
					if (key === "constructor") return;
					const method = this[key as keyof typeof this];
					if (typeof method === "function") {
						method.call(this);
					}
				});
			}, 0);
		}
	};
}

