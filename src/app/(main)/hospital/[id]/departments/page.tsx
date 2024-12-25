"use client";

import React from "react";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import { BsPeople, BsClock } from "react-icons/bs";
import { LuBedSingle } from "react-icons/lu";

import { MdEventAvailable } from "react-icons/md";
import { GoPlus } from "react-icons/go";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import CreateDepartment from "~/components/forms/CreateDepartment";
import { useRouter } from "next/navigation";

const departmentsData = {
  departments: [
    {
      id: "1",
      name: "Neurology",
      hospitalId: "1",
      location: "Block A, Floor 2",
      departmentHead: "Dr. Sarah Johnson",
      doctors: [
        { id: "d1", name: "Dr. John Smith", status: "Available" },
        { id: "d2", name: "Dr. Emily Brown", status: "In Surgery" },
        { id: "d3", name: "Dr. Michael Lee", status: "Available" },
      ],
      beds: Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `b${i}`,
          number: i + 1,
          isOccupied: i < 30,
          patientId: i < 30 ? `p${i}` : null,
        })),
      activeCases: [
        {
          id: "c1",
          patientName: "John Doe",
          doctorName: "Dr. John Smith",
          admittedAt: "2024-03-15",
          status: "Active",
        },
        {
          id: "c2",
          patientName: "Jane Smith",
          doctorName: "Dr. Emily Brown",
          admittedAt: "2024-03-14",
          status: "Critical",
        },
        {
          id: "c3",
          patientName: "Robert Johnson",
          doctorName: "Dr. Michael Lee",
          admittedAt: "2024-03-13",
          status: "Stable",
        },
        {
          id: "c4",
          patientName: "Sarah Williams",
          doctorName: "Dr. John Smith",
          admittedAt: "2024-03-12",
          status: "Recovering",
        },
        {
          id: "c5",
          patientName: "Mike Brown",
          doctorName: "Dr. Emily Brown",
          admittedAt: "2024-03-11",
          status: "Active",
        },
      ],
      queueLength: 3,
    },
    {
      id: "2",
      name: "Cardiology",
      hospitalId: "1",
      location: "Block B, Floor 1",
      departmentHead: "Dr. Robert Williams",
      doctors: [
        { id: "d4", name: "Dr. James Wilson", status: "Available" },
        { id: "d5", name: "Dr. Sarah Chen", status: "With Patient" },
        { id: "d6", name: "Dr. David Miller", status: "Available" },
      ],
      beds: Array(40)
        .fill(null)
        .map((_, i) => ({
          id: `b${i}`,
          number: i + 1,
          isOccupied: i < 25,
          patientId: i < 25 ? `p${i}` : null,
        })),
      activeCases: [
        {
          id: "c6",
          patientName: "Tom Harris",
          doctorName: "Dr. James Wilson",
          admittedAt: "2024-03-15",
          status: "Critical",
        },
        {
          id: "c7",
          patientName: "Mary Johnson",
          doctorName: "Dr. Sarah Chen",
          admittedAt: "2024-03-14",
          status: "Stable",
        },
        {
          id: "c8",
          patientName: "Peter Parker",
          doctorName: "Dr. David Miller",
          admittedAt: "2024-03-13",
          status: "Active",
        },
        {
          id: "c9",
          patientName: "Lisa Wong",
          doctorName: "Dr. James Wilson",
          admittedAt: "2024-03-12",
          status: "Recovering",
        },
        {
          id: "c10",
          patientName: "Kevin Smith",
          doctorName: "Dr. Sarah Chen",
          admittedAt: "2024-03-11",
          status: "Active",
        },
      ],
      queueLength: 2,
    },
  ],
};

