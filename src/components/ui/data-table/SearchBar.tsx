"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filterableColumns: {
    id: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  enableColumnVisibility?: boolean;
}

export function SearchBar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  filterableColumns = [],
  actions = [],
  enableColumnVisibility = false,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="w-full outline-none ring-0 focus:outline-none focus:ring-0 focus:ring-transparent lg:w-[250px]"
          />
        )}
      </div>
    </div>
  );
}
