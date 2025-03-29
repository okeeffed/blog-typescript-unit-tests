import type { AxiosError as BaseAxiosError } from "axios";

export class AxiosError {
	readonly _tag = "AxiosError"
	readonly code: BaseAxiosError['code']
	readonly status: BaseAxiosError['status']
	readonly message: BaseAxiosError['message']

	constructor(code: BaseAxiosError['code'], status: BaseAxiosError['status'], message: BaseAxiosError['message']) {
		this.code = code;
		this.status = status;
		this.message = message;
	}
}
