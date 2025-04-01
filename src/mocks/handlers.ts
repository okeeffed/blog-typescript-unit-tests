import { faker } from "@faker-js/faker";
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type { PutRecordBody } from "../clients/records-client";

// Define your mock handlers
export const handlers = [
  http.put("https://records.dennisokeeffe.com", async ({ request }) => {
    // Parse the request body
    const payload = (await request.json()) as PutRecordBody;

    // You can conditionally respond based on the payload
    switch (payload.type) {
      case "CREATE":
        return HttpResponse.json(
          {
            id: faker.string.uuid(),
            message: "Record created successfully",
          },
          { status: 200 },
        );
      case "DELETE":
        return HttpResponse.json(
          {
            id: faker.string.uuid(),
            message: "Record deleted successfully",
          },
          { status: 200 },
        );
      default:
        // Handle any error cases
        return HttpResponse.json(
          {
            message: "Invalid request type",
          },
          { status: 400 },
        );
    }
  }),
];
