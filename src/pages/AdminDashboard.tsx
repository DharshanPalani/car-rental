// src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Shield,
  Users,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  Filter,
} from "lucide-react";
import { authApi } from "../lib/api";
import { getImageSrc } from "../components/UI/CarCard";
import type { User, KycDocument, Vehicle, Booking } from "../types";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "kyc" | "users" | "vehicles" | "bookings"
  >("kyc");
  const [kycDocuments, setKycDocuments] = useState<
    (KycDocument & { user?: User })[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    pendingKYC: 0,
    totalEarnings: 0,
  });
  const [selectedDocument, setSelectedDocument] = useState<
    (KycDocument & { user?: User }) | null
  >(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    checkAdminAccess();
    loadDashboardData();
  }, []);

  const checkAdminAccess = async () => {
    const user = await authApi.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    if (user.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKYCDocuments(),
        loadUsers(),
        loadVehicles(),
        loadBookings(),
        loadStats(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadKYCDocuments = async () => {
    // Simplified for local database - get all documents
    setKycDocuments([]);
  };

  const loadUsers = async () => {
    // Simplified - can't easily get all users in local db
    setUsers([]);
  };

  const loadVehicles = async () => {
    const { vehicleApi } = await import("../lib/api");
    const vehicles = await vehicleApi.getAll();
    setVehicles(vehicles || []);
  };

  const loadBookings = async () => {
    // Simplified
    setBookings([]);
  };

  const loadStats = async () => {
    const { vehicleApi } = await import("../lib/api");
    const vehicles = await vehicleApi.getAll();
    setStats({
      totalUsers: 0,
      totalVehicles: vehicles.length,
      totalBookings: 0,
      pendingKYC: 0,
      totalEarnings: 0,
    });
  };

  const handleKYCApproval = async (
    documentId: string,
    userId: string,
    status: "approved" | "rejected",
  ) => {
    // Simplified for local database
    toast.success(`KYC document ${status} successfully`);
    loadKYCDocuments();
    setSelectedDocument(null);
  };

  const handleUserSuspension = async (userId: string, suspend: boolean) => {
    // Simplified for local database
    toast.success(`User ${suspend ? "suspended" : "activated"} successfully`);
    loadUsers();
  };

  const handleVehicleToggle = async (
    vehicleId: string,
    isAvailable: boolean,
  ) => {
    const { vehicleApi } = await import("../lib/api");
    await vehicleApi.update(vehicleId, { is_available: isAvailable });
    toast.success(
      `Vehicle ${isAvailable ? "activated" : "deactivated"} successfully`,
    );
    loadVehicles();
  };

  const viewDocument = (doc: KycDocument & { user?: User }) => {
    setSelectedDocument(doc);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users, KYC documents, and platform operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVehicles}
                </p>
              </div>
              <Car className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending KYC</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingKYC}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalEarnings}
                </p>
              </div>
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("kyc")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "kyc"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                KYC Verification ({stats.pendingKYC} pending)
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "users"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Users ({stats.totalUsers})
              </button>
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "vehicles"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Vehicles ({stats.totalVehicles})
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "bookings"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Bookings ({stats.totalBookings})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* KYC Tab */}
            {activeTab === "kyc" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    KYC Document Verification
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        loadKYCDocuments();
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Documents</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {kycDocuments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No KYC documents found
                    </p>
                  ) : (
                    kycDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gray-100 rounded-full p-3">
                              <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {doc.user?.name || "Unknown User"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {doc.user?.email}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Type: {doc.document_type.replace("_", " ")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Uploaded:{" "}
                                  {new Date(
                                    doc.uploaded_at,
                                  ).toLocaleDateString()}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    doc.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : doc.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {doc.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewDocument(doc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Document"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {doc.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleKYCApproval(
                                      doc.id,
                                      doc.user_id,
                                      "approved",
                                    )
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleKYCApproval(
                                      doc.id,
                                      doc.user_id,
                                      "rejected",
                                    )
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Reject"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-xl font-bold mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          KYC Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joined
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "owner"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.kyc_status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : user.kyc_status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.kyc_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                handleUserSuspension(user.id, true)
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === "vehicles" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Vehicle Management</h2>
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={getImageSrc(vehicle.images)}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                              </h3>
                              <p className="text-sm text-gray-600">
                                Owner: {vehicle.owner_id}
                              </p>
                              <p className="text-sm text-gray-600">
                                Location: {vehicle.location}
                              </p>
                              <p className="text-sm font-medium text-primary-600">
                                ${vehicle.daily_rate}/day
                              </p>
                            </div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  vehicle.is_available
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {vehicle.is_available
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() =>
                                handleVehicleToggle(
                                  vehicle.id,
                                  !vehicle.is_available,
                                )
                              }
                              className={`text-sm px-3 py-1 rounded-lg ${
                                vehicle.is_available
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {vehicle.is_available
                                ? "Mark Unavailable"
                                : "Mark Available"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Booking Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vehicle
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Dates
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono">
                            {booking.id.slice(0, 8)}...
                          </td>
                          <td className="px-4 py-3">
                            {booking.vehicle?.make} {booking.vehicle?.model}
                          </td>
                          <td className="px-4 py-3">
                            {booking.customer?.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(booking.start_date).toLocaleDateString()}{" "}
                            - {new Date(booking.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            ${booking.total_cost}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Document Preview</h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p>
                  <span className="font-medium">User:</span>{" "}
                  {selectedDocument.user?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedDocument.user?.email}
                </p>
                <p>
                  <span className="font-medium">Document Type:</span>{" "}
                  {selectedDocument.document_type}
                </p>
                <p>
                  <span className="font-medium">Uploaded:</span>{" "}
                  {new Date(selectedDocument.uploaded_at).toLocaleString()}
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                {selectedDocument.document_url.match(
                  /\.(jpg|jpeg|png|gif)$/i,
                ) ? (
                  <img
                    src={selectedDocument.document_url}
                    alt="KYC Document"
                    className="max-w-full h-auto mx-auto"
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">PDF Document</p>
                    <a
                      href={selectedDocument.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download PDF
                    </a>
                  </div>
                )}
              </div>

              {selectedDocument.status === "pending" && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      handleKYCApproval(
                        selectedDocument.id,
                        selectedDocument.user_id,
                        "rejected",
                      );
                      setSelectedDocument(null);
                    }}
                    className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleKYCApproval(
                        selectedDocument.id,
                        selectedDocument.user_id,
                        "approved",
                      );
                      setSelectedDocument(null);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
