"use client";
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
import { useState } from "react";
import { useHospitals } from "~/hooks/useHospitals";
import { useApi } from "~/hooks/useApi";
import { Loader2 } from "lucide-react";
import { ApiError } from "~/lib/api";

export default function CreateUserForm({
  tier,
  onSuccess,
}: {
  tier: number;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const api = useApi();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedHospitalDepts, setSelectedHospitalDepts] = useState<
    Array<{
      _id: string;
      name: string;
      location: string;
      hod: string;
    }>
  >([]);

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
      hospitalId: "",
      departmentId: "",
      qualification: "",
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        const filteredValues = Object.fromEntries(
          Object.entries(values).filter(([_, value]) => value !== ""),
        );

        const dataToSubmit = {
          ...filteredValues,
          allergies: [],
          ...(tier !== 0 && { tier: tier, password: "medilink" }),
        };

        console.log("Submitting data:", dataToSubmit);

        const endpoint =
          tier === 0 ? "api/auth/register" : "api/admin/createUser";
        const res = (await api.post(endpoint, dataToSubmit)) as {
          success: boolean;
        };

        if (res.success) {
          toast({
            title: "Account created",
            description: "User has been created successfully",
          });
          onSuccess?.();
          return { success: true, message: "User created successfully" };
        }
      } catch (error) {
        console.log("Caught error:", error);

        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "An unexpected error occurred";

        toast({
          title: "Failed to create user",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, message: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { hospitals, isLoading } = useHospitals();

  return (
    <main className="scrollbar flex w-full items-center justify-center overflow-y-hidden">
      <div className="scrollbar w-full rounded-lg p-2 md:p-6">
        <form
          onSubmit={formik.handleSubmit}
          className="w-full space-y-6"
          noValidate
        >
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

          <div
            className={`grid w-full ${tier === 3 ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div className={`space-y-1 ${tier == 0 ? "hidden" : ""}`}>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Hospital
              </label>
              <Select
                onValueChange={(value) => {
                  formik.setFieldValue("hospitalId", value);
                  formik.setFieldValue("departmentId", "");
                  const selectedHospital = hospitals.find(
                    (h) => h._id === value,
                  );
                  setSelectedHospitalDepts(
                    selectedHospital?.departments?.map((d) => ({
                      _id: d._id || "",
                      name: d.name,
                      location: d.location || "",
                      hod: d.hod || "",
                    })) || [],
                  );
                }}
                value={formik.values.hospitalId || "placeholder"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Choose a hospital
                  </SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem
                      key={hospital._id}
                      value={hospital._id || ""}
                      className="py-3"
                    >
                      <div className="font-medium">{hospital.name}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.hospitalId && formik.errors.hospitalId && (
                <div className="text-sm text-destructive">
                  {formik.errors.hospitalId}
                </div>
              )}
            </div>

            {(tier === 1 || tier === 2) && (
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select department
                </label>
                <Select
                  onValueChange={(value) => {
                    formik.setFieldValue("departmentId", value);
                  }}
                  value={formik.values.departmentId || "placeholder"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Choose a department
                    </SelectItem>
                    {selectedHospitalDepts.map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="py-3"
                      >
                        <div className="font-medium">{dept.name}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.departmentId && formik.errors.departmentId && (
                  <div className="text-sm text-destructive">
                    {formik.errors.departmentId}
                  </div>
                )}
              </div>
            )}
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={ny(
                      "justify-start text-left font-normal",
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
                    onSelect={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split("T")[0];
                        formik.setFieldValue("dob", formattedDate);
                      }
                    }}
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

            <div className="flex flex-col space-y-2">
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

            <div className="flex flex-col space-y-2">
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

          <div className={`space-y-4 ${tier === 0 ? "" : "hidden"}`}>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasDisability"
                checked={formik.values.hasDisability}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("hasDisability", checked);
                  if (!checked) formik.setFieldValue("udid", "");
                }}
              />
              <Label htmlFor="hasDisability">User has a disability</Label>
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
            <div className="space-y-2">
              <AuthInput
                id="qualification"
                label={tier === 1 ? "Qualification" : "Role of the user"}
                value={formik.values.qualification}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.qualification}
                touched={formik.touched.qualification}
                placeholder={`Enter your ${tier === 1 ? "qualification" : "role"}`}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-6 font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Creating user</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              `Create ${
                tier === 1
                  ? "Doctor account"
                  : tier == 0
                    ? "Patient account"
                    : tier == 2
                      ? "Nurse account"
                      : "Admin account"
              }`
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
