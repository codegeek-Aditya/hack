"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { useUser } from "~/hooks/useUser";

export default function VerificationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { initializeUserSession } = useUser();

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    const otpId = sessionStorage.getItem("otpId");

    if (!userData || !otpId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login first",
      });
      router.push("/auth/login");
    }
  }, [router, toast]);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, "Must be exactly 6 digits")
        .required("OTP is required"),
    }),
    onSubmit: async (values) => {
      try {
        const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        const otpId = sessionStorage.getItem("otpId");

        const response = await fetch("/api/auth/verifyOtp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otpId: otpId,
            otp: parseInt(values.otp),
            user: userData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        if (!data.user || !data.user._id) {
          throw new Error("Invalid user data received");
        }

        localStorage.setItem("userId", data.user._id);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        initializeUserSession(data.user, data.accessToken, data.refreshToken);

        sessionStorage.clear();

        toast({
          title: "Success",
          description: data.message,
        });

        setTimeout(() => {
          router.push("/user/appointments");
        }, 100);
      } catch (error) {
        console.log("Verification error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Verification failed",
        });
      }
    },
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }
  };

  return (
    <main className="flex h-screen items-center justify-center rounded-lg px-2">
      <div className="w-full max-w-[420px] rounded-lg border p-12">
        <div className="flex flex-col items-center">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">OTP Verification</h1>
            <p className="text-lg text-muted-foreground">
              Enter verification code sent to your phone
            </p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="my-10 w-full space-y-6"
          >
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={formik.values.otp}
                onChange={(value) => formik.setFieldValue("otp", value)}
                onBlur={formik.handleBlur}
                className="gap-2"
                pattern="\d*"
                inputMode="numeric"
                onKeyDown={handleKeyPress}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, index) => (
                    <>
                      {index === 3 && <InputOTPSeparator />}
                      <InputOTPSlot
                        key={index}
                        index={index}
                        style={{
                          width: "60px",
                          height: "52px",
                          fontSize: "20px",
                        }}
                      />
                    </>
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {formik.touched.otp && formik.errors.otp && (
                <div className="text-sm text-destructive">
                  {formik.errors.otp}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-6 font-bold"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <div className="">
            Didn&apos;t receive OTP?{" "}
            <button
              onClick={() => {
                toast({
                  title: "Info",
                  description: "Resending OTP",
                });
              }}
              className="text-blue-600 hover:underline"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
