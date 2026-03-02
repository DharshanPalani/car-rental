// src/lib/api.ts
import { supabase } from "./supabase";
import type { Vehicle, Booking, SearchFilters } from "../types";

export const authApi = {
  signUp: async (
    email: string,
    password: string,
    name: string,
    role: "owner" | "customer",
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

// Vehicle APIs
export const vehicleApi = {
  getAll: async (filters?: SearchFilters) => {
    let query = supabase
      .from("vehicles")
      .select(
        `
        *,
        owner:users(*)
      `,
      )
      .eq("is_available", true);

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.minPrice) {
      query = query.gte("daily_rate", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("daily_rate", filters.maxPrice);
    }

    if (filters?.make) {
      query = query.ilike("make", `%${filters.make}%`);
    }

    if (filters?.seats) {
      query = query.eq("seats", filters.seats);
    }

    if (filters?.transmission) {
      query = query.eq("transmission", filters.transmission);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Vehicle[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        owner:users(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  create: async (
    vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehicle)
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  update: async (id: string, updates: Partial<Vehicle>) => {
    const { data, error } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) throw error;
  },

  getOwnerVehicles: async (ownerId: string) => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", ownerId);

    if (error) throw error;
    return data as Vehicle[];
  },
};

// Booking APIs
export const bookingApi = {
  create: async (
    booking: Omit<Booking, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("bookings")
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        vehicle:vehicles(*),
        customer:users!customer_id(*),
        owner:users!owner_id(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  getUserBookings: async (userId: string, role: "customer" | "owner") => {
    const field = role === "customer" ? "customer_id" : "owner_id";

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        vehicle:vehicles(*)
      `,
      )
      .eq(field, userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: Booking["status"]) => {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  checkAvailability: async (
    vehicleId: string,
    startDate: string,
    endDate: string,
  ) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .in("status", ["pending", "accepted", "paid"])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) throw error;
    return data.length === 0;
  },
};

// KYC APIs
export const kycApi = {
  uploadDocument: async (userId: string, documentType: string, file: File) => {
    // Upload file to storage
    const fileName = `${userId}/${documentType}_${Date.now()}`;
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

    // Save document record
    const { data, error } = await supabase
      .from("kyc_documents")
      .insert({
        user_id: userId,
        document_type: documentType,
        document_url: publicUrl,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserDocuments: async (userId: string) => {
    const { data, error } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
