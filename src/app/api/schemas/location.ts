import { z } from "zod";

interface location {
  type: string;
  coordinates: [number, number];
}

const locationSchema = z.object({
  type: z.string(),
  coordinates: z.array(z.number()).length(2),
});

export type { location };

export { locationSchema };
