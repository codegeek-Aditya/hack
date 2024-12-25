import { z } from "zod";

interface Case {
  bedIndex: number;
  hospitalId: string;
  departmentId: string;
  userId: string;
  userName: string;
  ailment: string[];
  documents: string[];
  prescriptions: string[];
  doctorId: string;
  doctorName: string;
  resolved: boolean;
  consultantId?: string | null;
  admittedAt?: string;
  dischargedAt?: string | null;
}

const caseSchema = z.object({
  _id: z.string().min(24).max(24).optional(),
  bedIndex: z.number().min(0).max(20),
  hospitalId: z.string().min(24).max(24),
  departmentId: z.string().min(24).max(24),
  userId: z.string().min(24).max(24),
  userName: z.string().min(3).max(100),
  ailment: z.array(z.string()),
  documents: z.array(z.string()),
  prescriptions: z.array(z.string()),
  doctorId: z.string().min(24).max(24),
  doctorName: z.string().min(3).max(100),
  resolved: z.boolean(),
  consultantId: z.nullable(z.string().min(24).max(24).optional()),
  admittedAt: z.string().optional().nullable(),
  dischargedAt: z.string().optional().nullable(),
});

export type { Case };

export { caseSchema };
