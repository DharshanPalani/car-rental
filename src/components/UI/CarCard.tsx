// src/components/UI/CarCard.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Users, Settings, Fuel } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Vehicle } from "../../types";

interface CarCardProps {
  car: Vehicle;
  // callback provided by parent when custom booking logic is needed
  onBook?: (vehicleId: string) => void;
}

export const CarCard = ({ car, onBook }: CarCardProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setCurrentUserId(user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isOwner = currentUserId === car.owner_id;

  const handleBookNow = () => {
    // navigate to booking page without any date parameters
    navigate(`/booking/${car.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={car.images[0] || "https://via.placeholder.com/400x300"}
        alt={`${car.make} ${car.model}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">
              {car.make} {car.model}
            </h3>
            <p className="text-gray-600">{car.year}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              ${car.daily_rate}
            </p>
            <p className="text-sm text-gray-500">per day</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {car.location}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {car.seats} seats
          </div>
          <div className="flex items-center text-gray-600">
            <Settings className="h-4 w-4 mr-2" />
            {car.transmission === "manual" ? "Manual" : "Automatic"}
          </div>
          <div className="flex items-center text-gray-600">
            <Fuel className="h-4 w-4 mr-2" />
            {car.fuel_type}
          </div>
        </div>

        {!isOwner && (
          <button
            onClick={() => {
              if (onBook) {
                onBook(car.id);
              } else {
                handleBookNow();
              }
            }}
            className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};
