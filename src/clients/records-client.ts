import axios, { isAxiosError } from 'axios';
import { ok, err } from 'neverthrow'
import { AxiosError } from '../errors/axios-error';
import { injectable } from 'inversify';

export interface PutRecordBody {
	type: "CREATE" | "DELETE"
	data: string
}

interface PutRecordResponse {
	id: string
	message: string
}

@injectable()
export class RecordsClient {
	/**
	 * PUT a record to the records API. Unexpected defects are thrown.
	 * 
	 * @param payload - The payload to send to the records API
	 */
	async putRecord(payload: PutRecordBody) {
		try {
			const result = await axios.put<PutRecordResponse>('https://records.dennisokeeffe.com', payload);
			return ok({
				id: result.data.id
			})
		} catch (e) {
			if (isAxiosError(e)) {
				return err(new AxiosError(e.code, e.status, e.message))
			}

			throw e
		}
	}
}
