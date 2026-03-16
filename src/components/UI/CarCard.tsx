// src/components/UI/CarCard.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Users, Settings, Fuel } from "lucide-react";
import { authApi } from "../../lib/api";
import type { Vehicle } from "../../types";

interface CarCardProps {
  car: Vehicle;
  // callback provided by parent when custom booking logic is needed
  onBook?: (vehicleId: string) => void;
}

// Utility function to get correct image source
export const getImageSrc = (images: string[]) => {
  console.log("getImageSrc called with:", images);

  if (!images || images.length === 0) {
    console.log("No images array or empty, returning placeholder");
    return "https://via.placeholder.com/400x300";
  }

  const imageKey = images[0];
  console.log("First image key:", imageKey);

  // Check if it's a backend URL (starts with /uploads)
  if (imageKey.startsWith("/uploads/")) {
    const fullUrl = `http://localhost:3002${imageKey}`;
    console.log("Returning backend URL:", fullUrl);
    return fullUrl;
  }

  // Check if it's a localStorage key (starts with 'car_image_')
  if (imageKey.startsWith("car_image_")) {
    const dataUrl = localStorage.getItem(imageKey);
    if (dataUrl) {
      console.log("Returning localStorage data URL");
      return dataUrl;
    }
  }

  // Check if it's a data URL
  if (imageKey.startsWith("data:")) {
    console.log("Returning data URL");
    return imageKey;
  }

  // Check localStorage mapping for development (legacy)
  const mappings = JSON.parse(localStorage.getItem("imageMappings") || "{}");
  if (mappings[imageKey]) {
    console.log("Returning legacy mapping");
    return mappings[imageKey];
  }

  console.log("No match found, returning placeholder");
  // Return the URL as-is (will fallback to placeholder if not found)
  return imageKey;
};

export const CarCard = ({ car, onBook }: CarCardProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    authApi.getCurrentUser().then((user) => {
      if (mounted) setCurrentUserId(user?.id ?? null);
    });

    // Handle image loading with fallback
    const loadImage = async () => {
      try {
        // Try to get images from the server API
        const response = await fetch(
          `http://localhost:3002/api/vehicle/${car.id}/images`,
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.images.length > 0) {
            // Use the first image from the API
            const imageUrl = result.images[0];
            if (imageUrl.startsWith("/uploads/")) {
              setImageSrc(`http://localhost:3002${imageUrl}`);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch images from API:", error);
      }

      // Fallback to existing logic
      setImageSrc(getImageSrc(car.images));
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [car.images]);

  const isOwner = currentUserId === car.owner_id;

  const handleBookNow = () => {
    // navigate to booking page without any date parameters
    navigate(`/booking/${car.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={imageSrc}
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
