// src/pages/RentCar.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, MapPin, Car } from "lucide-react";
import { CarCard } from "../components/UI/CarCard";
import { vehicleApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Vehicle, SearchFilters } from "../types";

const RentCar = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get("location") || "",
    minPrice: undefined,
    maxPrice: undefined,
    transmission: undefined,
    seats: undefined,
  });

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      // include excludeOwnerId so that owners don't see their own cars when browsing
      const extendedFilters = { ...filters } as any;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        extendedFilters.excludeOwnerId = user.id;
      }

      const data = await vehicleApi.getAll(extendedFilters);
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVehicles();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      minPrice: undefined,
      maxPrice: undefined,
      transmission: undefined,
      seats: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Find Your Perfect Ride
          </h1>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="City or location"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per day)
                  </label>
                  <div className="flex space-x-4">
                    <div>
                      <input
                        type="number"
                        value={filters.minPrice || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "minPrice",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={filters.maxPrice || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "maxPrice",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Transmission */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value=""
                        checked={!filters.transmission}
                        onChange={() =>
                          handleFilterChange("transmission", undefined)
                        }
                        className="mr-2"
                      />
                      Any
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value="manual"
                        checked={filters.transmission === "manual"}
                        onChange={(e) =>
                          handleFilterChange("transmission", e.target.value)
                        }
                        className="mr-2"
                      />
                      Manual
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value="automatic"
                        checked={filters.transmission === "automatic"}
                        onChange={(e) =>
                          handleFilterChange("transmission", e.target.value)
                        }
                        className="mr-2"
                      />
                      Automatic
                    </label>
                  </div>
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seats
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 4, 5, 6, 7, 8].map((seatCount) => (
                      <button
                        key={seatCount}
                        onClick={() =>
                          handleFilterChange(
                            "seats",
                            filters.seats === seatCount ? undefined : seatCount,
                          )
                        }
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          filters.seats === seatCount
                            ? "bg-primary-600 text-white border-primary-600"
                            : "border-gray-300 hover:border-primary-500"
                        }`}
                      >
                        {seatCount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      Found{" "}
                      <span className="font-bold text-gray-900">
                        {vehicles.length}
                      </span>{" "}
                      vehicles
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center text-primary-600"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Vehicle Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No vehicles found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <CarCard key={vehicle.id} car={vehicle} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RentCar;
