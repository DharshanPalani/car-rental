// src/pages/BookingCheckout.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Car } from "lucide-react";
import { authApi, bookingApi, vehicleApi } from "../lib/api";
import { getImageSrc } from "../components/UI/CarCard";
import type { Vehicle } from "../types";

// payment form removed – bookings are confirmed on‑spot without Stripe

const BookingCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const displayStart = todayStr;
  const displayEnd = todayStr;

  // Debug logs - remove in production
  console.log("BookingCheckout mounted with id:", id);
  console.log("vehicleApi:", vehicleApi);
  console.log("vehicleApi.getById:", vehicleApi?.getById);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && id) {
      initializeBooking();
    }
  }, [isAuthenticated, id]);

  const checkAuth = async () => {
    try {
      const user = await authApi.getCurrentUser();

      if (!user) {
        toast.error("Please login to continue with booking");
        navigate("/login", { state: { from: `/booking/${id}` } });
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Authentication error");
      navigate("/login");
    }
  };

  const initializeBooking = async () => {
    try {
      setLoading(true);
      console.log("Initializing booking with id:", id);

      // ignore dates, always today

      // Load vehicle details
      console.log("Loading vehicle details for ID:", id);
      if (!vehicleApi || typeof vehicleApi.getById !== "function") {
        console.error("vehicleApi.getById is not available:", vehicleApi);
        toast.error("API configuration error");
        return;
      }
      const vehicleData = await vehicleApi.getById(id!);
      console.log("Vehicle data loaded:", vehicleData);
      setVehicle(vehicleData);

      // Get current user
      console.log("Getting current user...");
      const user = await authApi.getCurrentUser();

      if (!user) {
        console.error("Error getting user");
        toast.error("Please login to continue with booking");
        navigate("/login", { state: { from: `/booking/${id}` } });
        return;
      }
      setUserId(user.id);

      // Prevent owners from booking their own vehicles
      if (vehicleData.owner_id === user.id) {
        toast.error("You cannot book your own vehicle");
        navigate("/rent-car");
        return;
      }
    } catch (error) {
      console.error("Detailed error in initializeBooking:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize booking",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!vehicle || !userId) return;
    setConfirming(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const daysComputed = Math.max(
        1,
        Math.ceil(
          (new Date(displayEnd).getTime() - new Date(displayStart).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const totalCost = daysComputed * vehicle.daily_rate;
      await bookingApi.create({
        vehicle_id: id!,
        customer_id: userId,
        owner_id: vehicle.owner_id,
        start_date: todayStr,
        end_date: todayStr,
        total_cost: totalCost,
        status: "paid",
      });
      toast.success("Booking confirmed!");
      navigate("/my-bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to confirm booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vehicle Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The vehicle you're trying to book doesn't exist.
          </p>
          <button
            onClick={() => navigate("/rent-car")}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Browse Cars
          </button>
        </div>
      </div>
    );
  }

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(displayEnd).getTime() - new Date(displayStart).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Complete Your Booking
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
                <div className="flex items-start space-x-4">
                  <img
                    src={getImageSrc(vehicle.images)}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vehicle.location}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
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
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Rental Period</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date
                    </label>
                    <p className="text-lg font-semibold">
                      {new Date(displayStart).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <p className="text-lg font-semibold">
                      {new Date(displayEnd).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">
                  Duration: {days} {days === 1 ? "day" : "days"}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Price Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${vehicle.daily_rate} x {days}{" "}
                      {days === 1 ? "day" : "days"}
                    </span>
                    <span className="font-semibold">
                      ${vehicle.daily_rate * days}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-semibold">$10</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-xl text-primary-600">
                        ${vehicle.daily_rate * days}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Your booking will be confirmed immediately and no online
                  payment is required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
