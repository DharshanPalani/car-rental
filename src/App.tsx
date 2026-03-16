// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/layouts/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import RentMyCar from "./pages/RentMyCar";
import RentCar from "./pages/RentCar";
import SearchResults from "./pages/SearchResults";
import BookingCheckout from "./pages/BookingCheckout";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="rent-my-car"
            element={
              <ProtectedRoute allowedRoles={["owner", "customer"]}>
                <RentMyCar />
              </ProtectedRoute>
            }
          />
          <Route path="rent-car" element={<RentCar />} />
          <Route path="search" element={<SearchResults />} />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="booking/:id"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <BookingCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
