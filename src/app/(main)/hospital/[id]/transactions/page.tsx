"use client";

import React from "react";
import ChartLayout from "~/components/ChartLayout";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import { DataTable } from "~/components/DataTable";
import { LeftChart } from "~/components/charts/LeftChart";
import { useApi } from "~/hooks/useApi";
import { useToast } from "~/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "~/hooks/useUser";
import { Loader2 } from "lucide-react";

const TransactionsPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const hospitalId = user?.hospitalId;
  const api = useApi();

  const fetchTransactions = async () => {
    const response = await api.get(`api/transactions/getAll/${hospitalId}`);
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
    { header: "Patient Name", accessorKey: "patientName" },
    { header: "Date", accessorKey: "date" },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }: { row: any }) => `₹${row.original.amount}`,
    },
    {
      header: "Status",
      accessorKey: "approved",
      cell: ({ row }: { row: any }) =>
        row.original.approved ? "Approved" : "Pending",
    },
  ];

  const queryClient = useQueryClient();

  const handleApprove = async (transactionId: string) => {
    const response = await api.post(`api/transactions/approve`, {
      transactionId,
    });
    if ((response as any).success) {
      toast({
        title: "Transaction approved successfully",
        description: "The transaction has been approved",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } else {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-6 py-4">
      {/* Header */}
      <div className="header mt-2 flex w-full justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Transactions</h2>
          <p className="ml-[-1px] text-sm text-muted-foreground">
            Manage all the transactions
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={transactionData}
        columns={transactionColumns}
        showViewButton
        searchKey="patientName"
        searchPlaceholder="Search patient name"
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
            label: "Pending Only",
            value: "Pending Only",
            sortKey: "approved",
          },
          {
            label: "Approved Only",
            value: "Approved Only",
            sortKey: "approved",
          },
        ]}
        viewDialogContent={(row) => (
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
              <span className="mt-1 sm:mt-0">
                {row.approved ? "Approved" : "Pending"}
              </span>
            </p>
            {!row.approved && (
              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleApprove(row._id as string)}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Approve</span>
                    </div>
                  ) : (
                    "Approve"
                  )}
                </Button>
                <Button variant="destructive">Reject</Button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default TransactionsPage;
