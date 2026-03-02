// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Lock, User, Phone, Car, Key } from "lucide-react";
import { authApi } from "../lib/api";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "owner" | "customer";
}

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const defaultRole =
    (searchParams.get("role") as "owner" | "customer") || "customer";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: defaultRole,
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await authApi.signUp(data.email, data.password, data.name, data.role);
      toast.success(
        "Registration successful! Please check your email to verify your account.",
      );
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Car className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    watch("role") === "customer"
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-300 hover:border-primary-400"
                  }`}
                >
                  <input
                    type="radio"
                    value="customer"
                    {...register("role", { required: "Please select a role" })}
                    className="hidden"
                  />
                  <Key
                    className={`h-6 w-6 mx-auto mb-2 ${
                      watch("role") === "customer"
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      watch("role") === "customer"
                        ? "text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    Rent a Car
                  </p>
                </label>

                <label
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    watch("role") === "owner"
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-300 hover:border-primary-400"
                  }`}
                >
                  <input
                    type="radio"
                    value="owner"
                    {...register("role", { required: "Please select a role" })}
                    className="hidden"
                  />
                  <Car
                    className={`h-6 w-6 mx-auto mb-2 ${
                      watch("role") === "owner"
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      watch("role") === "owner"
                        ? "text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    List My Car
                  </p>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
