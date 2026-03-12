

export type Store = {
  id: string
  name: string
  city: string
  street: string
  zip_code: string | undefined
  phone_number: string | undefined
  timezone: string | undefined
  active: boolean
  deleted_at: Date | null
}


export type Product = {
  id: string
  name: string
  description: string
  recommended_price: number | null
  active: boolean
  deleted_at: Date | null
}

export type StoreProduct = {
  id?: number
  store_id: string
  product_id: string
  price: number | null
  availability: boolean
  product?: Product
}



