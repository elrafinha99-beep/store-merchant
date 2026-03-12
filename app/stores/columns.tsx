"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Store } from "@/app/lib/definitions"

export const columns: ColumnDef<Store>[] = [
    {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => {
            const name:string = row.getValue("name")
            return <div className="text-left font-medium">{name}</div>
        },
    },
    {
        accessorKey: "city",
        header: () => <div className="text-left">City</div>,
        cell: ({ row }) => {
            const name:string = row.getValue("city")
            return <div className="text-left font-medium">{name}</div>
        },
    },
    {
        accessorKey: "phone_number",
        header: () => <div className="text-left">Phone Number</div>,
        cell: ({ row }) => {
            const name:string = row.getValue("phone_number")
            return <div className="text-left font-medium">{name ?? '-'}</div>
        },
    },
  
]