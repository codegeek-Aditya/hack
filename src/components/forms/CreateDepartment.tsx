import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface DepartmentValues {
  name: string;
  beds: string;
  location: string;
}

const departmentValidationSchema = yup.object().shape({
  name: yup.string().required("Department name is required"),
  beds: yup.string().required("Number of beds is required"),
  location: yup.string().required("Location is required"),
});

const CreateDepartment = () => {
  const formik = useFormik<DepartmentValues>({
    initialValues: {
      name: "",
      beds: "",
      location: "",
    },
    validationSchema: departmentValidationSchema,
    onSubmit: (values) => {
      const numberOfBeds = parseInt(values.beds, 10);
      const bedsArray = Array(numberOfBeds).fill(0);
      const finalData = {
        ...values,
        beds: bedsArray,
      };
      console.log("Department Data:", finalData);
    },
  });

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4 rounded-lg border p-4">
            <div className="grid grid-cols-12 gap-4 rounded-lg p-4 shadow-sm">
              <div className="col-span-5">
                <Label className="text-sm font-medium">Department Name</Label>
                <Input
                  {...formik.getFieldProps("name")}
                  placeholder="e.g., Cardiology"
                  className="mt-1"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-sm text-red-500">
                    {formik.errors.name}
                  </div>
                )}
              </div>

              <div className="col-span-5">
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  {...formik.getFieldProps("location")}
                  placeholder="e.g., Ward 2, Room 3"
                  className="mt-1"
                />
                {formik.touched.location && formik.errors.location && (
                  <div className="text-sm text-red-500">
                    {formik.errors.location}
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-medium">Beds</Label>
                <Input
                  type="number"
                  {...formik.getFieldProps("beds")}
                  placeholder="2"
                  className="mt-1"
                />
                {formik.touched.beds && formik.errors.beds && (
                  <div className="text-sm text-red-500">
                    {formik.errors.beds}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button type="submit" className="w-full py-6">
              Create Department
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDepartment;
