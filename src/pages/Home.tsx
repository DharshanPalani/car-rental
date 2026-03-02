// src/pages/Home.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  MapPin,
  Car,
  Shield,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { SearchBar } from "../components/UI/SearchBar";
import { CarCard } from "../components/UI/CarCard";

const Home = () => {
  const [featuredCars] = useState([
    {
      id: "1",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      daily_rate: 45,
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
      ],
      location: "Chennai",
      transmission: "automatic",
      seats: 5,
    },
    {
      id: "2",
      make: "Honda",
      model: "Civic",
      year: 2021,
      daily_rate: 40,
      images: [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500",
      ],
      location: "Bangalore",
      transmission: "manual",
      seats: 5,
    },
    {
      id: "3",
      make: "Hyundai",
      model: "Creta",
      year: 2023,
      daily_rate: 50,
      images: [
        "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=500",
      ],
      location: "Mumbai",
      transmission: "automatic",
      seats: 5,
    },
  ]);

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

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
              {window.innerWidth >= 768 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                </div>
              )}
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
              {window.innerWidth >= 768 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                </div>
              )}
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
