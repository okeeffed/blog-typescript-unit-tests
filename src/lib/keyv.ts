import Keyv from 'keyv';
import { createKeyv } from "@keyv/valkey";

let keyvInstance: Keyv | null = null;

export function getKeyv(): Keyv {
	if (!keyvInstance) {
		// This will only be called after process.env.VALKEY_URL is set (e.g., in your globalSetup)
		keyvInstance = createKeyv(process.env.VALKEY_URL!)
	}
	return keyvInstance;
}


