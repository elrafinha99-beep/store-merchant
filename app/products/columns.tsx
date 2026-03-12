"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/app/lib/definitions"

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name")
            return <div className="text-left font-medium">{name}</div>
        },
    },
    {
        accessorKey: "recommended_price",
        header: () => <div className="text-left">Recommended Price</div>,
        cell: ({ row }) => {
            const recommended_price: number = row.getValue("recommended_price")
            return <div className="text-left font-medium">{recommended_price ?? '-'}</div>
        },
    },

]