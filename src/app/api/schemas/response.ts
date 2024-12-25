import { z } from "zod";

interface response {
  val: boolean;
  acknowledged?: boolean;
  insertedId?: string;
  message?: string;
  errors?: z.ZodIssue[];
}

export type { response };
