"use client";

import React, { useEffect, useState } from "react";
import ChartLayout from "~/components/ChartLayout";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import { DataTable } from "~/components/DataTable";
import { LeftChart } from "~/components/charts/LeftChart";
import AddHospital from "~/components/forms/AddHospital";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useApi } from "~/hooks/useApi";
import { Hospital } from "~/lib/types";
import { useHospitals } from "~/hooks/useHospitals";

const HospitalsPage = () => {
  const { hospitals, isLoading, error } = useHospitals();

  const calculateHospitalStats = (hospital: Hospital) => {
    if (!hospital.departments || hospital.departments.length === 0) {
      return {
        bedsAvailable: "0/0",
        occupancy: "0%",
      };
    }

    const totalBeds = hospital.departments.reduce(
      (total, dept) => total + (dept.beds?.length || 0),
      0,
    );
    const occupiedBeds = hospital.departments.reduce(
      (total, dept) =>
        total + (dept.beds?.filter((bed) => bed === 1).length || 0),
      0,
    );
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyPercentage =
      totalBeds === 0
        ? "0%"
        : `${Math.round((occupiedBeds / totalBeds) * 100)}%`;

    return {
      bedsAvailable: `${availableBeds}/${totalBeds}`,
      occupancy: occupancyPercentage,
    };
  };

  const HospitalDetails = ({ hospital }: { hospital: Hospital }) => (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">{hospital.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Contact Information</h3>
          <p>
            <span className="font-medium">Director:</span> {hospital.director}
          </p>
          <p>
            <span className="font-medium">Email:</span> {hospital.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {hospital.phone}
          </p>
          <p>
            <span className="font-medium">Address:</span> {hospital.address}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Departments</h3>
          {hospital.departments && hospital.departments.length > 0 ? (
            <ul className="list-disc space-y-2 pl-4">
              {hospital.departments.map((dept) => (
                <li key={dept._id}>
                  <div className="space-y-1">
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm">HOD: {dept.hod}</p>
                    <p className="text-sm">Location: {dept.location}</p>
                    <p className="text-sm">
                      Beds: {dept.beds?.length || 0} (Available:{" "}
                      {dept.beds?.filter((b) => b === 0).length || 0})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No departments available</p>
          )}
        </div>
      </div>
    </div>
  );

  const tableData = hospitals.map((hospital) => ({
    ...hospital,
    bedsAvailable: calculateHospitalStats(hospital).bedsAvailable,
    occupancy: calculateHospitalStats(hospital).occupancy,
  }));

  const hospitalColumns = [
    { header: "Hospital Name", accessorKey: "name" },
    {
      header: "Location",
      accessorKey: "address",
      // truncate: 20,
      split: ",",
    },
    {
      header: "Beds Available",
      accessorKey: "bedsAvailable",
    },
    {
      header: "Occupancy",
      accessorKey: "occupancy",
      cell: ({ row }: { row: any }) => {
        const occupancyValue = parseInt(row.original.occupancy);
        return (
          <span
            className={occupancyValue > 75 ? "text-red-500" : "text-green-500"}
          >
            {row.original.occupancy}
          </span>
        );
      },
    },
  ];

  const [openAddHospital, setOpenAddHospital] = useState(false);

  const ViewDetailsContent = ({ row }: { row: Hospital & { id: string } }) => (
    <div>
      <HospitalDetails
        hospital={{
          id: row.id,
          name: row.name,
          address: row.address,
          location: row.location,
          director: row.director,
          email: row.email,
          phone: row.phone,
          departments: row.departments || [],
          inventory: row.inventory || [],
          equipments: row.equipments || [],
          cases: row.cases || [],
          availableBeds: row.availableBeds || 0,
        }}
      />
    </div>
  );

  const LeftContent = (
    <div className="flex w-full flex-col gap-8">
      <div className="header mt-2 flex w-full justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Hospitals</h2>
          <p className="ml-[-1px] text-sm text-muted-foreground">
            Manage all the hospitals
          </p>
        </div>
        <Button
          onClick={() => setOpenAddHospital(true)}
          className="flex items-center justify-center gap-x-2"
          variant="outline"
        >
          <span className="mt-0.5">Add Hospital</span>
          <GoPlus className="text-lg" />
        </Button>
      </div>

      <Dialog open={openAddHospital} onOpenChange={setOpenAddHospital}>
        <DialogContent className="w-full max-w-[90vw] md:max-w-[900px]">
          <AddHospital />
        </DialogContent>
      </Dialog>

      <DataTable
        data={tableData}
        columns={hospitalColumns}
        showActions
        searchKey="name"
        searchPlaceholder="Search hospital name"
        actionItems={[
          {
            label: "View Details",
            onClick: (row) => console.log("View", row),
            dialogContent: ViewDetailsContent,
          },
          {
            label: "Edit hospital",
            onClick: (row) => console.log("Edit", row),
            dialogContent: <h1>Hello from Edit</h1>,
          },
          {
            label: "Delete hospital",
            onClick: (row) => console.log("Delete", row),
            dialogContent: <h1>Hello from Delete</h1>,
          },
        ]}
      />
    </div>
  );

  const RightContent = (
    <div className="h-full p-2">
      <LeftChart
        data={hospitals.map((hospital) => {
          const stats = calculateHospitalStats(hospital);
          const occupancyValue = parseInt(stats.occupancy.replace("%", ""), 10);

          return {
            label: hospital.name,
            value: occupancyValue,
            fill: `hsl(${Math.random() * 360}, 70%, 50%)
`,
          };
        })}
        title="Hospital Occupancy"
        description="Real-time bed occupancy"
        valueLabel="occupied beds"
      />
    </div>
  );

  return <ChartLayout leftContent={LeftContent} rightContent={RightContent} />;
};

export default HospitalsPage;
