import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  FiUsers,
  FiUpload,
  FiBarChart2,
  FiActivity,
  FiShield,
  FiTrash2,
  FiEye,
  FiSettings,
  FiDatabase,
  FiClock,
  FiEdit,
  FiUserCheck,
  FiUserX,
  FiSearch,
} from "react-icons/fi";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalUploads: 0,
    totalFiles: 0,
    recentUsers: [],
    recentUploads: [],
    systemStats: {},
  });
  const [darkMode] = useState(false); // can convert to toggle if needed
  const [allUsers, setAllUsers] = useState([]);
  const [allUploads, setAllUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("excelProUser");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check if user is admin
      if (parsedUser.role !== "admin") {
        navigate("/dashboard-overview");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch admin statistics
      const statsRes = await axios.get(
        "http://localhost:5000/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch all users
      const usersRes = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch all uploads
      const uploadsRes = await axios.get(
        "http://localhost:5000/api/admin/uploads",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const statsData = statsRes.data.data;
      const usersData = usersRes.data.data || [];
      const uploadsData = uploadsRes.data.data || [];

      setAdminStats({
        totalUsers: statsData.totalUsers,
        totalUploads: statsData.totalUploads,
        totalFiles: new Set(uploadsData.map((item) => item.fileName)).size,
        recentUsers: statsData.recentUsers || [],
        recentUploads: statsData.recentUploads || [],
        systemStats: {
          weeklyUploads: statsData.weeklyUploads,
          weeklyUsers: statsData.weeklyUsers,
          avgFilesPerUser: statsData.avgUploadsPerUser,
        },
      });

      setAllUsers(usersData);
      setAllUploads(uploadsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // If admin API fails, show error message instead of fallback data
      alert("Failed to fetch admin data. Please check your admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh data after deletion
      fetchAdminData();
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.error || "Failed to delete user");
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (
      !window.confirm("Are you sure you want to delete this upload record?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/admin/uploads/${uploadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh data after deletion
      fetchAdminData();
      alert("Upload record deleted successfully");
    } catch (error) {
      console.error("Error deleting upload:", error);
      alert(error.response?.data?.error || "Failed to delete upload record");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data after update
      fetchAdminData();
      alert(`User ${action}d successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert(error.response?.data?.error || "Failed to update user status");
    }
  };

  const handleChangeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user";

    if (
      !window.confirm(`Are you sure you want to make this user an ${newRole}?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data after update
      fetchAdminData();
      alert(`User role updated to ${newRole} successfully`);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.response?.data?.error || "Failed to update user role");
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedUser(response.data.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to fetch user details");
    }
  };

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      !userFilters.search ||
      user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(userFilters.search.toLowerCase());
    const matchesRole = !userFilters.role || user.role === userFilters.role;
    const matchesStatus =
      !userFilters.status || user.status === userFilters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full bg-opacity-10 ${color.replace(
            "border-",
            "bg-"
          )}`}
        >
          <Icon className={`w-6 h-6 ${color.replace("border-", "text-")}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        
        {/* Admin Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="text-red-600 text-3xl" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">
            System overview and user management panel
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            {[
              { key: "overview", label: "Overview", icon: FiBarChart2 },
              { key: "users", label: "Users", icon: FiUsers },
              { key: "uploads", label: "Uploads", icon: FiUpload },
              { key: "system", label: "System", icon: FiSettings },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={FiUsers}
                title="Total Users"
                value={adminStats.totalUsers}
                subtitle="Registered users"
                color="border-blue-500"
                onClick={() => setActiveTab("users")}
              />
              <StatCard
                icon={FiUpload}
                title="Total Uploads"
                value={adminStats.totalUploads}
                subtitle="Files processed"
                color="border-green-500"
                onClick={() => setActiveTab("uploads")}
              />
              <StatCard
                icon={FiDatabase}
                title="Unique Files"
                value={adminStats.totalFiles}
                subtitle="Different files"
                color="border-purple-500"
              />
              <StatCard
                icon={FiActivity}
                title="Weekly Activity"
                value={adminStats.systemStats.weeklyUploads || 0}
                subtitle="This week"
                color="border-orange-500"
              />
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <FiUsers className="text-blue-600" />
                  Recent Users
                </h2>
                <div className="space-y-3">
                  {adminStats.recentUsers.map((user, index) => (
                    <div
                      key={user._id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Uploads */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <FiClock className="text-green-600" />
                  Recent Uploads
                </h2>
                <div className="space-y-3">
                  {adminStats.recentUploads.slice(0, 5).map((upload, index) => (
                    <div
                      key={upload._id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FiUpload className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {upload.fileName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {upload.chartType} chart
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                User Management
              </h2>
              <div className="flex gap-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) =>
                      setUserFilters({ ...userFilters, search: e.target.value })
                    }
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={userFilters.role}
                  onChange={(e) =>
                    setUserFilters({ ...userFilters, role: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userFilters.status}
                  onChange={(e) =>
                    setUserFilters({ ...userFilters, status: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Name
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Email
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Role
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Status
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Joined
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-4 py-2 border-b">{user.email}</td>
                      <td className="px-4 py-2 border-b">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border-b">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => handleViewUser(user._id)}
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {user._id !== user?._id && (
                            <>
                              <button
                                className={`p-1 ${
                                  user.status === "active"
                                    ? "text-yellow-600 hover:text-yellow-800"
                                    : "text-green-600 hover:text-green-800"
                                }`}
                                onClick={() =>
                                  handleToggleUserStatus(user._id, user.status)
                                }
                                title={
                                  user.status === "active"
                                    ? "Deactivate User"
                                    : "Activate User"
                                }
                              >
                                {user.status === "active" ? (
                                  <FiUserX className="w-4 h-4" />
                                ) : (
                                  <FiUserCheck className="w-4 h-4" />
                                )}
                              </button>

                              {user.role !== "admin" && (
                                <>
                                  <button
                                    className="text-purple-600 hover:text-purple-800 p-1"
                                    onClick={() =>
                                      handleChangeUserRole(user._id, user.role)
                                    }
                                    title="Change Role"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>

                                  <button
                                    className="text-red-600 hover:text-red-800 p-1"
                                    onClick={() => handleDeleteUser(user._id)}
                                    title="Delete User"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching the current filters.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Uploads Tab */}
        {activeTab === "uploads" && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              All Uploads
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      File Name
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Chart Type
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Upload Date
                    </th>
                    <th className="px-4 py-2 border-b font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUploads.slice(0, 20).map((upload, index) => (
                    <tr
                      key={upload._id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-2 border-b">{upload.fileName}</td>
                      <td className="px-4 py-2 border-b">
                        <span className="capitalize">{upload.chartType}</span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        {new Date(upload.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border-b">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUpload(upload._id)}
                            title="Delete Upload Record"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Database Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">{adminStats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Uploads:</span>
                    <span className="font-medium">
                      {adminStats.totalUploads}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Files/User:</span>
                    <span className="font-medium">
                      {(adminStats.systemStats.avgFilesPerUser || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">System Health</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-lg font-semibold">
                      {selectedUser.user.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-lg">{selectedUser.user.email}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Role
                      </label>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedUser.user.role}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedUser.user.status}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Joined
                    </label>
                    <p>
                      {new Date(
                        selectedUser.user.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Last Activity
                    </label>
                    <p>
                      {new Date(selectedUser.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Upload Stats */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Uploads
                    </label>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedUser.uploadCount}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Recent Uploads
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedUser.uploads.length > 0 ? (
                        selectedUser.uploads.map((upload, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {upload.fileName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(upload.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No uploads yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedUser.user._id !== user?._id && (
                  <>
                    <button
                      onClick={() => {
                        handleToggleUserStatus(
                          selectedUser.user._id,
                          selectedUser.user.status
                        );
                        setShowUserModal(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        selectedUser.user.status === "active"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {selectedUser.user.status === "active"
                        ? "Deactivate"
                        : "Activate"}{" "}
                      User
                    </button>

                    {selectedUser.user.role !== "admin" && (
                      <>
                        <button
                          onClick={() => {
                            handleChangeUserRole(
                              selectedUser.user._id,
                              selectedUser.user.role
                            );
                            setShowUserModal(false);
                          }}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
                        >
                          Make{" "}
                          {selectedUser.user.role === "user" ? "Admin" : "User"}
                        </button>

                        <button
                          onClick={() => {
                            handleDeleteUser(selectedUser.user._id);
                            setShowUserModal(false);
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                        >
                          Delete User
                        </button>
                      </>
                    )}
                  </>
                )}

                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Footer */}
      <div
        className={`mt-12 py-8 ${
          darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"
        }`}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="font-bold text-lg mb-2">Excel Data Analyzer</h4>
              <p className="text-sm opacity-75">
                Transform your Excel data into powerful insights with our
                analysis tools
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Help
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-xs opacity-75">
              © 2025 Excel Analyzer. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
