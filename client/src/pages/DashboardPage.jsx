import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  FiUpload,
  FiBarChart2,
  FiTrendingUp,
  FiFile,
  FiClock,
  FiUsers,
  FiActivity,
  FiPieChart,
} from "react-icons/fi";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [darkMode] = useState(false); // can convert to toggle if needed
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalFiles: 0,
    recentActivity: [],
    chartTypes: {},
    weeklyUploads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("excelProUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch history data to calculate stats
      const historyRes = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const historyData = historyRes.data.data || [];

      // Calculate statistics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weeklyUploads = historyData.filter(
        (item) => new Date(item.createdAt) >= weekAgo
      ).length;

      const chartTypes = historyData.reduce((acc, item) => {
        acc[item.chartType] = (acc[item.chartType] || 0) + 1;
        return acc;
      }, {});

      const recentActivity = historyData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalUploads: historyData.length,
        totalFiles: new Set(historyData.map((item) => item.fileName)).size,
        recentActivity,
        chartTypes,
        weeklyUploads,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <hr />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div
          className={`py-10 px-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-gradient-to-r from-blue-700 to-blue-300 text-white"
          }`}
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || "User"}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your Excel analytics
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={FiUpload}
              title="Total Uploads"
              value={stats.totalUploads}
              subtitle="Files processed"
              color="border-blue-500"
            />
            <StatCard
              icon={FiFile}
              title="Unique Files"
              value={stats.totalFiles}
              subtitle="Different files"
              color="border-green-500"
            />
            <StatCard
              icon={FiTrendingUp}
              title="This Week"
              value={stats.weeklyUploads}
              subtitle="Recent uploads"
              color="border-purple-500"
            />
            <StatCard
              icon={FiBarChart2}
              title="Chart Types"
              value={Object.keys(stats.chartTypes).length}
              subtitle="Visualization types"
              color="border-orange-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 gap-8">
          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiClock className="text-indigo-600" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate("/history")}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>

            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <FiActivity className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <button
                  onClick={() => navigate("/analyze")}
                  className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Upload your first file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FiFile className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {item.fileName}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {item.chartType} chart created
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Chart Types Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <FiPieChart className="text-indigo-600" />
              Chart Types Used
            </h2>

            {Object.keys(stats.chartTypes).length === 0 ? (
              <div className="text-center py-8">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No charts created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.chartTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 capitalize">
                        {type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{
                            width: `${(count / stats.totalUploads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-8  bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/analyze")}
                className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <FiUpload className="text-indigo-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Upload New File</p>
                  <p className="text-gray-500 text-sm">Analyze Excel data</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <FiClock className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">View History</p>
                  <p className="text-gray-500 text-sm">Past uploads</p>
                </div>
              </button>

              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <FiActivity className="text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Refresh Data</p>
                  <p className="text-gray-500 text-sm">Update statistics</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
