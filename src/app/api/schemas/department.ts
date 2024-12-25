import { z } from "zod";

interface department {
  name: string;
  location: string;
  hod: string;
  beds: number[];
  doctors: string[];
}

const departmentSchema = z.object({
  _id: z.string().min(24).max(24).optional(),
  name: z
    .string()
    .min(1, "Department name is required")
    .max(150, "Department name too long"),
  location: z.string().optional(),
  hod: z.string().min(1, "Department head name is required"),
  beds: z.array(z.number()),
  doctors: z.array(z.string()),
});

export type { department };

export { departmentSchema };
