// src/pages/Auth.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, User, Key, Mail, Phone } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Car className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {isLogin ? "Welcome Back!" : "Join AutoShare"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Auth Options */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-4">
            <Link
              to="/login"
              className="block w-full bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition text-center"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/register"
              className="block w-full bg-white text-primary-600 border-2 border-primary-600 px-6 py-4 rounded-lg font-semibold hover:bg-primary-50 transition text-center"
            >
              Create New Account
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to our{" "}
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
          </div>
        </div>

        {/* Role Selection Info */}
        <div className="mt-8 bg-primary-50 rounded-lg p-4">
          <h3 className="font-semibold text-primary-800 mb-2">
            Choose your role:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg p-3">
                <User className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Car Owner</p>
                <p className="text-xs text-gray-500">List your car & earn</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-3">
                <Key className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Renter</p>
                <p className="text-xs text-gray-500">Find & rent cars</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
