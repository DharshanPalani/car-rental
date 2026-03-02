// src/components/UI/CarCard.tsx
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Settings, Fuel } from "lucide-react";
import type { Vehicle } from "../../types";

interface CarCardProps {
  car: Vehicle;
  onBook?: (id: string) => void;
}

export const CarCard = ({ car, onBook }: CarCardProps) => {
  const navigate = useNavigate();

  const handleBook = () => {
    if (onBook) {
      onBook(car.id);
    } else {
      navigate(`/vehicle/${car.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={
          car.images[0] ||
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500"
        }
        alt={`${car.make} ${car.model}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">
          {car.make} {car.model} ({car.year})
        </h3>
        <p className="text-gray-600 flex items-center mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {car.location}
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="text-sm text-gray-600 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {car.seats} seats
          </span>
          <span className="text-sm text-gray-600 flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            {car.transmission === "manual" ? "Manual" : "Automatic"}
          </span>
          <span className="text-sm text-gray-600 flex items-center">
            <Fuel className="h-4 w-4 mr-1" />
            {car.fuel_type}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ${car.daily_rate}
            </span>
            <span className="text-gray-500">/day</span>
          </div>
          <button
            onClick={handleBook}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
