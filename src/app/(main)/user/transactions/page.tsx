"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { DataTable } from "~/components/DataTable";
import EmptyState from "~/components/emptyState";
import { useApi } from "~/hooks/useApi";
import { DialogHeader, DialogTitle, DialogClose } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";

const TransactionsPage = () => {
  const api = useApi();
  const fetchTransactions = async () => {
    const response = await api.get(`api/transactions/getEvery`);
    if ((response as any).success) {
      return (response as any).transactions;
    }
  };

  const { data: transactionData = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const transactionColumns = [
    {
      header: "Transaction ID",
      accessorKey: "_id",
      cell: ({ row }: { row: any }) => row.original._id.slice(0, 5),
    },
    { header: "Hospital Name", accessorKey: "hospitalName" },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }: { row: any }) => `₹${row.original.amount}`,
    },
    {
      header: "Approved",
      accessorKey: "approved",
      cell: ({ row }: { row: any }) => (
        <span
          className={`rounded-full px-2 py-1 text-sm ${
            row.original.approved
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.approved ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8 px-4 py-2 md:px-14 md:py-4">
      {/* Header */}
      <div className="header mt-4 flex w-full justify-between md:mt-6">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">
            All Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage all the transactions
          </p>
        </div>
      </div>

      {/* Table */}
      {transactionData.length === 0 ? (
        <div className="mt-10 flex h-[300px] w-full flex-col items-center justify-center rounded-lg border border-dashed md:mt-20 md:h-[400px]">
          <div className="flex flex-col items-center px-4 text-center">
            <EmptyState
              title="No Transactions"
              description="All your transactions will appear here"
            />
          </div>
        </div>
      ) : (
        <DataTable
          data={transactionData}
          columns={transactionColumns}
          showViewButton
          searchKey="hospitalName"
          searchPlaceholder="Search hospital name"
          sortOptions={[
            {
              label: "Amount: Highest First",
              value: "amountDesc",
              sortKey: "amount",
              sortOrder: "desc",
            },
            {
              label: "Amount: Lowest First",
              value: "amountAsc",
              sortKey: "amount",
              sortOrder: "asc",
            },
            {
              label: "Transaction ID: A-Z",
              value: "idAsc",
              sortKey: "_id",
              sortOrder: "asc",
            },
            {
              label: "Transaction ID: Z-A",
              value: "idDesc",
              sortKey: "_id",
              sortOrder: "desc",
            },
          ]}
          hideDialogButtons
          viewDialogContent={(row) => (
            <div className="space-y-2 p-4">
              <DialogHeader>
                <DialogTitle>Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Transaction ID:</span>
                  <span className="mt-1 sm:mt-0">{row._id}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Patient Name:</span>
                  <span className="mt-1 sm:mt-0">{row.patientName}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Amount:</span>
                  <span className="mt-1 sm:mt-0">₹{row.amount}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className="mt-1 sm:mt-0">{row.status}</span>
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button>Approve</Button>
                </DialogClose>
                <Button variant="destructive">Reject</Button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
