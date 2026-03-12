"use client"

import { useEffect, useState } from "react";
import { Product } from "@/app/lib/definitions";
import { supabase } from "@/app/supabase-client";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const defaultProduct: Product = {
  id: '',
  name: '',
  description: '',
  recommended_price: null,
  active: true,
  deleted_at: null
}

type FormErrors = {
  name?: string
  recommended_price?: string
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product>(defaultProduct)
  const [loading, setLoading] = useState(id !== 'new')
  const [isEdit, setIsEdit] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})



  const getData = async () => {
    setLoading(true)
    try {
      const { error, data } = await supabase.from('products').select('*').eq('id', id).single();

      if (error) {
        toast.error('Failed to load product')
        setProduct(defaultProduct)
      } else {
        setProduct(data)
      }
    } catch (err) {
      toast.error('An unexpected error occurred while loading the product.')
      setProduct(defaultProduct)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && id !== 'new') {
      getData()
      setIsEdit(false)
    } else {
      setProduct(defaultProduct)
      setIsEdit(true)
    }
  }, [id])



  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!product.name.trim()) newErrors.name = 'Name is required.'
    if (product.recommended_price === null) {
      newErrors.recommended_price = 'Recommended price is required.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    try {
      if (id === 'new') {
        const { id: _, ...productData } = product;
        const { error, data } = await supabase.from('products').insert([productData]).select();

        if (error) {
          toast.error('Error creating product')
          setLoading(false) 
        } else {
          toast.success('Product created successfully!')
          if (data && data[0]?.id) {
            router.push(`/products/${data[0].id}`)
          } else {
            router.push('/products')
          }
        }
      } else {
        const { id: _, ...productData } = product;
        const { error } = await supabase.from('products').update(productData).eq('id', id).select();

        if (error) {
          toast.error('Error updating product: ' + error.message)
          setLoading(false)
        } else {
          toast.success('Product updated successfully!')
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
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const { id: _, ...productData } = product;
      const { error } = await supabase.from('products')
        .update({ ...productData, active: false, deleted_at: new Date() })
        .eq('id', id)
        .select();

      if (error) {
        toast.error('Error deleting product.')
      } else {
        toast.success('Product deleted successfully!')
        router.push('/products');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while deleting the product.')
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <p className="text-lg font-semibold">
          {id === 'new' ? 'Create New Product' : isEdit ? 'Edit Product' : 'View Product'}

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
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                disabled={!isEdit}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError className="text-red-500">{errors.name}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.recommended_price || undefined}>
              <FieldLabel htmlFor="recommended_price">Recommended price *</FieldLabel>
              <Input
                id="recommended_price"
                placeholder="Recommended price"
                type="number"
                value={product.recommended_price ?? ''}
                onChange={(e) => setProduct({ ...product, recommended_price: e.target.value === '' ? null : Number(e.target.value) })}
                disabled={!isEdit}
                aria-invalid={!!errors.recommended_price}
              />
              {errors.recommended_price && <FieldError className="text-red-500">{errors.recommended_price}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="Description"
                value={product.description ?? ''}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                disabled={!isEdit}
              />
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
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
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
        </>
      )}
    </>
  );
}