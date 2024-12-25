"use client";

import React, { useEffect, useState } from "react";
import ChartLayout from "~/components/ChartLayout";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import { DataTable } from "~/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useApi } from "~/hooks/useApi";
import { UserType } from "~/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import CreateUserForm from "~/components/forms/CreateUser";

const UsersPage = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getTierLabel = (tier: number): string => {
    switch (tier) {
      case 0:
        return "Patient";
      case 1:
        return "Doctor";
      case 2:
        return "Staff";
      case 3:
        return "Hospital Admin";
      case 4:
        return "System Admin";
      default:
        return "Unknown";
    }
  };

  const userColumns = [
    {
      header: "Name",
      accessorKey: "name",
      truncate: 20,
    },
    {
      header: "Role",
      accessorKey: "tier",
      process: (value: number) => getTierLabel(value),
    },
    {
      header: "Email",
      accessorKey: "email",
      truncate: 25,
    },
    {
      header: "Created At",
      accessorKey: "dob",
      cell: ({ row }: { row: any }) =>
        new Date(row.original.dob).toLocaleDateString(),
    },
  ];

  const api = useApi();

  const getAllUsers = async () => {
    const response = await api.get<{ users: UserType[] }>(
      "api/admin/getAllUsers",
    );
    return response.users;
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5,
  });

  const ViewDetailsContent = ({ row }: { row: UserType }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Basic Information</h3>
          <div className="mt-2 space-y-2">
            <p>
              <strong>Name:</strong> {row.name}
            </p>
            <p>
              <strong>Email:</strong> {row.email}
            </p>
            <p>
              <strong>Role:</strong> <Badge>{getTierLabel(row.tier)}</Badge>
            </p>
            <p>
              <strong>Phone:</strong> {row.phone}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Additional Details</h3>
          <div className="mt-2 space-y-2">
            <p>
              <strong>Date of Birth:</strong>{" "}
              {new Date(row.dob).toLocaleDateString()}
            </p>
            <p>
              <strong>Gender:</strong> {row.gender}
            </p>
            <p>
              <strong>Address:</strong> {row.address}
            </p>
            {row.hospitalId && (
              <p>
                <strong>Hospital ID:</strong> {row.hospitalId}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {row.tier === 1 && (
        <>
          <div>
            <h3 className="font-semibold">Professional Information</h3>
            <div className="mt-2 space-y-2">
              <p>
                <strong>Qualification:</strong> {row.qualification || "N/A"}
              </p>
              <p>
                <strong>Hospital ID:</strong> {row.hospitalId || "N/A"}
              </p>
              {row.departments && row.departments.length > 0 && (
                <p>
                  <strong>Departments:</strong> {row.departments.join(", ")}
                </p>
              )}
            </div>
          </div>
          <Separator />
        </>
      )}

      {row.tier === 0 && (
        <>
          <div>
            <h3 className="font-semibold">Medical Information</h3>
            <div className="mt-2 space-y-2">
              <p>
                <strong>Blood Group:</strong> {row.bloodGroup}
              </p>
              <p>
                <strong>UDID:</strong> {row.udid || "N/A"}
              </p>
              <p>
                <strong>Allergies:</strong>{" "}
                {row.allergies?.length > 0 ? row.allergies.join(", ") : "None"}
              </p>
              <p>
                <strong>Admitted:</strong> {row.admitted ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <Separator />
        </>
      )}

      <div>
        <h3 className="font-semibold">System Information</h3>
        <p>cases consultations transactions slot</p>
        <div className="mt-2 space-y-2">
          {row.cases && (
            <p>
              <strong>Cases:</strong> {row.cases.length}
            </p>
          )}
          {row.consultations && (
            <p>
              <strong>Consultations:</strong> {row.consultations.length}
            </p>
          )}
          {row.transactions && (
            <p>
              <strong>Transactions:</strong> {row.transactions.length}
            </p>
          )}
          {row.slotId && (
            <p>
              <strong>Current Slot:</strong> {row.slotId}
              {row.slotPriority && ` (Priority: ${row.slotPriority})`}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div>Loading...</div>;
  console.log(users);

  return (
    <div className="flex w-full flex-col gap-8 px-6 py-4">
      {/* Header */}
      <div className="header mt-2 flex w-full justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Users</h2>
          <p className="ml-[-1px] text-sm text-muted-foreground">
            Manage all the users
          </p>
        </div>
        <Button
          className="flex items-center justify-center gap-x-2"
          variant="outline"
          onClick={() => setIsOpen(true)}
        >
          <span className="mt-0.5">Add User</span>{" "}
          <GoPlus className="text-lg" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="hospitalAdmin" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hospitalAdmin">Hospital Admin</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="patient">Patient</TabsTrigger>
            </TabsList>
            <TabsContent value="hospitalAdmin">
              <CreateUserForm tier={3} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
            <TabsContent value="doctor">
              <CreateUserForm tier={1} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
            <TabsContent value="staff">
              <CreateUserForm tier={2} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
            <TabsContent value="patient">
              <CreateUserForm tier={0} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <DataTable
          data={users?.map((user) => ({ ...user })) || []}
          columns={userColumns}
          showActions
          searchKey="name"
          searchPlaceholder="Search user's name"
          sortOptions={[
            {
              label: "Patient Only",
              value: "Patient Only",
              sortKey: "role",
            },
            {
              label: "Admin Only",
              value: "Admin Only",
              sortKey: "role",
            },
            {
              label: "Doctor Only",
              value: "Doctor Only",
              sortKey: "role",
            },
            {
              label: "Staff Only",
              value: "Staff Only",
              sortKey: "role",
            },
            {
              label: "Date: Latest First",
              value: "dateDesc",
              sortKey: "createdAt",
              sortOrder: "desc",
            },
            {
              label: "Date: Oldest First",
              value: "dateAsc",
              sortKey: "createdAt",
              sortOrder: "asc",
            },
            {
              label: "Name: A to Z",
              value: "nameAsc",
              sortKey: "name",
              sortOrder: "asc",
            },
            {
              label: "Name: Z to A",
              value: "nameDesc",
              sortKey: "name",
              sortOrder: "desc",
            },
          ]}
          actionItems={[
            {
              label: "View details",
              onClick: (row) => console.log("View", row),
              dialogContent: ViewDetailsContent,
            },
            {
              label: "Edit details",
              onClick: (row) => console.log("Edit", row),
              dialogContent: <h1>Hello from Edit</h1>,
            },
            {
              label: "Delete user",
              onClick: (row) => console.log("Delete", row),
              dialogContent: <h1>Hello from Delete</h1>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UsersPage;
