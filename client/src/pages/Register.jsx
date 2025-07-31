import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import AdminCodeModal from "../components/AdminCodeModal";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // If trying to register as admin, show the admin code modal instead of submitting
    if (formData.role === "admin") {
      setShowAdminCodeModal(true);
      return;
    }

    // For regular user registration
    setIsLoading(true);
    setTopError("");
    try {
      const response = await register(formData);
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        const { msg } = err.response.data;
        if (msg && msg.includes("already exists")) {
          setTopError("User already exists. Please try logging in.");
        } else {
          setTopError(msg || "Registration failed. Please try again.");
        }
      } else {
        setTopError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRegistration = async (adminCode) => {
    setIsLoading(true);
    setTopError("");
    try {
      const adminFormData = {
        ...formData,
        adminCode,
      };
      const response = await register(adminFormData);
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        const { msg, requiresAdminCode } = err.response.data;

        if (requiresAdminCode) {
          setTopError(
            "Invalid admin code. Please provide the correct administrator code."
          );
        } else if (msg && msg.includes("already exists")) {
          setTopError("User already exists. Please try logging in.");
        } else {
          setTopError(msg || "Registration failed. Please try again.");
        }
      } else {
        setTopError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setShowAdminCodeModal(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-indigo-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">Redirecting to login page...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-700 to-blue-300 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Excelytics Platform</h1>
          <p className="text-indigo-100 mt-1">Create your account</p>
        </div>

        <div className="p-6 space-y-4">
          {topError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm font-medium flex items-center"
            >
              <FiAlertCircle className="mr-2" />
              {topError}
            </motion.div>
          )}

          {errors.auth && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center"
            >
              <FiAlertCircle className="mr-2" />
              {errors.auth}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`pl-10 w-full px-3 py-2 rounded-lg border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`pl-10 w-full px-3 py-2 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`pl-10 w-full px-3 py-2 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`pl-10 w-full px-3 py-2 rounded-lg border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange("user")}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                    formData.role === "user"
                      ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  <FiUser className="mr-2" />
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                    formData.role === "admin"
                      ? "bg-purple-100 border-purple-500 text-purple-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  <FiShield className="mr-2" />
                  Administrator
                </button>
              </div>
            </div>

            {/* Admin Code Modal will be used instead of inline field */}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Register Now"
              )}
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or register with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  // If admin role is selected, show admin code modal first
                  if (formData.role === "admin") {
                    setShowAdminCodeModal(true);
                  } else {
                    // Regular user sign in with Google
                    setIsLoading(true);
                    loginWithGoogle("user")
                      .then((response) => {
                        navigate("/analyze");
                      })
                      .catch((error) => {
                        setTopError("Google sign in failed. Please try again.");
                      })
                      .finally(() => {
                        setIsLoading(false);
                      });
                  }
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                <FaGoogle className="text-blue-600 mr-2" />
                <span>
                  {formData.role === "admin"
                    ? "Continue with Google as Admin"
                    : "Continue with Google"}
                </span>
              </motion.button>

              {/* Admin Code Modal */}
              <AdminCodeModal
                isOpen={showAdminCodeModal}
                onClose={() => setShowAdminCodeModal(false)}
                onSubmit={(adminCode) => {
                  if (formData.password) {
                    // Using regular registration with admin code
                    handleAdminRegistration(adminCode);
                  } else {
                    // Using Google sign in with admin code
                    setIsLoading(true);
                    loginWithGoogle("admin", adminCode)
                      .then((response) => {
                        navigate("/admin");
                      })
                      .catch((error) => {
                        let errorMessage =
                          "Google sign in failed. Please try again.";

                        if (
                          error.response?.data?.message === "Invalid admin code"
                        ) {
                          errorMessage =
                            "Invalid administrator code. Please try again.";
                        }

                        setTopError(errorMessage);
                      })
                      .finally(() => {
                        setIsLoading(false);
                        setShowAdminCodeModal(false);
                      });
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
