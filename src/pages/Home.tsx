// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Shield, Star, Users, Clock } from "lucide-react";
import { SearchBar } from "../components/UI/SearchBar";
import { CarCard } from "../components/UI/CarCard";
import { vehicleApi, authApi } from "../lib/api";
import type { Vehicle } from "../types";

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalUsers: 0,
    totalCities: 0,
  });

  useEffect(() => {
    fetchFeaturedCars();
    fetchStats();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      // determine if we need to exclude the signed-in user's own vehicles
      const user = await authApi.getCurrentUser();

      const vehicles = await vehicleApi.getAll({
        excludeOwnerId: user?.id,
      });

      setFeaturedCars(vehicles.slice(0, 6));
    } catch (error) {
      console.error("Error fetching featured cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total available vehicles
      const vehicles = await vehicleApi.getAll();
      const vehicleCount = vehicles.length;

      // For simplicity, set dummy stats
      setStats({
        totalVehicles: vehicleCount,
        totalUsers: 10, // dummy
        totalCities: 5, // dummy
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Share Cars, Save Money,{" "}
              <span className="text-primary-200">Go Anywhere</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              The decentralized platform connecting car owners with people who
              need wheels. Earn from your idle car or rent a car at affordable
              prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/rent-car"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition text-center"
              >
                Rent a Car
              </Link>
              <Link
                to="/rent-my-car"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition text-center"
              >
                List Your Car
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <div className="relative -mb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stats.totalVehicles}+
              </div>
              <div className="text-gray-600 font-medium">Cars Available</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stats.totalUsers}+
              </div>
              <div className="text-gray-600 font-medium">Happy Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stats.totalCities}+
              </div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AutoShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of car sharing with our decentralized
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
              <p className="text-gray-600">
                All users and vehicles are verified through our KYC process
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Star className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                No middlemen means better rates for both owners and renters
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Peer to Peer</h3>
              <p className="text-gray-600">
                Direct connection between car owners and renters
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Round-the-clock customer support for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check out some of our most popular cars available for rent
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No vehicles available yet
              </h3>
              <p className="text-gray-500">
                Be the first to list your car and start earning!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/rent-car"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with AutoShare in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-gray-600">
                  Create your account and complete the KYC verification process
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Role</h3>
                <p className="text-gray-600">
                  List your car as an owner or search for cars as a renter
                </p>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Book & Earn</h3>
                <p className="text-gray-600">
                  Rent a car for your needs or earn money from your idle vehicle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already sharing cars on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=owner"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              List Your Car
            </Link>
            <Link
              to="/register?role=customer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition"
            >
              Find a Car
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
