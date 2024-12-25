"use client";

import React from "react";
import ChartLayout from "~/components/ChartLayout";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import { DataTable } from "~/components/DataTable";
import { LeftChart } from "~/components/charts/LeftChart";
import { useApi } from "~/hooks/useApi";
import { useQuery } from "@tanstack/react-query";

const TransactionsPage = () => {
  const transactionData = [
    {
      id: "1",
      name: "ABC Hospital",
      email: "abc.hospital@example.com",
      amount: "₹15,000",
      hospital: "ABC Hospital",
      date: "20/07/2024",
    },
    {
      id: "2",
      name: "BCD Hospital",
      email: "bcd.hospital@example.com",
      amount: "₹22,500",
      hospital: "BCD Hospital",
      date: "21/07/2024",
    },
    {
      id: "3",
      name: "CDE Hospital",
      email: "cde.hospital@example.com",
      amount: "₹18,750",
      hospital: "CDE Hospital",
      date: "22/07/2024",
    },
    {
      id: "4",
      name: "DEF Hospital",
      email: "def.hospital@example.com",
      amount: "₹30,000",
      hospital: "DEF Hospital",
      date: "23/07/2024",
    },
    {
      id: "5",
      name: "EFG Hospital",
      email: "efg.hospital@example.com",
      amount: "₹25,500",
      hospital: "EFG Hospital",
      date: "24/07/2024",
    },
    {
      id: "6",
      name: "FGH Hospital",
      email: "fgh.hospital@example.com",
      amount: "₹12,800",
      hospital: "FGH Hospital",
      date: "25/07/2024",
    },
  ];

  const transactionColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Amount", accessorKey: "amount" },
    { header: "Hospital", accessorKey: "hospital" },
    { header: "Date", accessorKey: "date" },
  ];

  // Left Content
  const chartData = [
    { hospital: "ABC Hospital", patients: 15000, fill: "hsl(var(--chart-1))" },
    { hospital: "BCD Hospital", patients: 22500, fill: "hsl(var(--chart-2))" },
    { hospital: "CDE Hospital", patients: 18750, fill: "hsl(var(--chart-3))" },
    { hospital: "DEF Hospital", patients: 30000, fill: "hsl(var(--chart-4))" },
    { hospital: "EFG Hospital", patients: 25500, fill: "hsl(var(--chart-5))" },
  ].map((item) => ({
    label: item.hospital,
    value: item.patients,
    fill: item.fill,
  }));

  const api = useApi();
  const fetchTransactions = async () => {
    const response = await api.get(`api/transactions/getEvery`);
    if ((response as any).success) {
      return (response as any).transactions;
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    staleTime: 1000 * 60 * 60 * 24,
  });

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
        searchKey="name"
        searchPlaceholder="Search user's name"
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
            label: "Date: Latest First",
            value: "dateDesc",
            sortKey: "date",
            sortOrder: "desc",
          },
          {
            label: "Date: Oldest First",
            value: "dateAsc",
            sortKey: "date",
            sortOrder: "asc",
          },
        ]}
        viewDialogContent={(row) => (
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Name:</span> {row.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {row.email}
            </p>
            <p>
              <span className="font-semibold">Amount:</span> {row.amount}
            </p>
            <p>
              <span className="font-semibold">Hospital:</span> {row.hospital}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {row.date}
            </p>
          </div>
        )}
      />
    </div>
  );
};

export default TransactionsPage;
