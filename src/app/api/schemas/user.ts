import { z } from "zod";
import { getUser } from "../utils/user";

interface user {
  tier: number;
  name: string;
  address: string;
  dob: string;
  gender: string;
  udid?: string;
  email: string;
  phone: string;
  bloodGroup: string;
  allergies: string[];
  password?: string;
  qualification?: string;
  hospitalId?: string;
  departmentId?: string;
  rating?: number;
}

const userSchema = z.object({
  _id: z.string().min(24).max(24).optional(),
  tier: z.number().min(0).max(4),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  address: z.string().min(1, "Address is required"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),
  gender: z.enum(["Male", "Female", "Other"]),
  udid: z.string().nullable().optional(),
  email: z
    .string()
    .min(1, { message: "Email can't be empty." })
    .email("This is not a valid email."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
  allergies: z.array(z.string()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  qualification: z.string().optional(),
  hospitalId: z.string().min(24).max(24).optional(),
  departmentId: z.string().nullable().optional(),
  rating: z.number().optional(),
});

export type { user };

export { userSchema };
