// src/lib/supabase.ts
import { createClient, type User } from "@supabase/supabase-js";
import type { Booking, KycDocument, Payment, Vehicle } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Vehicle, "id" | "created_at" | "updated_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Booking, "id" | "created_at" | "updated_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at">;
        Update: Partial<Omit<Payment, "id" | "created_at">>;
      };
      kyc_documents: {
        Row: KycDocument;
        Insert: Omit<KycDocument, "id" | "uploaded_at">;
        Update: Partial<Omit<KycDocument, "id" | "uploaded_at">>;
      };
    };
  };
};
