"use client";

import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { DataTablePagination } from "./ui/data-table/DataTablePagination";
import { SearchBar } from "./ui/data-table/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";

interface TableData {
  id?: string;
  _id?: string;
  [key: string]: any;
}

interface TableColumn {
  header: string;
  accessorKey: string;
  cell?: ({ row }: { row: any }) => React.ReactNode;
  truncate?: number;
  split?: string;
  process?: (value: any) => any;
}

interface SortOption {
  label: string;
  value: string;
  sortKey: string;
  sortOrder?: "asc" | "desc";
}

interface CustomDataTableProps<T extends TableData> {
  data: T[];
  columns: TableColumn[];
  showViewButton?: boolean;
  showActions?: boolean;
  viewDialogContent?: (row: T) => React.ReactNode;
  actionItems?: {
    label: string;
    onClick: (row: T) => void;
    dialogContent: React.ReactNode | ((props: { row: T }) => React.ReactNode);
  }[];
  searchKey?: string;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  viewButtonHeader?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  hideDialogButtons?: boolean;
}

const formatDate = (value: any): string => {
  if (!value) return "";

  // if already then return it
  if (typeof value === "string" && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return value;
  }

  // numeric -> string
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return value;
  }
};

const extractNumericValue = (value: any): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const numericString = value.toString().replace(/[₹,]/g, "");
  return parseFloat(numericString) || 0;
};

export function DataTable<T extends TableData>({
  data,
  columns,
  showViewButton = false,
  showActions = false,
  viewDialogContent,
  actionItems = [],
  searchKey,
  searchPlaceholder = "Search...",
  sortOptions = [],
  viewButtonHeader = "",
  onRowClick,
  rowClassName,
  hideDialogButtons = false,
}: CustomDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const handleSort = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (!option) {
      setSorting([]);
      setColumnFilters([]);
      return;
    }

    if (option.value.endsWith(" Only")) {
      const filterValue = option.value.replace(" Only", "");
      setColumnFilters([{ id: option.sortKey, value: filterValue }]);
      setSorting([]);
    } else {
      setSorting([
        {
          id: option.sortKey,
          desc: option.sortOrder === "desc",
        },
      ]);
      setColumnFilters([]);
    }
  };

  // parsing  (DD/MM/YYYY) to timestamp
  const parseDate = (dateStr: string) => {
    if (typeof dateStr !== "string") return 0;
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const tableColumns: ColumnDef<T>[] = [
    ...columns.map((col) => ({
      accessorKey: col.accessorKey,
      header: col.header,
      cell: ({ getValue }: { getValue: () => any }) => {
        let value = getValue();

        if (col.process) {
          value = col.process(value);
        }

        if (col.accessorKey === "date" || col.accessorKey === "createdAt") {
          return formatDate(value);
        }

        // Handle text truncation
        if (typeof value === "string") {
          if (col.split) {
            return value.split(col.split)[0];
          }
          if (col.truncate && value.length > col.truncate) {
            return `${value.slice(0, col.truncate)}...`;
          }
        }

        // Handle boolean values
        if (typeof value === "boolean") {
          return value ? "Approved" : "Pending";
        }

        return value;
      },
      sortingFn: (rowA: any, rowB: any) => {
        const a = rowA.getValue(col.accessorKey);
        const b = rowB.getValue(col.accessorKey);

        // Date sorting
        if (col.accessorKey === "date" || col.accessorKey === "createdAt") {
          return parseDate(a) - parseDate(b);
        }

        // Stock sorting - ensure numeric comparison
        if (col.accessorKey === "stock") {
          return Number(a) - Number(b);
        }

        // Amount sorting
        if (col.accessorKey === "amount") {
          return extractNumericValue(a) - extractNumericValue(b);
        }

        // Default string comparison
        return String(a).localeCompare(String(b));
      },
    })),
    ...((showViewButton && viewDialogContent) ||
    (showActions && actionItems.length > 0)
      ? [
          {
            id: "actions",
            header: viewButtonHeader,
            cell: ({ row }: { row: Row<T> }) => {
              return (
                <div className="flex items-center gap-4">
                  {showViewButton && viewDialogContent && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Details</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          {viewDialogContent(row.original)}
                        </div>
                        {!hideDialogButtons && (
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button>OK</Button>
                            </DialogClose>
                          </DialogFooter>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  {showActions && actionItems.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actionItems.map((item, index) =>
                          item.dialogContent ? (
                            <Dialog key={index}>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  {item.label}
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                {typeof item.dialogContent === "function"
                                  ? item.dialogContent({ row: row.original })
                                  : item.dialogContent}
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => item.onClick(row.original)}
                            >
                              {item.label}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          filterableColumns={[]}
          actions={[]}
          enableColumnVisibility={false}
        />
        {sortOptions.length > 0 && (
          <Select onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={`${
                    Object.values(row.original).some(
                      (value) => String(value).length < 4,
                    )
                      ? "text-center"
                      : "text-start"
                  } h-16 cursor-pointer hover:bg-muted ${
                    rowClassName ? rowClassName(row.original) : ""
                  }`}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${String(cell.getValue()).length < 3 ? "pl-8 text-start" : "text-start"} py-4`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
