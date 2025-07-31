import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import AdminCodeModal from "../components/AdminCodeModal";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const [loginRole, setLoginRole] = useState("user");
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect message from registration
  useEffect(() => {
    if (location.state?.fromRegister) {
      setRedirectMessage("Registration successful! Please log in.");
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login(formData);

      // Redirect based on user role
      if (response?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard-overview");
      }
    } catch (err) {
      let message = "Login failed. Please try again.";

      if (err.response) {
        switch (err.response.status) {
          case 401:
            message = "Invalid email or password";
            break;
          case 403:
            message = "Account not verified. Please check your email.";
            break;
          default:
            message = err.response.data?.message || message;
        }
      } else if (err.message.includes("Network Error")) {
        message = "Cannot connect to server. Please check your connection.";
      }

      setErrors({ auth: message });
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-indigo-100 mt-1">Sign in to your account</p>
        </div>

        <div className="p-6 space-y-4">
          {redirectMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm font-medium flex items-center"
            >
              <FiCheckCircle className="mr-2" />
              {redirectMessage}
            </motion.div>
          )}

          {errors.auth && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm font-medium flex items-center"
            >
              <FiAlertCircle className="mr-2" />
              {errors.auth}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
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
                  autoComplete="username"
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
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

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
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="inline mr-2" />
                  Sign In
                </>
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
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center space-x-8 mb-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    name="loginRole"
                    value="user"
                    checked={loginRole === "user"}
                    onChange={() => setLoginRole("user")}
                  />
                  <span className="ml-2 flex items-center text-gray-700">
                    <FiUser className="mr-1" />
                    User
                  </span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                    name="loginRole"
                    value="admin"
                    checked={loginRole === "admin"}
                    onChange={() => setLoginRole("admin")}
                  />
                  <span className="ml-2 flex items-center text-gray-700">
                    <FiShield className="mr-1" />
                    Administrator
                  </span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (loginRole === "admin") {
                    setShowAdminCodeModal(true);
                  } else {
                    // Regular user sign in with Google
                    setIsLoading(true);
                    loginWithGoogle()
                      .then((response) => {
                        if (response.user.role === "admin") {
                          navigate("/admin");
                        } else {
                          navigate("/analyze");
                        }
                      })
                      .catch((error) => {
                        setErrors({
                          auth: "Google sign in failed. Please try again.",
                        });
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
                  {loginRole === "admin"
                    ? "Continue with Google as Admin"
                    : "Continue with Google"}
                </span>
              </motion.button>
            </div>

            {/* Admin Code Modal */}
            <AdminCodeModal
              isOpen={showAdminCodeModal}
              onClose={() => setShowAdminCodeModal(false)}
              onSubmit={(adminCode) => {
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

                    setErrors({ auth: errorMessage });
                  })
                  .finally(() => {
                    setIsLoading(false);
                    setShowAdminCodeModal(false);
                  });
              }}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              state={{ fromLogin: true }} // Pass state for potential redirect back
            >
              <FiUserPlus className="inline mr-1" />
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
