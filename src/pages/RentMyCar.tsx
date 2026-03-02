// src/pages/RentMyCar.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Upload,
  X,
  Plus,
  Car,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { vehicleApi, kycApi } from "../lib/api";
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
  features: string[];
}

const RentMyCar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>();

  useEffect(() => {
    checkUserAndKYC();
    loadUserVehicles();
  }, []);

  const checkUserAndKYC = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setUser(user);

    // First check the user's kyc_status from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("kyc_status")
      .eq("id", user.id)
      .single();

    if (userData && userData.kyc_status) {
      console.log("User KYC status from users table:", userData.kyc_status);
      setKycStatus(userData.kyc_status);
    } else {
      // Fallback to checking kyc_documents
      const { data: kycDocs } = await supabase
        .from("kyc_documents")
        .select("status")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(1);

      if (kycDocs && kycDocs.length > 0) {
        console.log("KYC status from documents:", kycDocs[0].status);
        setKycStatus(kycDocs[0].status);
      } else {
        setKycStatus(null);
      }
    }
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
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (vehicleId: string) => {
    const imageUrls: string[] = [];

    for (const image of images) {
      const fileName = `${vehicleId}/${Date.now()}_${image.name}`;
      const { data, error } = await supabase.storage
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

    if (kycStatus !== "approved") {
      toast.error("Please complete KYC verification before listing your car");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image of your car");
      return;
    }

    setUploading(true);

    try {
      // Create vehicle entry
      const vehicle = await vehicleApi.create({
        owner_id: user.id,
        ...data,
        features: data.features
          ? data.features.split(",").map((f) => f.trim())
          : [],
        images: [], // Will update after upload
        is_available: true,
      });

      // Upload images
      const imageUrls = await uploadImages(vehicle.id);

      // Update vehicle with image URLs
      await vehicleApi.update(vehicle.id, { images: imageUrls });

      toast.success("Vehicle listed successfully!");
      reset();
      setImages([]);
      setShowForm(false);
      loadUserVehicles();
    } catch (error) {
      console.error("Error listing vehicle:", error);
      toast.error("Failed to list vehicle. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    checkUserAndKYC();
    loadUserVehicles();
  }, []);

  // Add this useEffect to log when kycStatus changes
  useEffect(() => {
    console.log("Current kycStatus:", kycStatus);
    console.log("Should show Add button?", kycStatus === "approved");
  }, [kycStatus]);

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    const file = e.target.files[0];
    if (!file) return;

    try {
      await kycApi.uploadDocument(user.id, "drivers_license", file);

      // Also update the users table status
      await supabase
        .from("users")
        .update({ kyc_status: "pending" })
        .eq("id", user.id);

      toast.success("KYC document uploaded successfully! Pending review.");
      setKycStatus("pending");
    } catch (error) {
      console.error("Error uploading KYC:", error);
      toast.error("Failed to upload KYC document");
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await vehicleApi.delete(vehicleId);
      toast.success("Vehicle deleted successfully");
      loadUserVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            List Your Car
          </h1>
          <p className="text-lg text-gray-600">
            Earn money by sharing your car with trusted users
          </p>
        </div>

        {/* KYC Status Banner */}
        {kycStatus !== "approved" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 font-medium">
                  {kycStatus === "pending"
                    ? "Your KYC documents are under review. You will be able to list cars once approved."
                    : "Complete KYC verification to start listing your cars."}
                </p>
              </div>
              {kycStatus === null && (
                <div>
                  <label className="cursor-pointer bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                    <span>Upload License</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleKYCUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Vehicle Button */}
        {kycStatus === "approved" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Vehicle
          </button>
        )}

        {/* Vehicle Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Vehicle Details</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    {...register("make", { required: "Make is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Toyota"
                  />
                  {errors.make && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.make.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    {...register("model", { required: "Model is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Camry"
                  />
                  {errors.model && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.model.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    {...register("year", {
                      required: "Year is required",
                      min: {
                        value: 1990,
                        message: "Year must be 1990 or later",
                      },
                      max: {
                        value: new Date().getFullYear() + 1,
                        message: "Invalid year",
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.year.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    {...register("color", { required: "Color is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Silver"
                  />
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.color.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <select
                    {...register("transmission", {
                      required: "Transmission is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                  {errors.transmission && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.transmission.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    {...register("fuel_type", {
                      required: "Fuel type is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  {errors.fuel_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fuel_type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seats *
                  </label>
                  <input
                    type="number"
                    {...register("seats", {
                      required: "Number of seats is required",
                      min: { value: 2, message: "Minimum 2 seats" },
                      max: { value: 9, message: "Maximum 9 seats" },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {errors.seats && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.seats.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    {...register("license_plate", {
                      required: "License plate is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., TN 01 AB 1234"
                  />
                  {errors.license_plate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.license_plate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...register("location", {
                      required: "Location is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Chennai"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Rate ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("daily_rate", {
                      required: "Daily rate is required",
                      min: { value: 10, message: "Minimum rate is $10" },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {errors.daily_rate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.daily_rate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your car, any special features, rules, etc."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  {...register("features")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., GPS, Bluetooth, Backup Camera"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Images (Max 5) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "List Vehicle"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Vehicles List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Vehicles</h2>
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No vehicles listed yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start earning by listing your first vehicle
              </p>
              {kycStatus === "approved" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  List Your First Vehicle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <img
                    src={
                      vehicle.images[0] || "https://via.placeholder.com/400x300"
                    }
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {vehicle.location}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />$
                        {vehicle.daily_rate}/day
                      </p>
                      <p className="text-gray-600">
                        Status:{" "}
                        {vehicle.is_available ? (
                          <span className="text-green-600 font-medium">
                            Available
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Unavailable
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() =>
                          vehicleApi.update(vehicle.id, {
                            is_available: !vehicle.is_available,
                          })
                        }
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                          vehicle.is_available
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {vehicle.is_available
                          ? "Mark Unavailable"
                          : "Mark Available"}
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
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
