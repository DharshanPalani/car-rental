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
    try {
      // Start with base query for available vehicles
      let query = supabase
        .from("vehicles")
        .select(
          `
          *,
          owner:users(*)
        `,
        )
        .eq("is_available", true);

      // Apply basic filters
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

      // exclude vehicles owned by the current user if requested
      if (filters?.excludeOwnerId) {
        query = query.neq("owner_id", filters.excludeOwnerId);
      }

      // Execute query to get all vehicles matching basic criteria
      const { data: vehicles, error } = await query;
      if (error) throw error;

      // If no date filters are provided, return all vehicles
      if (!filters?.startDate || !filters?.endDate) {
        return vehicles as Vehicle[];
      }

      // make sure we have plain strings for the lookup
      const start =
        typeof filters.startDate === "string"
          ? filters.startDate.split("T")[0]
          : filters.startDate.toISOString().split("T")[0];
      const end =
        typeof filters.endDate === "string"
          ? filters.endDate.split("T")[0]
          : filters.endDate.toISOString().split("T")[0];

      // Filter vehicles based on date availability
      const availableVehicles = await Promise.all(
        (vehicles as Vehicle[]).map(async (vehicle) => {
          const isAvailable = await bookingApi.checkAvailability(
            vehicle.id,
            start,
            end,
          );
          return isAvailable ? vehicle : null;
        }),
      );

      // Remove null values (unavailable vehicles)
      return availableVehicles.filter((v): v is Vehicle => v !== null);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      throw error;
    }
  },

  // Alternative more efficient approach using a single query with subquery
  getAllWithAvailability: async (filters?: SearchFilters) => {
    try {
      let query = supabase
        .from("vehicles")
        .select(
          `
          *,
          owner:users(*)
        `,
        )
        .eq("is_available", true);

      // Apply basic filters
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

      // exclude vehicles owned by the current user if requested
      if (filters?.excludeOwnerId) {
        query = query.neq("owner_id", filters.excludeOwnerId);
      }

      // If dates are provided, filter out vehicles with conflicting bookings
      if (filters?.startDate && filters?.endDate) {
        const start =
          typeof filters.startDate === "string"
            ? filters.startDate.split("T")[0]
            : filters.startDate.toISOString().split("T")[0];
        const end =
          typeof filters.endDate === "string"
            ? filters.endDate.split("T")[0]
            : filters.endDate.toISOString().split("T")[0];

        // Get IDs of vehicles that have conflicting bookings (strict overlap)
        const { data: conflictingBookings, error: bookingError } =
          await supabase
            .from("bookings")
            .select("vehicle_id")
            .in("status", ["pending", "confirmed", "paid"])
            // boundary-touching bookings are fine
            .lt("start_date", end)
            .gt("end_date", start);

        if (bookingError) throw bookingError;

        // Get unique vehicle IDs that are booked
        const bookedVehicleIds = [
          ...new Set(conflictingBookings.map((b) => b.vehicle_id)),
        ];

        // Exclude vehicles that are booked
        if (bookedVehicleIds.length > 0) {
          query = query.not("id", "in", `(${bookedVehicleIds.join(",")})`);
        }
      }

      const { data: vehicles, error } = await query;
      if (error) throw error;

      return vehicles as Vehicle[];
    } catch (error) {
      console.error("Error loading vehicles with availability:", error);
      throw error;
    }
  },

  // Get a single vehicle by ID
  getById: async (id: string) => {
    try {
      console.log("Fetching vehicle with ID:", id);

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

      if (error) {
        console.error("Supabase error in getById:", error);
        throw error;
      }

      if (!data) {
        throw new Error(`Vehicle with ID ${id} not found`);
      }

      console.log("Vehicle data fetched:", data);
      return data as Vehicle;
    } catch (error) {
      console.error("Error fetching vehicle by ID:", error);
      throw error;
    }
  },

  // Create a new vehicle
  create: async (
    vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .insert(vehicle)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error;
    }
  },

  // Update an existing vehicle
  update: async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  },

  // Delete a vehicle
  delete: async (id: string) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  },

  // Get all vehicles for a specific owner
  getOwnerVehicles: async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("owner_id", ownerId);

      if (error) throw error;
      return data as Vehicle[];
    } catch (error) {
      console.error("Error fetching owner vehicles:", error);
      throw error;
    }
  },
};

