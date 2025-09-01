// import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableHead } from "@/components/ui/table";
import { getEventStatusByCode, getEventTypeByCode } from "@/lib/config";
import { format } from "date-fns";

import { MoreHorizontal, ArrowUpDown, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export const ProjectColumn = [
  {
    accessorKey: "projectCode",
    header: () => <TableHead>Project Code</TableHead>,
    cell: ({ row }) => {
      const projectCode = row.getValue("projectCode");

      return <TableCell className="text-gray-700">{projectCode}</TableCell>;
    },
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const projectName = row.getValue("projectName");
      const description = row.original.projectDescription;
      const projectId = row.original._id;

      return (
        <TableCell className="text-gray-600 max-w-64">
          <Link 
            to={`/2001/archive/${projectId}`}
            className="block hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
          >
            <div className="font-semibold line-clamp-1 text-blue-600 hover:text-blue-800">
              {projectName}
            </div>
            {description && (
              <div className="text-xs line-clamp-2 text-gray-500">{description}</div>
            )}
          </Link>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "status",

    header: () => (
      <TableHead className="hidden lg:table-cell"> Status</TableHead>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      const formatted = getEventStatusByCode(status);

      return (
        <TableCell className="hidden lg:table-cell">
          <Badge variant="secondary">{formatted}</Badge>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "projectType",
    header: () => <TableHead className="hidden md:table-cell">Type</TableHead>,
    cell: ({ row }) => {
      const projectType = row.getValue("projectType");
      const formatted = getEventTypeByCode(projectType);
      return (
        <TableCell className="hidden md:table-cell">
          <Badge>{formatted}</Badge>
        </TableCell>
      );
    },
  },

  {
    accessorKey: "members",
    header: () => (
      <TableHead className="hidden xl:table-cell">Members</TableHead>
    ),
    cell: ({ row }) => {
      const teamMembers = row.original.teamMembers;

      const formatted = teamMembers.length;

      return (
        <TableCell className="font-semibold hidden xl:table-cell">
          {formatted}
        </TableCell>
      );
    },
  },
  {
    accessorKey: "supervisor",
    header: ({ column, table }) => {
      const shouldHide = table
        .getRowModel()
        .rows.every((row) => row.original.projectType < 1);

      return (
        <TableHead
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`cursor-pointer hidden  ${
            shouldHide ? "" : "xl:table-cell"
          }`}
        >
          <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
      );
    },
    cell: ({ row }) => {
      const shouldHide = row.original.projectType < 1;

      if (row.original.supervisor?.supervisorId?.fullname) {
        return (
          <TableCell
            className={`hidden font-semibold ${
              shouldHide ? "" : " xl:table-cell"
            }`}
          >
            {row.original.supervisor?.supervisorId?.fullname}
          </TableCell>
        );
      } else {
        return (
          <TableCell
            className={`hidden text-slate-500 ${
              shouldHide ? "" : " xl:table-cell"
            }`}
          >
            Not Assigned
          </TableCell>
        );
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer hidden xl:table-cell"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Created On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),

    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      const formatted = format(createdAt, "PPP");

      return (
        <TableCell className="text-gray-500 hidden xl:table-cell">
          {formatted}
        </TableCell>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;

      return (
        <TableCell className="hidden md:table-cell">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(project.projectCode);
                }}
              >
                Copy Project Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  to={`/2001/archive/${project._id}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      );
    },
  },
];
