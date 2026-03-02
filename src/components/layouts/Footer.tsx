// src/components/Layout/Footer.tsx
import { Link } from "react-router-dom";
import {
  Car,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-xl">AutoShare</span>
            </div>
            <p className="text-gray-400 mb-4">
              Decentralized peer-to-peer automobile sharing platform connecting
              car owners with renters.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/rent-car"
                  className="text-gray-400 hover:text-white transition"
                >
                  Rent a Car
                </Link>
              </li>
              <li>
                <Link
                  to="/rent-my-car"
                  className="text-gray-400 hover:text-white transition"
                >
                  List My Car
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-400 hover:text-white transition"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/insurance"
                  className="text-gray-400 hover:text-white transition"
                >
                  Insurance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400">
                  Guru Nanak Salai, Velachery, Chennai - 600 042
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="text-gray-400">+91 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="text-gray-400">support@autoshare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} AutoShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
