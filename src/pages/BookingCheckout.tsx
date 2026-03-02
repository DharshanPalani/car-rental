// src/pages/BookingCheckout.tsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { Calendar, MapPin, DollarSign, Shield, Clock, Car } from "lucide-react";
import { supabase } from "../lib/supabase";
import { bookingApi, vehicleApi } from "../lib/api";
import type { Vehicle, Booking } from "../types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({
  booking,
  vehicle,
  onSuccess,
}: {
  booking: Booking;
  vehicle: Vehicle;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?booking_id=${booking.id}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
    } else {
      // Update booking status
      await bookingApi.updateStatus(booking.id, "paid");
      toast.success("Booking confirmed!");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing..." : `Pay $${booking.total_cost}`}
      </button>
    </form>
  );
};

const BookingCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  useEffect(() => {
    if (!id || !startDate || !endDate) {
      navigate("/rent-car");
      return;
    }
    initializeBooking();
  }, [id, startDate, endDate]);

  const initializeBooking = async () => {
    try {
      // Load vehicle details
      const vehicleData = await vehicleApi.getById(id!);
      setVehicle(vehicleData);

      // Calculate total cost
      const start = new Date(startDate!);
      const end = new Date(endDate!);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const totalCost = days * vehicleData.daily_rate;

      // Check availability
      const isAvailable = await bookingApi.checkAvailability(
        id!,
        startDate!,
        endDate!,
      );
      if (!isAvailable) {
        toast.error("Vehicle is not available for selected dates");
        navigate("/rent-car");
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Create booking
      const bookingData = await bookingApi.create({
        vehicle_id: id!,
        customer_id: user.id,
        owner_id: vehicleData.owner_id,
        start_date: startDate!,
        end_date: endDate!,
        total_cost: totalCost,
        status: "pending",
      });

      setBooking(bookingData);

      // Create payment intent (you'll need to implement this on your backend)
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalCost * 100, // in cents
          booking_id: bookingData.id,
        }),
      });

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Error initializing booking:", error);
      toast.error("Failed to initialize booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vehicle || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking you're looking for doesn't exist.
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

  const days = Math.ceil(
    (new Date(endDate!).getTime() - new Date(startDate!).getTime()) /
      (1000 * 60 * 60 * 24),
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
                    src={
                      vehicle.images[0] || "https://via.placeholder.com/200x150"
                    }
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
                      {new Date(startDate!).toLocaleDateString("en-US", {
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
                      {new Date(endDate!).toLocaleDateString("en-US", {
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
                <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      booking={booking}
                      vehicle={vehicle}
                      onSuccess={() => navigate("/booking/success")}
                    />
                  </Elements>
                )}
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
                        ${booking.total_cost}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Your payment is secure and encrypted</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Free cancellation within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
