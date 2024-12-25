"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input2";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      phone: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: values.phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to login");
        }

        sessionStorage.setItem("userData", JSON.stringify(data.user));
        sessionStorage.setItem("otpId", data.otpId);

        toast({
          title: "Success",
          description: data.message,
        });

        router.push("/auth/verification");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Login failed",
        });
      }
    },
  });

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      formik.setFieldValue("phone", value);
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm border p-12 px-12">
        <div className="flex flex-col items-center">
          <h1 className="mb-12 text-2xl font-semibold">
            Login to your account
          </h1>

          <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-md">Phone Number</label>
              <div className="flex items-center gap-2 rounded-md border">
                <Input
                  type="tel"
                  prefix="+91"
                  placeholder="Enter phone number"
                  value={formik.values.phone}
                  onChange={handlePhoneInput}
                  onBlur={formik.handleBlur}
                  maxLength={10}
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-sm text-destructive">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full p-6 font-medium"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
                ? "Sending code..."
                : "Send verification code"}
            </Button>
          </form>

          <span className="mt-8 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="pl-1 text-blue-600 hover:underline"
            >
              Register
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
