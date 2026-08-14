// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'guest' | 'user' | 'content_manager' | 'admin';
  phone_number?: string;
  is_verified: boolean;
  created_at: string;
}

// Location Types
export interface Country {
  id: number;
  name: string;
  code: string;
  currency_code: string;
  currency_symbol: string;
  default_language: string;
}

export interface State {
  id: number;
  country_id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export interface Locality {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

// Store Types
export interface Store {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  is_active: boolean;
  is_featured: boolean;
}

export interface StoreBranch {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  city_id: number;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_time?: string;
  closing_time?: string;
  is_active: boolean;
}

// Catalog Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent?: number | null;
  icon: string;
  image_url: string | null;
  order: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: number;
  brand_id?: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  unit: string;
  size: string;
  color: string;
}

// Offer Types
export interface Offer {
  id: number;
  store_branch_id: number;
  product_id: number;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  title: string;
  description: string;
  coupon_code: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  status: 'draft' | 'active' | 'expired' | 'archived';
  is_active: boolean;
  savings: number;
}

// Flyer Types
export interface Flyer {
  id: number;
  store_branch_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image_url: string;
  thumbnail_url: string;
  pdf_url: string;
  page_count: number;
  status: 'draft' | 'active' | 'expired' | 'archived';
  is_active: boolean;
}

export interface FlyerPage {
  id: number;
  flyer_id: number;
  page_number: number;
  image_url: string;
  extracted_text: string;
}

// Shopping List Types
export interface ShoppingList {
  id: number;
  user_id: number;
  name: string;
  description: string;
  is_active: boolean;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  product_id: number;
  quantity: number;
  is_purchased: boolean;
  product?: Product;
}

// Favorites Types
export interface SavedOffer {
  id: number;
  user_id: number;
  offer_id: number;
  is_notified: boolean;
  saved_at: string;
}

export interface FavoriteStore {
  id: number;
  user_id: number;
  store_id: number;
  added_at: string;
}

export interface FavoriteProduct {
  id: number;
  user_id: number;
  product_id: number;
  note: string;
  added_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: unknown;
}

// Filter Types
export interface OfferFilters {
  store_id?: number;
  category_id?: number;
  city_id?: number;
  min_discount?: number;
  max_price?: number;
  min_price?: number;
  search?: string;
}

export interface ProductFilters {
  category_id?: number;
  brand_id?: number;
  search?: string;
}
