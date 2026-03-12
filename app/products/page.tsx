"use client"

import { DataTable } from "@/app/ui/data-table/data-table";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/app/lib/definitions";
import { supabase } from "@/app/supabase-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { columns } from "./columns";
import { getPageNumbers } from "../lib/utils";

const PAGE_SIZE = 10;

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  const router = useRouter();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const getData = async (currentPage: number, searchTerm: string) => {
    setLoading(true)
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    try {
      let q = supabase
        .from('products')
        .select('id, name, recommended_price', { count: 'exact' })
        .filter('active', 'eq', true)
        .order('name')
        .range(from, to)

      if (searchTerm.trim()) {
        q = q.or(`name.ilike.%${searchTerm}%`)
      }

      const { error, data, count } = await q

      if (error) {
        toast.error('Failed to load products: ' + error.message)
      } else {
        setProducts(data as Product[] ?? [])
        setTotalCount(count ?? 0)
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const prevSearchRef = useRef('')

  // Single effect: handles both search and page changes
  useEffect(() => {
    const searchChanged = prevSearchRef.current !== debouncedSearch
    prevSearchRef.current = debouncedSearch

    if (searchChanged && page !== 1) {
      setPage(1)
    } else {
      getData(page, debouncedSearch)
    }
  }, [page, debouncedSearch])


  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-2xl font-bold">Products</p>
        <Button
          onClick={() => router.push('/products/new')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Product
        </Button>
      </div>

      <Input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="container mx-auto py-10">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-500 text-sm">
            Loading...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={products}
              onRowClick={(x) => router.push('/products/' + x.id)}
            />

            {totalCount > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{startItem}–{endItem}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> products
                </p>

                <Pagination className="w-auto mx-0">
                  <PaginationContent>

                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {getPageNumbers(totalPages, page).map((item, idx) => (
                      <PaginationItem key={idx}>
                        {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={item === page}
                            onClick={() => setPage(item)}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page === totalPages}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}