import { z } from "zod";
import { departmentSchema, type department } from "./department";
import { locationSchema, location } from "./location";

interface Slot {
  notified: boolean;
  elapsed: boolean;
  users: { userId: string; priority: number }[];
  onlineCount: number;
  startTime: Date;
  endTime: Date;
}

interface Consultation {
  hospitalId: string;
  hospitalName: string;
  location: location;
  doctorId: string;
  doctorName: string;
  speciality: string;
  dateTime: Date;
  recurring: boolean;
  recurringConfig: { paused: boolean; frequency: string; nextDateTime: Date };
  slots: Slot[];
  slotDuration: number;
}

const hospitalSchema = z.object({
  _id: z.string().min(24).max(24).optional(),
  name: z
    .string()
    .min(1, "Hospital name is required")
    .max(150, "Hospital name too long"),
  address: z.string().min(1, "Address is required"),
  location: locationSchema,
  director: z.string().min(1, "Director name is required"),
  email: z
    .string()
    .min(1, { message: "Email can't be empty." })
    .email("This is not a valid email."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
  cases: z.array(z.string()),
  departments: z.array(departmentSchema),
  inventory: z.array(z.string()),
  equipments: z.array(z.string()),
});

export type { Consultation, Slot };

export { hospitalSchema };
