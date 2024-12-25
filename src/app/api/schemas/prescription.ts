import * as z from "zod";

interface prescription {
  userId: string;
  doctorId: string;
  inventory: {
    id: string;
    name: string;
    quantity: number;
  };
  caseId?: string;
  price: number;
}

const prescriptionSchema = z.object({
  _id: z.string().min(24).max(24).optional(),
  userId: z.string().min(24).max(24),
  doctorId: z.string().min(24).max(24),
  inventory: z.object({
    id: z.string().min(24).max(24),
    name: z.string(),
    quantity: z.number(),
  }),
  caseId: z.string().min(24).max(24).optional(),
  price: z.number(),
});

export type { prescription };

export { prescriptionSchema };
