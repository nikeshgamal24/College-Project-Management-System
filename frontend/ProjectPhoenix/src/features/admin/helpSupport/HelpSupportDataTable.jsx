import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { format } from "date-fns";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  filename: "Help_Support_Tickets",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const exportExcel = (rows) => {
  const rowData = rows.map((row) => {
    return {
      Ticket_ID: row.original.id,
      Title: row.original.title,
      Description: row.original.description,
      Status: row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1).replace('_', ' '),
      Priority: row.original.priority.charAt(0).toUpperCase() + row.original.priority.slice(1),
      Category: row.original.category.charAt(0).toUpperCase() + row.original.category.slice(1),
      Submitted_By: row.original.submittedBy,
      Submitted_By_Role: row.original.submittedByRole,
      Assigned_To: row.original.assignedTo || "Unassigned",
      Submitted_At: format(new Date(row.original.submittedAt), "MMM dd, yyyy"),
      Last_Updated: format(new Date(row.original.lastUpdated), "MMM dd, yyyy"),
      Comments_Count: row.original.comments.length,
    };
  });
  const csv = generateCsv(csvConfig)(rowData);
  download(csvConfig)(csv);
};

export const HelpSupportDataTable = forwardRef(({ columns, data, onRowClick }, ref) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "auto",
  });

  useImperativeHandle(ref, () => {
    return {
      exportCSV: () => {
        exportExcel(table.getFilteredRowModel().rows);
      },
    };
  });

  return (
    <>
      <div className="bg-white border rounded-md overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <React.Fragment key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </React.Fragment>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <React.Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </React.Fragment>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
        <div className="text-sm text-slate-500 text-center sm:text-left">
          Showing {table.getPaginationRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length}
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
});

HelpSupportDataTable.displayName = "HelpSupportDataTable";


