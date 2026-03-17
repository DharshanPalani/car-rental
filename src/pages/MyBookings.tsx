// src/pages/MyBookings.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Car, Calendar, DollarSign } from "lucide-react";
import { authApi, bookingApi } from "../lib/api";
import { getImageSrc } from "../components/UI/CarCard";
import type { Booking } from "../types";

interface BookingWithVehicle extends Booking {
  vehicle?: {
    make: string;
    model: string;
    year: number;
    images: string[];
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const user = await authApi.getCurrentUser();

      if (!user) {
        toast.error("Please login to view your bookings");
        navigate("/login");
        return;
      }

      const userBookings: BookingWithVehicle[] =
        await bookingApi.getUserBookings(user.id, "customer");

      setBookings(userBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // console.log(bookings);
  // bookings.map((booking) => {
  //   console.log("My bookings");
  //   console.log(booking);
  // });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No bookings yet
              </h2>

              <p className="text-gray-600 mb-6">
                You haven't booked any cars yet. Start exploring available
                vehicles!
              </p>

              <button
                onClick={() => navigate("/rent-car")}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={getImageSrc(booking.vehicle?.images || [])}
                      alt={
                        booking.vehicle
                          ? `${booking.vehicle.make} ${booking.vehicle.model}`
                          : "Vehicle"
                      }
                      className="w-32 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {booking.vehicle
                          ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`
                          : "Vehicle Details"}
                      </h3>

                      <p className="text-gray-600 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(
                          booking.start_date,
                        ).toLocaleDateString()} —{" "}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </p>

                      <div className="flex items-center mt-2">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />

                        <span className="font-semibold text-green-600">
                          ${booking.total_cost}
                        </span>
                      </div>

                      <div className="mt-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                            booking.status,
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
