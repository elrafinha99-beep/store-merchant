import { toast } from "sonner"
import { supabase } from "../supabase-client"

const stores = [
  { name: 'Downtown Market', street: '123 Main St', city: 'New York', zip_code: '10001', phone_number: '+1 212-555-0101', timezone: 'America/New_York', active: true },
  { name: 'Westside Grocery', street: '456 West Ave', city: 'Los Angeles', zip_code: '90001', phone_number: '+1 310-555-0102', timezone: 'America/Los_Angeles', active: true },
  { name: 'Lakefront Foods', street: '789 Lake Dr', city: 'Chicago', zip_code: '60601', phone_number: '+1 312-555-0103', timezone: 'America/Chicago', active: true },
  { name: 'Bayou Provisions', street: '321 Bourbon St', city: 'New Orleans', zip_code: '70112', phone_number: '+1 504-555-0104', timezone: 'America/Chicago', active: true },
  { name: 'Mile High Market', street: '654 Colfax Ave', city: 'Denver', zip_code: '80203', phone_number: '+1 720-555-0105', timezone: 'America/Denver', active: true },
  { name: 'Pacific Fresh', street: '987 Ocean Blvd', city: 'San Francisco', zip_code: '94101', phone_number: '+1 415-555-0106', timezone: 'America/Los_Angeles', active: true },
  { name: 'Harbor Deli', street: '111 Harbor View', city: 'Seattle', zip_code: '98101', phone_number: '+1 206-555-0107', timezone: 'America/Los_Angeles', active: true },
  { name: 'Peach State Market', street: '222 Peachtree Rd', city: 'Atlanta', zip_code: '30301', phone_number: '+1 404-555-0108', timezone: 'America/New_York', active: true },
  { name: 'Lone Star Foods', street: '333 Congress Ave', city: 'Austin', zip_code: '78701', phone_number: '+1 512-555-0109', timezone: 'America/Chicago', active: true },
  { name: 'Bean Town Grocery', street: '444 Newbury St', city: 'Boston', zip_code: '02101', phone_number: '+1 617-555-0110', timezone: 'America/New_York', active: true },
  { name: 'Sunshine Market', street: '555 Collins Ave', city: 'Miami', zip_code: '33101', phone_number: '+1 305-555-0111', timezone: 'America/New_York', active: true },
  { name: 'Emerald City Eats', street: '666 Pike St', city: 'Seattle', zip_code: '98102', phone_number: '+1 206-555-0112', timezone: 'America/Los_Angeles', active: true },
  { name: 'Music City Market', street: '777 Broadway', city: 'Nashville', zip_code: '37201', phone_number: '+1 615-555-0113', timezone: 'America/Chicago', active: true },
  { name: 'Desert Fresh', street: '888 Camelback Rd', city: 'Phoenix', zip_code: '85001', phone_number: '+1 602-555-0114', timezone: 'America/Denver', active: true },
  { name: 'Rose City Foods', street: '999 Burnside St', city: 'Portland', zip_code: '97201', phone_number: '+1 503-555-0115', timezone: 'America/Los_Angeles', active: true },
]

const products = [
  { name: 'Organic Whole Milk', description: 'Fresh organic whole milk, 1 gallon', recommended_price: 6.99, active: true },
  { name: 'Sourdough Bread', description: 'Artisan sourdough loaf, stone-baked', recommended_price: 5.49, active: true },
  { name: 'Free Range Eggs', description: 'Dozen free range brown eggs', recommended_price: 4.99, active: true },
  { name: 'Extra Virgin Olive Oil', description: 'Cold pressed, 500ml bottle', recommended_price: 12.99, active: true },
  { name: 'Aged Cheddar', description: '12-month aged cheddar, 200g block', recommended_price: 7.49, active: true },
  { name: 'Greek Yogurt', description: 'Plain full-fat Greek yogurt, 500g', recommended_price: 4.29, active: true },
  { name: 'Honey', description: 'Raw wildflower honey, 340g jar', recommended_price: 9.99, active: true },
  { name: 'Ground Coffee', description: 'Medium roast Arabica blend, 250g', recommended_price: 11.49, active: true },
  { name: 'Pasta', description: 'Durum wheat spaghetti, 500g', recommended_price: 2.99, active: true },
  { name: 'Tomato Sauce', description: 'San Marzano crushed tomatoes, 400g', recommended_price: 3.49, active: true },
  { name: 'Sparkling Water', description: 'Natural mineral sparkling water, 1L', recommended_price: 1.99, active: true },
  { name: 'Dark Chocolate', description: '70% cocoa dark chocolate bar, 100g', recommended_price: 3.99, active: true },
]

export default async function seed() {
  toast.message('Seeding database...')

  const { data: insertedStores, error: storesError } = await supabase
    .from('stores')
    .insert(stores)
    .select()

  if (storesError) {
    toast.error('Error inserting stores')
    return
  }

  // Insert products
  const { data: insertedProducts, error: productsError } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (productsError) {
    toast.error('Error inserting products')
    return
  } 
  

  // Assign products to stores — each store gets a random subset of products
  const storeProducts = []

  for (const store of insertedStores) {
    // Shuffle products and pick a random number between 3 and 8
    const shuffled = [...insertedProducts].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 6) + 3 // 3–8 products per store
    const selected = shuffled.slice(0, count)

    for (const product of selected) {
      // Add a small price variation (+/- 10%) around the recommended price
      const variation = 1 + (Math.random() * 0.2 - 0.1)
      const storePrice = Math.round(product.recommended_price * variation * 100) / 100

      storeProducts.push({
        store_id: store.id,
        product_id: product.id,
        price: storePrice,
        availability: Math.random() > 0.1, // 90% chance of being available
      })
    }
  }

  const { data: insertedSP, error: spError } = await supabase
    .from('stores_products')
    .insert(storeProducts)
    .select()

  if (spError) {
    toast.error('Error inserting store products:')
    return
  }
  toast.success('Seeding complete!')
}
