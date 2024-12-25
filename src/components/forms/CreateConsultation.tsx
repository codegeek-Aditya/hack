"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFormik } from "formik";
import { useHospitals } from "~/hooks/useHospitals";
import { DateTimePicker } from "../date-time-picker";
import { Switch } from "../ui/switch";
import InputField from "../inputField/InputField";
import { Button } from "../ui/button";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";
import { useToast } from "~/hooks/use-toast";
import { ApiError } from "~/lib/api";

interface FormValues {
  startTime: Date | undefined;
  endTime: Date | undefined;
  doctorId: string;
  slotDuration: string;
  isRecurring: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  hospitalId: string;
  departmentId: string;
  // Add other fields as needed
}

const CreateConsultation = () => {
  const { user } = useUser();
  const { hospitals } = useHospitals();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const hospitalId = user?.hospitalId || "NA";

  const getDoctors = async () => {
    try {
      const res = (await api.post("api/admin/getDoctorByHospitalId", {
        hospitalId: hospitalId,
      })) as {
        doctors: Doctor[];
        success: boolean;
        error?: string;
        message?: string;
      };

      if (res.success && Array.isArray(res.doctors)) {
        setDoctors(res.doctors);
      } else {
        console.log("Invalid doctors data:", res);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  const api = useApi();
  const { toast } = useToast();

  const formik = useFormik<FormValues>({
    initialValues: {
      startTime: undefined,
      endTime: undefined,
      doctorId: "",
      slotDuration: "",
      isRecurring: false,
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        const formattedValues = {
          ...values,
          startTime: values.startTime?.toISOString().split(".")[0] + ".000",
          endTime: values.endTime?.toISOString().split(".")[0] + ".000",
          hospitalId: hospitalId,
        };

        const res = (await api.post(
          "api/hospital/consultation/create",
          formattedValues,
        )) as {
          success: boolean;
          error?: string;
          message?: string;
          result?: {
            consultation: any;
            insertedId: string;
          };
        };

        if (!res.success) {
          toast({
            title: "Error",
            description: res.error || res.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description:
            res.message || "Consultation has been created successfully",
        });

        formik.resetForm();
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const DefaultDate = new Date();
  DefaultDate.setMonth(DefaultDate.getMonth());
  DefaultDate.setHours(13, 14, 0, 0);

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid w-full grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Start Time *
          </label>
          <DateTimePicker
            value={formik.values.startTime}
            defaultPopupValue={DefaultDate}
            onChange={(date) => formik.setFieldValue("startTime", date)}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            End Time *
          </label>
          <DateTimePicker
            value={formik.values.endTime}
            defaultPopupValue={DefaultDate}
            onChange={(date) => formik.setFieldValue("endTime", date)}
            className="w-full"
          />
        </div>
      </div>
      <div className={`grid w-full grid-cols-1 gap-4`}>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Doctor *
          </label>
          <Select
            onValueChange={(value) => {
              formik.setFieldValue("doctorId", value);
            }}
            value={formik.values.doctorId || "placeholder"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Choose a doctor
              </SelectItem>
              {doctors &&
                doctors.map((doctor: Doctor) => (
                  <SelectItem
                    key={doctor._id}
                    value={doctor._id || ""}
                    className="py-3"
                  >
                    <div className="font-medium">{doctor.name}</div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`grid w-full grid-cols-2 gap-4`}>
        <div className="space-y-1">
          <InputField
            type="number"
            id="slotDuration"
            label="Slot Duration (minutes) *"
            value={formik.values.slotDuration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.slotDuration}
            touched={formik.touched.slotDuration}
            placeholder="Enter slot duration"
          />
        </div>
        <div className="flex items-center space-y-1">
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={formik.values.isRecurring}
              onCheckedChange={(checked) =>
                formik.setFieldValue("isRecurring", checked)
              }
            />
            <label
              htmlFor="isRecurring"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Recurring Consultation
            </label>
          </div>
        </div>
      </div>
      <Button
        className="w-full py-6"
        onClick={() => formik.handleSubmit()}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Consultation"}
      </Button>
    </div>
  );
};

export default CreateConsultation;
