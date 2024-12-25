"use client";

import React, { useState } from "react";
import { DataTable } from "~/components/DataTable";
import EmptyState from "~/components/emptyState";

const casesData = [
  {
    id: "1",
    hospital: "Shankari Hospital",
    admitDate: "2024-01-26",
    dischargeDate: "2024-02-02",
    time: "10:45 PM",
    status: "discharged",
  },
  {
    id: "2",
    hospital: "City Care Hospital",
    admitDate: "2024-02-15",
    dischargeDate: "2024-02-22",
    time: "2:30 PM",
    status: "discharged",
  },
  {
    id: "3",
    hospital: "Apollo Hospital",
    admitDate: "2024-03-01",
    dischargeDate: "2024-03-08",
    time: "11:15 AM",
    status: "admitted",
  },
  {
    id: "4",
    hospital: "Fortis Hospital",
    admitDate: "2024-03-10",
    dischargeDate: "2024-03-17",
    time: "4:45 PM",
    status: "admitted",
  },
  {
    id: "5",
    hospital: "Max Hospital",
    admitDate: "2024-03-20",
    dischargeDate: "2024-03-27",
    time: "9:00 AM",
    status: "pending",
  },
];

const casesColumns = [
  { header: "Hospital Name", accessorKey: "hospital" },
  { header: "Admit Date", accessorKey: "admitDate" },
  { header: "Discharge Date", accessorKey: "dischargeDate" },
  { header: "Time", accessorKey: "time" },
  { header: "Status", accessorKey: "status" },
];

const CasesPage = () => {
  return (
    <div className="flex w-full flex-col gap-8 px-4 py-2 md:px-14">
      {/* Header */}
      <div className="flex h-full w-full flex-col md:flex-row md:justify-between md:gap-10">
        <div className="flex h-full w-full flex-col gap-8">
          <div className="header mt-5 flex w-full flex-col justify-between gap-6 py-4">
            <div>
              <h2 className="text-xl font-semibold md:text-2xl">All Cases</h2>
              <p className="text-sm text-muted-foreground">
                Manage all the cases
              </p>
            </div>
          </div>

          {/* Table */}
          {casesData.length === 0 ? (
            <div className="mt-10 flex h-[300px] w-full flex-col items-center justify-center rounded-lg border border-dashed md:mt-20 md:h-[400px]">
              <div className="flex flex-col items-center px-4 text-center">
                <EmptyState
                  title="No Cases"
                  description="All your hospital cases will appear here"
                />
              </div>
            </div>
          ) : (
            <DataTable
              data={casesData}
              columns={casesColumns}
              showViewButton
              searchKey="hospital"
              searchPlaceholder="Search hospital name"
              viewDialogContent={(row) => (
                <div className="space-y-2">
                  <p>hello</p>
                </div>
              )}
              sortOptions={[
                {
                  label: "Hospital Name: A-Z",
                  value: "hospitalAsc",
                  sortKey: "hospital",
                  sortOrder: "asc",
                },
                {
                  label: "Hospital Name: Z-A",
                  value: "hospitalDesc",
                  sortKey: "hospital",
                  sortOrder: "desc",
                },
                {
                  label: "Date: Latest First",
                  value: "dateDesc",
                  sortKey: "admitDate",
                  sortOrder: "desc",
                },
                {
                  label: "Date: Oldest First",
                  value: "dateAsc",
                  sortKey: "admitDate",
                  sortOrder: "asc",
                },
                {
                  label: "Status: Pending",
                  value: "statusAsc",
                  sortKey: "status",
                  sortOrder: "asc",
                },
                {
                  label: "Status: Discharged",
                  value: "statusDesc",
                  sortKey: "status",
                  sortOrder: "desc",
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CasesPage;
