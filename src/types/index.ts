// src/types/index.ts
export type UserRole = "owner" | "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  kyc_status?: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  transmission: "manual" | "automatic";
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  daily_rate: number;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  description?: string;
  features?: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  vehicle_id: string;
  customer_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "paid"
    | "completed"
    | "cancelled";
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  stripe_payment_intent_id: string;
  created_at: string;
}

export interface KycDocument {
  id: string;
  user_id: string;
  document_type: "drivers_license" | "id_card" | "passport";
  document_url: string;
  status: "pending" | "approved" | "rejected";
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface SearchFilters {
  location?: string;
  // ISO date string (YYYY-MM-DD) or Date object; API normalizes internally
  startDate?: string | Date;
  endDate?: string | Date;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  seats?: number;
  // exclude vehicles owned by this user (useful when browsing for bookings)
  excludeOwnerId?: string;
}