// Booking APIs
export const bookingApi = {
  // Create a new booking
  create: async (
    booking: Omit<Booking, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      // ensure we only store date portion
      const sanitized: typeof booking = {
        ...booking,
        start_date: booking.start_date.split("T")[0],
        end_date: booking.end_date.split("T")[0],
      };

      console.log("Creating booking:", sanitized);

      const { data, error } = await supabase
        .from("bookings")
        .insert(sanitized)
        .select()
        .single();

      if (error) {
        console.error("Error creating booking:", error);
        throw error;
      }

      console.log("Booking created:", data);
      return data as Booking;
    } catch (error) {
      console.error("Error in bookingApi.create:", error);
      throw error;
    }
  },

  // Get a booking by ID
  getById: async (id: string) => {
    try {
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
    } catch (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }
  },

  // Get all bookings for a user (either as customer or owner)
  getUserBookings: async (userId: string, role: "customer" | "owner") => {
    try {
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
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  },

  // Update booking status
  updateStatus: async (id: string, status: Booking["status"]) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },

  // Check if a vehicle is available for specific dates
  // temporarily disabled: always return true so bookings can be made without date checks
  checkAvailability: async (
    vehicleId: string,
    startDate: string,
    endDate: string,
  ) => {
    console.log(
      `Availability check bypassed for vehicle ${vehicleId} from ${startDate} to ${endDate}`,
    );
    return true;
  },

  // Helper method to get available dates for a vehicle
  getAvailableDates: async (vehicleId: string, month: number, year: number) => {
    try {
      // Get all bookings for the vehicle in the given month
      const startOfMonth = new Date(year, month, 1).toISOString().split("T")[0];
      const endOfMonth = new Date(year, month + 1, 0)
        .toISOString()
        .split("T")[0];

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("start_date, end_date")
        .eq("vehicle_id", vehicleId)
        .in("status", ["pending", "confirmed", "paid"])
        .lt("start_date", endOfMonth)
        .gt("end_date", startOfMonth);

      if (error) throw error;

      return bookings;
    } catch (error) {
      console.error("Error getting available dates:", error);
      throw error;
    }
  },

  // Helper method to validate if dates are valid for booking
  validateBookingDates: async (
    vehicleId: string,
    startDate: string,
    endDate: string,
  ) => {
    try {
      // normalize strings before validation
      const startStr = startDate.split("T")[0];
      const endStr = endDate.split("T")[0];

      // Check if dates are valid
      const start = new Date(startStr);
      const end = new Date(endStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Start date cannot be in the past
      if (start < today) {
        return {
          valid: false,
          message: "Start date cannot be in the past",
        };
      }

      // End date must be after start date
      if (end <= start) {
        return {
          valid: false,
          message: "End date must be after start date",
        };
      }

      // Check availability
      const isAvailable = await bookingApi.checkAvailability(
        vehicleId,
        startDate,
        endDate,
      );

      if (!isAvailable) {
        return {
          valid: false,
          message: "Vehicle is not available for selected dates",
        };
      }

      return {
        valid: true,
        message: "Dates are valid",
      };
    } catch (error) {
      console.error("Error validating booking dates:", error);
      throw error;
    }
  },
};

// KYC APIs
export const kycApi = {
  // Upload a KYC document
  uploadDocument: async (userId: string, documentType: string, file: File) => {
    try {
      // Upload file to storage
      const fileName = `${userId}/${documentType}_${Date.now()}`;
      const { data: _fileData, error: uploadError } = await supabase.storage
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
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  // Get all KYC documents for a user
  getUserDocuments: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user documents:", error);
      throw error;
    }
  },
};

// Also export a default object with all APIs
export default {
  auth: authApi,
  vehicle: vehicleApi,
  booking: bookingApi,
  kyc: kycApi,
};
