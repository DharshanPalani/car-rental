import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Upload, X, Plus, Car, MapPin, DollarSign } from "lucide-react";

import { supabase } from "../lib/supabase";
import { vehicleApi } from "../lib/api";
import type { Vehicle } from "../types";

interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  transmission: "manual" | "automatic";
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  daily_rate: number;
  location: string;
  description: string;
  features: string;
}

const RentMyCar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>();

  useEffect(() => {
    checkUser();
    loadUserVehicles();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setUser(user);
  };

  const loadUserVehicles = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const vehicles = await vehicleApi.getOwnerVehicles(user.id);
      setVehicles(vehicles);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newImages = Array.from(e.target.files);
    setImages([...images, ...newImages].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (vehicleId: string) => {
    const imageUrls: string[] = [];

    for (const image of images) {
      const fileName = `${vehicleId}/${Date.now()}_${image.name}`;

      const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, image);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("vehicle-images").getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (!user) {
      toast.error("Please login to list your car");
      return;
    }

    if (images.length === 0) {
      toast.error("Upload at least one image");
      return;
    }

    setUploading(true);

    try {
      const vehicle = await vehicleApi.create({
        owner_id: user.id,
        ...data,
        features: data.features
          ? data.features.split(",").map((f) => f.trim())
          : [],
        images: [],
        is_available: true,
      });

      const imageUrls = await uploadImages(vehicle.id);

      await vehicleApi.update(vehicle.id, {
        images: imageUrls,
      });

      toast.success("Vehicle listed successfully!");

      reset();
      setImages([]);
      setShowForm(false);

      loadUserVehicles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to list vehicle");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Delete this vehicle?")) return;

    try {
      await vehicleApi.delete(vehicleId);
      toast.success("Vehicle deleted");
      loadUserVehicles();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">List Your Car</h1>
          <p className="text-gray-600">Earn money by renting your vehicle</p>
        </div>

        {/* Add vehicle */}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        )}

        {/* Form */}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Vehicle Details</h2>
              <button onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  placeholder="Make"
                  {...register("make", { required: true })}
                  className="input"
                />

                <input
                  placeholder="Model"
                  {...register("model", { required: true })}
                  className="input"
                />

                <input
                  type="number"
                  placeholder="Year"
                  {...register("year", { required: true })}
                  className="input"
                />

                <input
                  placeholder="Color"
                  {...register("color", { required: true })}
                  className="input"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <select {...register("transmission")} className="input">
                  <option value="">Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>

                <select {...register("fuel_type")} className="input">
                  <option value="">Fuel</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>

                <input
                  type="number"
                  placeholder="Seats"
                  {...register("seats")}
                  className="input"
                />
              </div>

              <input
                placeholder="License Plate"
                {...register("license_plate")}
                className="input"
              />

              <input
                placeholder="Location"
                {...register("location")}
                className="input"
              />

              <input
                type="number"
                placeholder="Daily Rate"
                {...register("daily_rate")}
                className="input"
              />

              <textarea
                placeholder="Description"
                {...register("description")}
                className="input"
              />

              <input
                placeholder="Features (comma separated)"
                {...register("features")}
                className="input"
              />

              {/* Image Upload */}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      className="h-32 w-full object-cover rounded"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="border-2 border-dashed rounded h-32 flex items-center justify-center cursor-pointer">
                    <Upload />

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg"
                >
                  {uploading ? "Uploading..." : "List Vehicle"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles */}

        <div>
          <h2 className="text-2xl font-bold mb-6">My Vehicles</h2>

          {vehicles.length === 0 ? (
            <div className="bg-white p-10 rounded shadow text-center">
              <Car className="mx-auto mb-4 text-gray-400" size={40} />

              <p className="text-gray-500 mb-4">No vehicles listed yet</p>

              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded"
              >
                List Vehicle
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded shadow">
                  <img
                    src={vehicle.images[0] || "https://via.placeholder.com/400"}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">
                      {vehicle.make} {vehicle.model}
                    </h3>

                    <p className="text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {vehicle.location}
                    </p>

                    <p className="text-gray-600 flex items-center">
                      <DollarSign size={14} className="mr-1" />$
                      {vehicle.daily_rate}/day
                    </p>

                    <div className="flex mt-4 gap-2">
                      <button
                        onClick={() =>
                          vehicleApi.update(vehicle.id, {
                            is_available: !vehicle.is_available,
                          })
                        }
                        className="flex-1 bg-yellow-100 text-yellow-700 py-1 rounded"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="bg-red-100 text-red-700 px-3 rounded"
                      >
                        Delete
                      </button>
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

export default RentMyCar;
