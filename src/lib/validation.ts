import * as yup from "yup";
import { z } from "zod";

export const loginSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email"),
  name: yup.string().min(3, "Name must be at least 3 characters"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
});

export type LoginValues = yup.InferType<typeof loginSchema>;



//register form schema
export const RegisterSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  address: z.string().optional(),
  dateOfBirth: z.string().min(1, {
    message: "Please select a date of birth.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  disability: z.string().max(18).optional(),
  bloodGroup: z.string().min(1, {
    message: "Please select a blood group.",
  }),
  allergies: z.string().optional(),
});

export const OTPSchema = z.object({
  pin: z
    .string()
    .min(6, {
      message: "Invalid OTP",
    })
    .refine((value) => /^\d+$/.test(value), {
      message: "Invalid OTP",
    }),
});
