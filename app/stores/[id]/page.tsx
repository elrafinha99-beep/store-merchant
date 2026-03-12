"use client"

import { useEffect, useState } from "react";
import { Product, Store, StoreProduct } from "@/app/lib/definitions";
import { supabase } from "@/app/supabase-client";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { toast } from "sonner"
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import MobileProductCard from "../../../components/ui/mobileProductCard";
import WebProductTable from "../../../components/ui/webProductTable";

const defaultStore: Store = {
  id: '',
  name: '',
  street: '',
  city: '',
  zip_code: undefined,
  phone_number: undefined,
  timezone: undefined,
  active: true,
  deleted_at: null
}

type FormErrors = {
  name?: string
  street?: string
  city?: string
}


export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [store, setStore] = useState<Store>(defaultStore)
  const [loading, setLoading] = useState(id !== 'new')
  const [isEdit, setIsEdit] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Products state
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [pendingPrice, setPendingPrice] = useState<number | null>(null)
  const [pendingAvailability, setPendingAvailability] = useState<boolean>(true)
  const [pendingErrors, setPendingErrors] = useState<{ price?: string }>({})



  const getData = async () => {
    setLoading(true)
    try {
      const { error, data } = await supabase.from('stores').select('*').eq('id', id).single();

      if (error) {
        toast.error('Failed to load store')
        setStore(defaultStore)
      } else {
        setStore(data)
      }
    } catch (err) {
      toast.error('An unexpected error occurred while loading the store.')
      setStore(defaultStore)
    } finally {
      setLoading(false)
    }
  }

  const getStoreProducts = async () => {
    setProductsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores_products')
        .select('*, product:products(id, name, recommended_price, active)')
        .eq('store_id', id)
        
      if (error) {
        toast.error('Failed to load store products')
      } else {
        setStoreProducts(data ?? [])
      }
    } catch (err) {
      toast.error('An unexpected error occurred while loading store products.')
    } finally {
      setProductsLoading(false)
    }
  }

  const searchProducts = async (query: string) => {
    setSearchLoading(true)
    try {
      let q = supabase
        .from('products')
        .select('id, name, recommended_price')
        .eq('active', true)
        .order('name')
        .limit(10)

      if (query.trim()) {
        q = q.ilike('name', `%${query}%`)
      }

      const { data, error } = await q

      if (error) {
        toast.error('Failed to search products.')
      } else {
        setSearchResults(data as Product[] ?? [])
      }
    } catch (err) {
      toast.error('An unexpected error occurred while searching.')
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (id && id !== 'new') {
      getData()
      getStoreProducts()
      setIsEdit(false)
    } else {
      setStore(defaultStore)
      setIsEdit(true)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(productSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!store.name.trim()) newErrors.name = 'Name is required.'
    if (!store.street.trim()) newErrors.street = 'Street is required.'
    if (!store.city.trim()) newErrors.city = 'City is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    try {
      if (id === 'new') {
        const { id: _, ...storeData } = store;
        const { error, data } = await supabase.from('stores').insert([storeData]).select();

        if (error) {
          toast.error('Error creating store')
          setLoading(false)
        } else {
          toast.success('Store created successfully!')
          if (data && data[0]?.id) {
            router.push(`/stores/${data[0].id}`)
          } else {
            router.push('/stores')
          }
        }
      } else {
        const { id: _, ...storeData } = store;
        const { error } = await supabase.from('stores').update(storeData).eq('id', id).select();

        if (error) {
          toast.error('Error updating store')
          setLoading(false)
        } else {
          toast.success('Store updated successfully!')
          setIsEdit(false)
          setLoading(false)
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
      setLoading(false)
    }
  };

  const toggleEdit = () => {
    setIsEdit(!isEdit);
    setErrors({})
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const { id: _, ...storeData } = store;
      const { error } = await supabase.from('stores')
        .update({ ...storeData, active: false, deleted_at: new Date() })
        .eq('id', id)
        .select();

      if (error) {
        toast.error('Error deleting store')
      } else {
        toast.success('Store deleted successfully!')
        router.push('/stores');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while deleting the store.')
    } finally {
      setLoading(false);
    }
  };

  // ---- Store Products handlers ----

  const isProductAdded = (productId: string) =>
    storeProducts.some((sp) => sp.product_id === productId)

  const handleAddProduct = async () => {
    if (!pendingProduct) return

    if (pendingPrice === null || pendingPrice === undefined) {
      setPendingErrors({ price: 'Store price is required.' })
      return
    }

    setPendingErrors({})

    try {
      const { data, error } = await supabase
        .from('stores_products')
        .insert([{
          store_id: id,
          product_id: pendingProduct.id,
          price: pendingPrice,
          availability: pendingAvailability,
        }])
        .select('*, product:products(id, name, recommended_price, active)')
        .single()

      if (error) {
        toast.error('Error adding product')
      } else {
        setStoreProducts((prev) => [...prev, data])
        setPendingProduct(null)
        setPendingPrice(null)
        setPendingAvailability(true)
        setProductSearch('')
        setPendingErrors({})
        toast.success('Product added to store successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred while adding the product.')
    }
  }

  const handleRemoveProduct = async (storeProductId: number) => {
    if (!confirm('Remove this product from the store?')) return
    try {
      const { error } = await supabase
        .from('stores_products')
        .delete()
        .eq('id', storeProductId)

      if (error) {
        toast.error('Error removing product')
      } else {
        setStoreProducts((prev) => prev.filter((sp) => sp.id !== storeProductId))
        toast.success('Product removed from store.')
      }
    } catch (err) {
      toast.error('An unexpected error occurred while removing the product.')
    }
  }

  const handleUpdateStoreProduct = async (
    storeProductId: number,
    field: 'price' | 'availability',
    value: number | boolean | null
  ) => {
    setStoreProducts((prev) =>
      prev.map((sp) => sp.id === storeProductId ? { ...sp, [field]: value } : sp)
    )
    try {
      const { error } = await supabase
        .from('stores_products')
        .update({ [field]: value })
        .eq('id', storeProductId)

      if (error) {
        toast.error('Error updating product')
        getStoreProducts()
      } else {
        toast.success('Product updated successfully.')
      }
    } catch (err) {
      toast.error('Failed to update product — changes reverted.')
      getStoreProducts()
    }
  }

  return (
    <>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push('/stores')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <p className="text-lg font-semibold">
          {id === 'new' ? 'Create New Store' : isEdit ? 'Edit Store' : 'View Store'}
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <FieldGroup className="mt-5">

            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                placeholder="Name"
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                disabled={!isEdit}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError className="text-red-500">{errors.name}</FieldError>}
            </Field>

            <div className="flex gap-4">
              <Field className="flex-1" data-invalid={!!errors.street || undefined}>
                <FieldLabel htmlFor="street">Street *</FieldLabel>
                <Input
                  id="street"
                  placeholder="Street"
                  value={store.street}
                  onChange={(e) => setStore({ ...store, street: e.target.value })}
                  disabled={!isEdit}
                  aria-invalid={!!errors.street}
                />
                {errors.street && <FieldError className="text-red-500">{errors.street}</FieldError>}
              </Field>

              <Field className="flex-1" data-invalid={!!errors.city || undefined}>
                <FieldLabel htmlFor="city">City *</FieldLabel>
                <Input
                  id="city"
                  placeholder="City"
                  value={store.city}
                  onChange={(e) => setStore({ ...store, city: e.target.value })}
                  disabled={!isEdit}
                  aria-invalid={!!errors.city}
                />
                {errors.city && <FieldError className="text-red-500">{errors.city}</FieldError>}
              </Field>
            </div>

            <div className="flex gap-4">
              <Field className="flex-1">
                <FieldLabel htmlFor="zip">Zip Code</FieldLabel>
                <Input
                  id="zip"
                  placeholder="Zip Code"
                  value={store.zip_code}
                  onChange={(e) => setStore({ ...store, zip_code: e.target.value })}
                  disabled={!isEdit}
                />
              </Field>

              <Field className="flex-1">
                <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  type="tel"
                  value={store.phone_number}
                  onChange={(e) => setStore({ ...store, phone_number: e.target.value })}
                  disabled={!isEdit}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <select
                id="timezone"
                value={store.timezone}
                onChange={(e) => setStore({ ...store, timezone: e.target.value })}
                disabled={!isEdit}
                className="w-full border rounded px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a timezone</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="America/Chicago">America/Chicago (CT)</option>
                <option value="America/Denver">America/Denver (MT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                <option value="America/Anchorage">America/Anchorage (AKT)</option>
                <option value="Pacific/Honolulu">Pacific/Honolulu (HT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                <option value="UTC">UTC</option>
              </select>
            </Field>

          </FieldGroup>

          <div className="flex gap-2 mt-4 justify-end">


            {!isEdit && id !== 'new' && (
              <Button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm flex h-10 items-center rounded-lg bg-red-500 font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            )}

            {isEdit ? (
              <Button type="button" onClick={handleSubmit} disabled={loading}
                className="px-4 py-2 text-sm flex h-10 items-center rounded-lg bg-blue-500 font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            ) : (
              <Button type="button" onClick={toggleEdit}
                className="px-4 py-2 text-sm flex h-10 items-center rounded-lg bg-blue-500 font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
                Edit
              </Button>
            )}
          </div>

          {/* ---- Products Section (only shown for existing stores) ---- */}
          {id !== 'new' && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">Store products</p>
              </div>

              {productsLoading ? (
                <p className="text-sm text-gray-500">Loading products...</p>
              ) : storeProducts.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">No products added to this store yet.</p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <WebProductTable storeProducts={storeProducts} handleUpdateStoreProduct={handleUpdateStoreProduct} handleRemoveProduct={handleRemoveProduct} />

                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4 mb-6">
                    {storeProducts.map((sp) => {
                     return <MobileProductCard sp={sp} handleUpdateStoreProduct={handleUpdateStoreProduct} handleRemoveProduct={handleRemoveProduct} />
                    })}
                  </div>
                </>
              )}

              {/* Add product panel */}
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Add Product</p>

                {!pendingProduct ? (
                  <>
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="mb-3"
                    />
                    <div className="max-h-48 overflow-y-auto divide-y">
                      {searchLoading ? (
                        <p className="text-sm text-gray-500 py-2">Searching...</p>
                      ) : searchResults.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No products found.</p>
                      ) : (
                        searchResults.map((product) => {
                          const added = isProductAdded(product.id)
                          return (
                            <div key={product.id} className="flex items-center justify-between py-2">
                              <div>
                                <p className="text-sm font-medium">{product.name}</p>
                                {product.recommended_price != null && (
                                  <p className="text-xs text-gray-500">
                                    Recommended: ${product.recommended_price}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                disabled={added}
                                onClick={() => {
                                  if (!added) {
                                    setPendingProduct(product)
                                    setPendingPrice(product.recommended_price)
                                    setPendingAvailability(true)
                                  }
                                }}
                                className={`h-8 px-3 text-xs rounded-lg text-white ${added
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-blue-500 hover:bg-blue-400'
                                  }`}
                              >
                                {added ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{pendingProduct.name}</p>
                        {pendingProduct.recommended_price != null && (
                          <p className="text-xs text-gray-500">
                            Recommended price: ${pendingProduct.recommended_price}
                          </p>
                        )}
                      </div>             
                    </div>

                    <FieldGroup>
                      <Field data-invalid={!!pendingErrors.price || undefined}>
                        <FieldLabel htmlFor="pending-price">Store Price *</FieldLabel>
                        <Input
                          id="pending-price"
                          type="number"
                          placeholder="Enter store price"
                          value={pendingPrice ?? ''}
                          onChange={(e) => {
                            setPendingPrice(e.target.value === '' ? null : Number(e.target.value))
                            if (pendingErrors.price) setPendingErrors({})
                          }}
                          aria-invalid={!!pendingErrors.price}
                        />
                        {pendingErrors.price && (
                          <FieldError className="text-red-500">{pendingErrors.price}</FieldError>
                        )}
                      </Field>

                      <Field orientation="horizontal" className="items-center gap-3">
                        <input
                          id="pending-availability"
                          type="checkbox"
                          checked={pendingAvailability}
                          onChange={(e) => setPendingAvailability(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <FieldLabel htmlFor="pending-availability">Available in this store</FieldLabel>
                      </Field>
                    </FieldGroup>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setPendingProduct(null)
                          setPendingPrice(null)
                          setPendingAvailability(true)
                          setPendingErrors({})
                        }}
                        className="h-8 px-3 text-xs rounded-lg bg-neutral-500 hover:bg-neutral-400 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddProduct}
                        className="h-8 px-3 text-xs rounded-lg bg-blue-500 hover:bg-blue-400 text-white"
                      >
                        Confirm Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}