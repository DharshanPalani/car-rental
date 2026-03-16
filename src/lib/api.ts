// src/lib/api.ts
import {
  authApi,
  vehicleApi,
  bookingApi,
  kycApi,
  databaseApi,
} from "./database";
import type { Vehicle, Booking, SearchFilters } from "../types";

// Re-export the APIs
export { authApi, vehicleApi, bookingApi, kycApi, databaseApi };

// Re-export types for convenience
export type { Vehicle, Booking, SearchFilters };

// Also export a default object with all APIs
export default {
  auth: authApi,
  vehicle: vehicleApi,
  booking: bookingApi,
  kyc: kycApi,
  database: databaseApi,
};
