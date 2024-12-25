"use client";

import React from "react";
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
import { X } from "lucide-react";
import CreateUserForm from "~/components/forms/CreateUser";

const UsersPage = () => {
  const userData = [
    {
      id: "1",
      name: "John Smith",
      role: "Patient",
      email: "john.smith@example.com",
      createdAt: "20/7/2024",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Doctor",
      email: "sarah.j@example.com",
      createdAt: "21/7/2024",
    },
    {
      id: "3",
      name: "Mike Wilson",
      role: "Patient",
      email: "mike.w@example.com",
      createdAt: "20/7/2024",
    },
    {
      id: "4",
      name: "Emily Brown",
      role: "Staff",
      email: "emily.b@example.com",
      createdAt: "20/2/2024",
    },
    {
      id: "5",
      name: "David Lee",
      role: "Doctor",
      email: "david.l@example.com",
      createdAt: "20/8/2024",
    },
    {
      id: "5",
      name: "David Lee",
      role: "Doctor",
      email: "david.l@example.com",
      createdAt: "20/8/2024",
    },
    {
      id: "5",
      name: "David Lee",
      role: "Doctor",
      email: "david.l@example.com",
      createdAt: "20/8/2024",
    },
    {
      id: "5",
      name: "David Lee",
      role: "Doctor",
      email: "david.l@example.com",
      createdAt: "20/8/2024",
    },
    {
      id: "5",
      name: "David Lee",
      role: "Staff",
      email: "david.l@example.com",
      createdAt: "20/8/2024",
    },
  ];

  const userColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Role", accessorKey: "role" },
    { header: "Email", accessorKey: "email" },
    { header: "Created At", accessorKey: "createdAt" },
  ];

  const [isOpen, setIsOpen] = React.useState(false);

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="patient">Patient</TabsTrigger>
            </TabsList>

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

      {/* Table */}
      <div className="mb-4">
        <DataTable
          data={userData}
          columns={userColumns}
          showActions
          searchKey="name"
          searchPlaceholder="Search user's name"
          viewDialogContent={(row) => <div className="space-y-2"></div>}
          sortOptions={[
            {
              label: "Patient Only",
              value: "Patient Only",
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
              dialogContent: <h1>Hello from View</h1>,
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
