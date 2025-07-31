import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShield, FiCheck, FiAlertCircle } from "react-icons/fi";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminCodeModal({ isOpen, onClose, onSubmit }) {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminCode.trim()) {
      setError("Admin code is required");
      return;
    }

    setIsVerifying(true);

    try {
      // Temporary solution: Directly check if the admin code is correct
      // This is just for testing purposes - in production, this should be verified on the server
      const correctAdminCode = "anujk1504"; // Hardcoded admin code from server's .env file

      // Trim the input code and convert to lowercase for comparison
      const trimmedCode = adminCode.trim();

      console.log("Entered code:", trimmedCode);
      console.log("Correct code:", correctAdminCode);
      console.log("Do they match?", trimmedCode === correctAdminCode);
      console.log(
        "Case-insensitive match?",
        trimmedCode.toLowerCase() === correctAdminCode.toLowerCase()
      );

      // Check both exact match and case-insensitive match
      if (
        trimmedCode === correctAdminCode ||
        trimmedCode.toLowerCase() === correctAdminCode.toLowerCase()
      ) {
        // Admin code is valid, proceed with Google sign-in
        console.log("Admin code verified, proceeding...");
        onSubmit(adminCode);
      } else {
        console.log("Admin code invalid");
        setError("Invalid administrator code");
      }
    } catch (error) {
      console.error("Admin code verification failed:", error);
      setError("Invalid administrator code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed z-50 top-1/4 left-[545px]  transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center">
                <FiShield className="text-xl mr-2" />
                <h2 className="text-lg font-bold">
                  Administrator Verification
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-100 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Please enter the administrator code to continue with sign in.
                This code verifies that you are authorized to access
                administrator functions.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md mb-4 text-sm flex items-center"
                >
                  <FiAlertCircle className="mr-2" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="adminCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Administrator Code
                  </label>
                  <input
                    ref={inputRef}
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      setError("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter admin code"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isVerifying}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    {isVerifying ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck className="inline mr-1" />
                        Verify & Continue
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
