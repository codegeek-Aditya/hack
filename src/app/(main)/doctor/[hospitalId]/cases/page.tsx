"use client";

import React from "react";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Label } from "~/components/ui/label";
import { Input } from "postcss";
import { useApi } from "~/hooks/useApi";

const CasePage = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const caseData = [
    {
      id: "1",
      bedId: "101",
      departmentId: "neurology",
      departmentName: "Neurology",
      userId: "1",
      patientName: "John Doe",
      ailment: "Migraine",
      doctorId: "2",
      doctorName: "Dr. Sarah Wilson",
      createdDateTime: "20/7/2024",
      status: "Active",
      admittedAt: "20/7/2024",
      dischargedAt: null,
      bedNumber: "N-101",
      documents: [
        { id: "1", name: "Blood Report", date: "21/7/2024" },
        { id: "2", name: "MRI Scan", date: "22/7/2024" },
      ],
      prescriptions: [
        {
          id: "1",
          date: "21/7/2024",
          medicines: [
            { name: "Sumatriptan", dosage: "50mg", frequency: "As needed" },
            { name: "Propranolol", dosage: "40mg", frequency: "Twice daily" },
          ],
        },
      ],
      vitals: {
        temperature: "98.6°F",
        bloodPressure: "120/80",
        pulseRate: "72",
        oxygenSaturation: "98%",
      },
    },
  ];

  const caseColumns = [
    { header: "Case ID", accessorKey: "id" },
    { header: "Patient Name", accessorKey: "patientName" },
    { header: "Ailment", accessorKey: "ailment" },
    { header: "Doctor", accessorKey: "doctorName" },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => (
        <Badge
          variant={
            row.original.status === "Active"
              ? "default"
              : row.original.status === "Discharged"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    { header: "Created Date", accessorKey: "createdDateTime" },
  ];

  const router = useRouter();

  const api = useApi();

  return (
    <div className="flex w-full flex-col gap-8 px-6 py-4">
      <div className="header mt-2 flex w-full justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Cases</h2>
          <p className="ml-[-1px] text-sm text-muted-foreground">
            Manage all the cases
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Create Case</DialogTitle>
          </DialogHeader>

          <div className="mt-6 flex w-full">
            <Button
              variant="outline"
              onClick={() => router.push(`/doctor/:hospitalId/cases/create`)}
            >
              Create case
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <DataTable
          data={caseData}
          columns={caseColumns}
          showActions
          searchKey="patientName"
          searchPlaceholder="Search patient name or ailment"
          viewDialogContent={(row) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Patient Information</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <strong>Name:</strong> {row.patientName}
                    </p>
                    <p>
                      <strong>Case ID:</strong> {row.id}
                    </p>
                    <p>
                      <strong>Ailment:</strong> {row.ailment}
                    </p>
                    <p>
                      <strong>Status:</strong> <Badge>{row.status}</Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Department Details</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <strong>Department:</strong> {row.departmentName}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {row.doctorName}
                    </p>
                    <p>
                      <strong>Bed Number:</strong> {row.bedNumber}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Latest Vitals</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <p>
                    <strong>Temperature:</strong> {row.vitals.temperature}
                  </p>
                  <p>
                    <strong>Blood Pressure:</strong> {row.vitals.bloodPressure}
                  </p>
                  <p>
                    <strong>Pulse Rate:</strong> {row.vitals.pulseRate}
                  </p>
                  <p>
                    <strong>O2 Saturation:</strong>{" "}
                    {row.vitals.oxygenSaturation}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Documents</h3>
                <div className="mt-2 space-y-2">
                  {row.documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between">
                      <span>{doc.name}</span>
                      <span className="text-muted-foreground">{doc.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Latest Prescription</h3>
                <div className="mt-2 space-y-2">
                  {row.prescriptions[0]?.medicines.map((med, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <p>
                  <strong>Admitted:</strong> {row.admittedAt}
                </p>
                {row.dischargedAt && (
                  <p>
                    <strong>Discharged:</strong> {row.dischargedAt}
                  </p>
                )}
              </div>
            </div>
          )}
          sortOptions={[
            {
              label: "Status: Active",
              value: "Active Only",
              sortKey: "status",
            },
            {
              label: "Status: Discharged",
              value: "Discharged Only",
              sortKey: "status",
            },
            {
              label: "Date: Latest First",
              value: "dateDesc",
              sortKey: "createdDateTime",
              sortOrder: "desc",
            },
            {
              label: "Date: Oldest First",
              value: "dateAsc",
              sortKey: "createdDateTime",
              sortOrder: "asc",
            },
            {
              label: "Patient: A to Z",
              value: "nameAsc",
              sortKey: "patientName",
              sortOrder: "asc",
            },
            {
              label: "Patient: Z to A",
              value: "nameDesc",
              sortKey: "patientName",
              sortOrder: "desc",
            },
          ]}
          actionItems={[
            {
              label: "View details",
              onClick: (row) => console.log("View", row),
              dialogContent: <h1>Hello from View</h1>,
            },
            {
              label: "Edit details",
              onClick: (row) => console.log("Edit", row),
              dialogContent: <h1>Hello from Edit</h1>,
            },
            {
              label: "Delete case",
              onClick: (row) => console.log("Delete", row),
              dialogContent: <h1>Hello from Delete</h1>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CasePage;