const DepartmentsPage = () => {
  const [selectedDept, setSelectedDept] = React.useState(
    departmentsData.departments[0],
  );

  const [selectedBed, setSelectedBed] = React.useState<number | null>(null);

  const occupiedBeds = selectedDept.beds.filter((bed) => bed.isOccupied).length;
  const availableBeds = selectedDept.beds.length - occupiedBeds;

  const tableData = selectedDept.activeCases.map((c) => ({
    id: c.id,
    type: "Case",
    patient: c.patientName,
    doctor: c.doctorName,
    admittedAt: c.admittedAt,
    status: c.status,
  }));

  const [isOpen, setIsOpen] = React.useState(false);

  const router = useRouter();

  return (
    <div className="overflow-y-auto">
      <Tabs
        defaultValue={departmentsData.departments[0].name}
        className="h-full"
      >
        <div className="h-9 border-b">
          <TabsList className="bg-transparent px-6">
            {departmentsData.departments.map((dept) => (
              <TabsTrigger
                key={dept.id}
                value={dept.name}
                className="relative h-8 rounded-none border-b-2 border-transparent bg-transparent px-4 font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                onClick={() => setSelectedDept(dept)}
              >
                {dept.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {departmentsData.departments.map((dept) => (
          <TabsContent
            key={dept.id}
            value={dept.name}
            className="h-[calc(100vh-8rem)] px-6 pb-0 pt-4"
          >
            <div className="grid h-full grid-cols-6 gap-4">
              <div className="col-span-4 flex flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{selectedDept.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedDept.location}
                    </p>
                  </div>
                  <div className="flex gap-x-2">
                    <Button
                      className="flex items-center justify-center gap-x-2"
                      variant="outline"
                      onClick={() => setIsOpen(true)}
                    >
                      <span className="mt-0.5">Add Department</span>{" "}
                      <GoPlus className="text-lg" />
                    </Button>
                    <Button
                      disabled={selectedBed === null}
                      onClick={() => {
                        router.push("/hospital/:id/cases");
                      }}
                    >
                      Admit Patient
                    </Button>
                  </div>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader className="flex flex-row items-center justify-between">
                      <DialogTitle>Add New Department</DialogTitle>
                    </DialogHeader>

                    <CreateDepartment />
                  </DialogContent>
                </Dialog>

                <div className="mb-6 grid grid-cols-4 gap-4">
                  <Card className="cursor-pointer p-4 transition-colors duration-200 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BsPeople className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">
                          Total Doctors
                        </p>
                        <p className="text-xl font-bold">
                          {selectedDept.doctors.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer p-4 transition-colors duration-200 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <LuBedSingle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">
                          Available Beds
                        </p>
                        <p className="text-xl font-bold">
                          {availableBeds} / {selectedDept.beds.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer p-4 transition-colors duration-200 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <MdEventAvailable className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">
                          Active Cases
                        </p>
                        <p className="text-xl font-bold">
                          {
                            selectedDept.activeCases.filter((c) => !c.status)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer p-4 transition-colors duration-200 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BsClock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">
                          In Queue
                        </p>
                        <p className="text-xl font-bold">
                          {selectedDept.queueLength}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex-1">
                  <DataTable
                    data={tableData}
                    columns={[
                      { header: "Patient", accessorKey: "patient" },
                      { header: "Doctor", accessorKey: "doctor" },
                      { header: "Admitted At", accessorKey: "admittedAt" },
                      { header: "Status", accessorKey: "status" },
                    ]}
                    searchPlaceholder="Search patients"
                    searchKey="patient"
                    showActions
                  />
                </div>
              </div>

              <Card className="col-span-2 flex h-full flex-col overflow-hidden p-4">
                <h2 className="mb-4 text-lg font-semibold">Bed Management</h2>
                <div className="scrollbar flex-1 overflow-y-auto pr-2">
                  <div className="mb-4">
                    <div className="grid grid-cols-5 gap-2">
                      {selectedDept.beds.map((bed, index) => {
                        if (!bed.isOccupied) {
                          return (
                            <div
                              key={bed.id}
                              onClick={() =>
                                setSelectedBed(
                                  selectedBed === index ? null : index,
                                )
                              }
                              className={`aspect-square cursor-pointer rounded-lg border bg-green-100 dark:bg-green-900/20 ${selectedBed === index ? "border-2 border-primary" : ""}`}
                            >
                              <div className="flex h-full flex-col items-center justify-center gap-1 p-1">
                                <span className="text-xs font-medium">
                                  {selectedBed === index ? (
                                    <svg
                                      className="h-4 w-4 text-primary"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    index + 1
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-5 gap-2">
                      {selectedDept.beds.map((bed, index) => {
                        if (bed.isOccupied) {
                          return (
                            <div
                              key={bed.id}
                              className="aspect-square cursor-not-allowed rounded-lg border bg-red-100 dark:bg-red-900/20"
                            >
                              <div className="flex h-full items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DepartmentsPage;
