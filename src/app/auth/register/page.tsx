"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthInput from "~/components/inputField/AuthInput";
import HospitalSearchBox from "~/components/forms/HospitalSearchBox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { ny } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MdArrowOutward } from "react-icons/md";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      address: "",
      dob: "",
      gender: "",
      hasDisability: false,
      udid: "",
      phone: "",
      bloodGroup: "",
      allergies: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      address: Yup.string().required("Address is required"),
      dob: Yup.date().required("Date of birth is required"),
      gender: Yup.string().required("Gender is required"),
      udid: Yup.string().when("hasDisability", {
        is: true,
        then: () =>
          Yup.string()
            .length(18, "Must be 18 characters")
            .required("UDID is required"),
        otherwise: () => Yup.string(),
      }),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Invalid phone number (don't include +91)")
        .required("Phone number is required"),
      bloodGroup: Yup.string().required("Blood group is required"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log("onSubmit triggered with values:", values);
    },
  });

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Handle submission started");

    const errors = await formik.validateForm();
    console.log("Validation errors:", errors);

    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    const formattedData = {
      name: formik.values.name,
      address: formik.values.address,
      dob: format(new Date(formik.values.dob), "yyyy-MM-dd"),
      gender: formik.values.gender,
      udid: formik.values.hasDisability ? formik.values.udid : undefined,
      email: formik.values.email,
      phone: formik.values.phone,
      bloodGroup: formik.values.bloodGroup,
      allergies: formik.values.allergies,
    };

    console.log("Sending data:", formattedData);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      console.log("Response received:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      if (data.result?.val === true) {
        toast({
          title: "Success",
          description: "Registration successful! Please login to continue.",
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.error || "Failed to register",
        });
      }
    } catch (error) {
      console.log("Error during submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  return (
    <main className="scrollbar flex min-h-screen items-center justify-center overflow-y-hidden">
      <div className="scrollbar w-full max-w-[800px] rounded-lg border p-2 md:border md:p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Registration Form</h1>
          <p className="text-muted-foreground">Create your medical account</p>
        </div>

        <form onSubmit={handleSubmission} className="space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <AuthInput
                id="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.name}
                touched={formik.touched.name}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1">
              <AuthInput
                id="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.email}
                touched={formik.touched.email}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <HospitalSearchBox
              onLocationSelect={(location) =>
                formik.setFieldValue("address", location.address)
              }
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-sm text-destructive">
                {formik.errors.address}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={ny(
                      "w-full justify-start text-left font-normal",
                      !formik.values.dob && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formik.values.dob ? (
                      format(new Date(formik.values.dob), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formik.values.dob
                        ? new Date(formik.values.dob)
                        : undefined
                    }
                    onSelect={(date) => formik.setFieldValue("dob", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formik.touched.dob && formik.errors.dob && (
                <div className="text-sm text-destructive">
                  {formik.errors.dob}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                onValueChange={(value) => formik.setFieldValue("gender", value)}
                value={formik.values.gender}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-sm text-destructive">
                  {formik.errors.gender}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasDisability"
                checked={formik.values.hasDisability}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("hasDisability", checked);
                  if (!checked) formik.setFieldValue("udid", "");
                }}
              />
              <Label htmlFor="hasDisability">I have a disability</Label>
            </div>

            {formik.values.hasDisability && (
              <div className="space-y-1">
                <Input
                  id="udid"
                  placeholder="Enter 18-digit UDID number"
                  value={formik.values.udid}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={ny(
                    formik.touched.udid &&
                      formik.errors.udid &&
                      "border-destructive",
                  )}
                />
                {formik.touched.udid && formik.errors.udid && (
                  <div className="text-sm text-destructive">
                    {formik.errors.udid}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <AuthInput
                id="phone"
                label="Phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.phone}
                touched={formik.touched.phone}
                placeholder="XXXXXXXXXX"
              />
            </div>

            <div className="space-y-1">
              <Label className="mt-0">Blood Group</Label>
              <div className="">
                <Select
                  onValueChange={(value) =>
                    formik.setFieldValue("bloodGroup", value)
                  }
                  value={formik.values.bloodGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                      (group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              {formik.touched.bloodGroup && formik.errors.bloodGroup && (
                <div className="text-sm text-destructive">
                  {formik.errors.bloodGroup}
                </div>
              )}
            </div>
          </div>

          <Button
            disabled={formik.isSubmitting || !formik.isValid}
            type="submit"
            className="w-full py-6 font-medium"
          >
            {formik.isSubmitting ? "Creating Account..." : "Create Account"}{" "}
            <MdArrowOutward className="ml-2 text-lg" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
