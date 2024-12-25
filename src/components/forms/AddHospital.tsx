import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import HospitalLocationMap from "./HospitalLocationMap";
import { GoPlus } from "react-icons/go";
import HospitalSearchBox from "./HospitalSearchBox";
import { useToast } from "~/hooks/use-toast";
import { useApi } from "~/hooks/useApi";

interface Department {
  name: string;
  beds: string;
  location: string;
}

interface FormValues {
  name: string;
  address: string;
  director: string;
  email: string;
  phone: string;
  location: {
    lat: number | null;
    lng: number | null;
  };
  departments: Department[];
}

const departmentValidationSchema = yup.object().shape({
  departments: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Department name is required"),
      beds: yup.string().required("Number of beds is required"),
      location: yup.string().required("Location is required"),
    }),
  ),
});

const basicInfoValidationSchema = yup.object({
  name: yup.string().required("Hospital name is required").max(150),
  address: yup.string().required("Address is required"),
  director: yup.string().required("Director name is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  phone: yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits"),
  location: yup.object().shape({
    lat: yup.number().required("Location is required"),
    lng: yup.number().required("Location is required"),
  }),
});

interface Location {
  lat: number;
  lng: number;
}

const AddHospital = () => {
  const [step, setStep] = useState(1);
  const [hospitalId, setHospitalId] = useState("");
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const api = useApi();

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address?: string;
  }) => {
    setSelectedLocation({ lat: location.lat, lng: location.lng });
    formik.setFieldValue("location", { lat: location.lat, lng: location.lng });
    if (location.address) {
      formik.setFieldValue("address", location.address);
    }
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      address: "",
      director: "",
      email: "",
      phone: "",
      location: {
        lat: null as number | null,
        lng: null as number | null,
      },
      departments: [
        { name: "", beds: "", location: "" },
        { name: "", beds: "", location: "" },
      ],
    },
    validationSchema:
      step === 1 ? basicInfoValidationSchema : departmentValidationSchema,
    onSubmit: async (values) => {
      if (step === 1) {
        if (!values.location.lat || !values.location.lng) {
          formik.setFieldError("location", "Please select a location");
          return;
        }

        try {
          const hospitalData = {
            name: values.name,
            address: values.address,
            director: values.director,
            email: values.email,
            phone: values.phone,
            lat: values.location.lat,
            long: values.location.lng,
            departments: [],
            consumables: [],
            equipments: [],
            inventory: [],
          };

          const response = await api.post("/api/hospital/create", hospitalData);

          console.log("API Response:", response);

          if ((response as any).success) {
            const newHospitalId = (response as any).response.hospital._id;
            setHospitalId(newHospitalId);
            toast({
              title: "Success",
              description:
                (response as any).message || "Hospital created successfully",
              variant: "default",
            });
            setTimeout(() => setStep(2), 0);
          } else {
            toast({
              title: "Error",
              description:
                (response as any).error ||
                (response as any).message ||
                "Failed to create hospital",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to connect to server",
            variant: "destructive",
          });
        }
      } else {
        try {
          const departmentPromises = values.departments.map(async (dept) => {
            const departmentData = {
              hospitalId,
              name: dept.name,
              location: dept.location,
              hod: "TBD",
              beds: new Array(Number(dept.beds)).fill(0),
              doctors: [],
            };

            const response = await api.post(
              "/api/hospital/createDepartment",
              departmentData,
            );

            return response;
          });

          const results = await Promise.all(departmentPromises);

          const allSuccess = results.every((result) => (result as any).success);

          if (allSuccess) {
            toast({
              title: "Success",
              description: "All departments added successfully",
            });
          } else {
            toast({
              title: "Warning",
              description: "Some departments failed to be added",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error creating departments:", error);
          toast({
            title: "Error",
            description: "Failed to add departments",
            variant: "destructive",
          });
        }
      }
    },
  });

  const addDepartment = () => {
    formik.setFieldValue("departments", [
      ...formik.values.departments,
      { name: "", beds: "", location: "" },
    ]);
  };

  const removeDepartment = (index: number) => {
    const newDepartments = formik.values.departments.filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("departments", newDepartments);
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const newDepartments = [...formik.values.departments];
    newDepartments[index] = { ...newDepartments[index], [field]: value };
    formik.setFieldValue("departments", newDepartments);
  };

  if (step === 1) {
    return (
      <div className="container mx-auto p-2">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Add New Hospital - Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Hospital Name</Label>
                    <Input
                      id="name"
                      {...formik.getFieldProps("name")}
                      className={
                        formik.errors.name && formik.touched.name
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-sm text-red-500">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="director">Director Name</Label>
                    <Input
                      id="director"
                      {...formik.getFieldProps("director")}
                      className={
                        formik.errors.director && formik.touched.director
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.director && formik.errors.director && (
                      <div className="text-sm text-red-500">
                        {formik.errors.director}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...formik.getFieldProps("email")}
                      className={
                        formik.errors.email && formik.touched.email
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-sm text-red-500">
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...formik.getFieldProps("phone")}
                      className={
                        formik.errors.phone && formik.touched.phone
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="text-sm text-red-500">
                        {formik.errors.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Location Search</Label>
                    <HospitalSearchBox
                      onLocationSelect={handleLocationSelect}
                    />
                    {formik.touched.location && formik.errors.location && (
                      <div className="text-sm text-red-500">
                        {typeof formik.errors.location === "string"
                          ? formik.errors.location
                          : "Please select a location"}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Next
                  </Button>
                </div>

                <div className="h-[500px] rounded-lg border">
                  <HospitalLocationMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add Departments</CardTitle>
          <p className="text-md text-muted-foreground">
            Add departments and their capacity details
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="max-h-[60vh] min-h-[400px] space-y-4 overflow-y-auto rounded-lg border bg-gray-50/50 p-4">
              {formik.values.departments.map((dept, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-12 gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all"
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-red-500"
                    onClick={() => removeDepartment(index)}
                  >
                    &times;
                  </button>
                  <div className="col-span-5">
                    <Label className="text-sm font-medium">
                      Department Name
                    </Label>
                    <Input
                      value={dept.name}
                      onChange={(e) =>
                        updateDepartment(index, "name", e.target.value)
                      }
                      placeholder="e.g., Cardiology"
                      className="mt-1"
                    />
                    {formik.touched.departments?.[index]?.name &&
                      typeof formik.errors.departments?.[index] === "object" &&
                      "name" in formik.errors.departments[index] && (
                        <div className="text-sm text-red-500">
                          {
                            (formik.errors.departments[index] as Department)
                              .name
                          }
                        </div>
                      )}
                  </div>
                  <div className="col-span-5">
                    <Label className="text-sm font-medium">Location</Label>
                    <Input
                      value={dept.location}
                      onChange={(e) =>
                        updateDepartment(index, "location", e.target.value)
                      }
                      placeholder="e.g., Ward 2, Room 3"
                      className="mt-1"
                    />
                    {formik.touched.departments?.[index]?.location &&
                      typeof formik.errors.departments?.[index] === "object" &&
                      "location" in formik.errors.departments[index] && (
                        <div className="text-sm text-red-500">
                          {
                            (formik.errors.departments[index] as Department)
                              .location
                          }
                        </div>
                      )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Beds</Label>
                    <Input
                      type="number"
                      value={dept.beds}
                      onChange={(e) =>
                        updateDepartment(index, "beds", e.target.value)
                      }
                      placeholder="20"
                      className="mt-1"
                    />
                    {formik.touched.departments?.[index]?.beds &&
                      typeof formik.errors.departments?.[index] === "object" &&
                      "beds" in formik.errors.departments[index] && (
                        <div className="text-sm text-red-500">
                          {
                            (formik.errors.departments[index] as Department)
                              .beds
                          }
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed hover:border-solid"
                onClick={addDepartment}
              >
                <GoPlus className="mr-2" /> Add Another Department
              </Button>

              <Button type="submit" className="w-full" size="lg">
                Save Hospital Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddHospital;
