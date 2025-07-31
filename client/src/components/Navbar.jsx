import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Analyze", path: "/analyze" },
    { name: "History", path: "/history" },
    { name: "Dashboard", path: "/dashboard-overview" },
    ...(user?.role === "admin"
      ? [{ name: "Admin Panel", path: "/admin" }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-300 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link
              to="/home"
              className="text-white font-bold text-xl flex items-center"
            >
             
              <img src="logo192.png" className="size-7 mr-2 rounded shadow-white" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-100">
                Excelytics Platform
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              {/* User Profile */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="ml-4 flex items-center"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-yellow-300 rounded-full blur opacity-75"></div>
                  <button
                    onClick={handleLogout}
                    className="relative bg-gradient-to-r from-yellow-400 to-yellow-200 text-indigo-800 px-4 py-1 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-700 bg-opacity-90">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className="text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full mt-2 bg-yellow-400 text-indigo-800 px-3 py-2 rounded-md text-base font-bold shadow"
              >
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
