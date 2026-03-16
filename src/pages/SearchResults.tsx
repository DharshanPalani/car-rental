// src/pages/SearchResults.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Grid, List } from "lucide-react";
import { CarCard } from "../components/UI/CarCard";
import { vehicleApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Vehicle } from "../types";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rating">(
    "price_asc",
  );

  const location = searchParams.get("location");

  useEffect(() => {
    loadVehicles();
  }, [location, sortBy]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const filters: any = {
        location: location || undefined,
      };

      // figure out current user to exclude their own listings
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        filters.excludeOwnerId = user.id;
      }

      let data: Vehicle[] = await vehicleApi.getAll(filters);

      // Sort vehicles
      data = data.sort((a, b) => {
        if (sortBy === "price_asc") return a.daily_rate - b.daily_rate;
        if (sortBy === "price_desc") return b.daily_rate - a.daily_rate;
        return 0; // Default
      });

      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (vehicleId: string) => {
    navigate(`/booking/${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                {location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <CarCard key={vehicle.id} car={vehicle} onBook={handleBooking} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
              >
                <img
                  src={
                    vehicle.images[0] || "https://via.placeholder.com/400x300"
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full md:w-64 h-48 object-cover"
                />
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {vehicle.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ${vehicle.daily_rate}
                      </p>
                      <p className="text-sm text-gray-500">per day</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <span className="text-sm text-gray-600">
                      {vehicle.transmission === "manual"
                        ? "Manual"
                        : "Automatic"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {vehicle.seats} seats
                    </span>
                    <span className="text-sm text-gray-600">
                      {vehicle.fuel_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBooking(vehicle.id)}
                    className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
