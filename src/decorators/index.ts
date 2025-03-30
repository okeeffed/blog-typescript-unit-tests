export function controller<T extends { new(...args: any[]): {} }>(constructor: T): T {
	return class extends constructor {
		constructor(...args: any[]) {
			super(...args);
			const proto = constructor.prototype;
			Object.getOwnPropertyNames(proto).forEach((key) => {
				if (key === "constructor") return;
				const method = this[key as keyof typeof this];
				if (typeof method === "function") {
					method.call(this);
				}
			});
		}
	};
}
