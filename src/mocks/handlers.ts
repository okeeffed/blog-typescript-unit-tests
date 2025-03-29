// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'
import { PutRecordBody } from '../clients/records-client'

// Define your mock handlers
export const handlers = [
	http.put('https://records.dennisokeeffe.com', async ({ request }) => {
		// Parse the request body
		const payload = await request.json() as PutRecordBody

		// You can conditionally respond based on the payload
		if (payload.type === 'CREATE') {
			return HttpResponse.json(
				{
					id: faker.string.uuid(),
					message: 'Record created successfully'
				},
				{ status: 200 }
			)
		} else if (payload.type === 'DELETE') {
			return HttpResponse.json(
				{
					id: faker.string.uuid(),
					message: 'Record deleted successfully'
				},
				{ status: 200 }
			)
		}

		// Handle any error cases
		return HttpResponse.json(
			{
				message: 'Invalid request type'
			},
			{ status: 400 }
		)
	})
]
