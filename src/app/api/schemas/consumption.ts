import { z } from "zod";

interface consumption {
  monthYear: string;
  quantity: number;
  inventoryId?: string;
}

const consumptionSchema = z.object({
  id: z.string().min(24).max(24, "ID must be 24 characters long").optional(),
  monthYear: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "MonthYear must be in MM/YYYY format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  inventoryId: z.string().min(24).max(24, "ID must be 24 characters long").optional(),
});

export type { consumption };

export { consumptionSchema };