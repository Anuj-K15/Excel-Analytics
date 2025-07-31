import { useState, useEffect } from "react";
import { uploadFile } from "../api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ChartVisualizer from "../components/ChartVisualizer";
import ReportViewer from "../components/ReportViewer";
import {
  FiUpload,
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiHome,
  FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [darkMode] = useState(false); // can convert to toggle if needed
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [aiReportHtml, setAiReportHtml] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const navigate = useNavigate();

  // Show scroll to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const EXCEL_MIME_TYPES = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setMessage({ text: "", type: "" });

    const isValidFile =
      EXCEL_MIME_TYPES.includes(selectedFile.type) ||
      [".xlsx", ".xls"].some((ext) =>
        selectedFile.name.toLowerCase().endsWith(ext)
      );

    if (isValidFile) {
      setFile(selectedFile);
      setMessage({ text: `✅ Selected: ${selectedFile.name}`, type: "info" });
    } else {
      setFile(null);
      setMessage({
        text: "❌ Invalid file type. Please upload .xlsx or .xls files only.",
        type: "error",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: "⚠️ Please select a file first!", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "⏳ Uploading and analyzing...", type: "info" });

    try {
      // Use the uploadFile function from api.js
      const response = await uploadFile(file);

      // Check if response has the expected data structure
      if (!response?.data) throw new Error("Invalid server response");

      setData(response.data);
      setMessage({
        text: response.msg || "✅ File processed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Upload error:", error);

      // The error handling is already done in the uploadFile function
      // We just need to display the error message
      setMessage({
        text: error.message || "❌ Upload failed. Try again.",
        type: "error",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Account for header
        behavior: "smooth",
      });
    }
  };

  // Format plain text report to HTML with proper formatting
  function formatReportToHtml(text) {
    // Format headings (# Heading, ## Subheading, etc.)
    let html = text
      .replace(
        /^### (.*)$/gm,
        '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
      )
      .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
      .replace(/\n\n/g, "<br/><br/>"); // Line breaks

    // Format tables
    html = html.replace(/(\|.*\|.*\n)+/g, (match) => {
      if (match.includes("|")) {
        const rows = match.trim().split("\n").filter(Boolean);
        // Check if there's a table header separator row
        if (rows.length > 1 && rows[1].match(/^\|?[\s-:]+\|[\s-:|]+$/)) {
          const headerRow = rows[0];
          const headerCells = headerRow
            .split("|")
            .slice(1, -1)
            .map(
              (cell) =>
                `<th class="border px-4 py-2 bg-gray-100">${cell.trim()}</th>`
            )
            .join("");

          const bodyRows = rows
            .slice(2)
            .map((row) => {
              const cells = row
                .split("|")
                .slice(1, -1)
                .map(
                  (cell) => `<td class="border px-4 py-2">${cell.trim()}</td>`
                )
                .join("");
              return `<tr>${cells}</tr>`;
            })
            .join("");

          return `<table class="min-w-full mt-4 mb-6 border-collapse border">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>`;
        }
      }
      return match;
    });

    // Format lists
    html = html
      .replace(/^- (.*)$/gm, '<li class="ml-6">$1</li>')
      .replace(/(<li.*<\/li>\n)+/g, '<ul class="list-disc mb-4">$&</ul>');

    return html;
  }

  // Generate AI report
  const handleGenerateReport = async () => {
    if (!data || data.length === 0) {
      setMessage({
        text: "⚠️ No data available to generate report",
        type: "error",
      });
      return;
    }

    setIsGeneratingReport(true);
    // Clear previous report
    setAiReportHtml("");

    try {
      // API request to OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content:
                "You are an expert data analyst. Generate a comprehensive analysis report based on the provided Excel data. Format your response with markdown headings (#, ##), use **bold text** for emphasis, and create tables with | --- | format where appropriate.",
            },
            {
              role: "user",
              content: `Generate a detailed data analysis report for the following Excel data. Include key insights, trends, anomalies, and recommendations. Format with sections, tables, and highlights: ${JSON.stringify(
                data
              )}`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      // Get the raw markdown text
      const reportText = response.data.choices[0].message.content;

      // Format it to HTML with proper styling
      const formattedHtml = formatReportToHtml(reportText);

      // Set the formatted HTML directly - no typing effect
      setAiReportHtml(formattedHtml);
    } catch (error) {
      console.error("Error generating report with OpenAI API:", error);
      setMessage({
        text: "❌ Failed to generate OpenAI report. Please try again.",
        type: "error",
      });
    } finally {
      setIsGeneratingReport(false);
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

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-100 text-black"
      } min-h-screen`}
    >
      {/* Header */}
      <Navbar />
      <hr />
      {/* Hero Section */}
      <div
        className={`py-10 px-6 ${
          darkMode
            ? "bg-gray-800"
            : "bg-gradient-to-r from-blue-700 to-blue-300 text-white"
        }`}
      >
        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-3/5 mb-8 lg:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Excel Data Analyzer
              </h1>
              <p className="text-lg opacity-90 max-w-2xl leading-relaxed">
                Transform your Excel data into powerful visualizations. Upload
                your spreadsheets and discover insights with interactive 2D and
                3D charts.
              </p>
              <div className="flex mt-6 space-x-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate("/dashboard-overview")}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center transition-all duration-200"
                  >
                    <FiHome className="mr-2" /> Dashboard
                  </button>
                  <button
                    onClick={() => scrollToSection("upload-section")}
                    className="bg-white text-indigo-600 hover:bg-opacity-90 px-4 py-2 rounded-lg flex items-center transition-all duration-200"
                  >
                    <FiUpload className="mr-2" /> Upload Data
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:w-2/5">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
                <img
                  src="/logo192.png"
                  alt="Data Analysis"
                  className="relative z-10 rounded-lg shadow-xl max-w-xs w-full mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        {/* Upload Card */}
        <motion.div
          id="upload-section"
          variants={itemVariants}
          className={`p-8 rounded-2xl shadow-xl mb-12 border backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white bg-opacity-90 border-gray-100"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg shadow-sm">
                <FiFile className="text-xl" />
              </span>
              Upload Excel File
            </h2>
            <span className="mt-2 md:mt-0 text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              Supports .xlsx and .xls files
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <label className="w-full">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-md group ${
                    file
                      ? "bg-indigo-50 border-indigo-300"
                      : darkMode
                      ? "border-indigo-400 hover:border-indigo-300 bg-gray-700 hover:bg-gray-650"
                      : "border-indigo-300 hover:border-indigo-500 bg-indigo-50 bg-opacity-50 hover:bg-opacity-70"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {file ? (
                      <>
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                          <FiFile className="text-3xl" />
                        </div>
                        <span className="font-medium text-lg text-indigo-700">
                          {file.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                            setMessage({ text: "", type: "" });
                          }}
                          className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                          <FiUpload className="text-3xl" />
                        </div>
                        <span className="font-medium text-lg">
                          Drop your Excel file here
                        </span>
                        <span className="text-sm text-gray-500">
                          or click to browse files
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
              </label>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center h-full space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="font-semibold mb-2 text-indigo-700">
                  Analysis Features
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Data cleaning & preprocessing
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Interactive 2D visualizations
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Advanced 3D chart rendering
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Data export capabilities
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                disabled={isLoading || !file}
                className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-3 ${
                  isLoading || !file
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                } transition-all duration-300 shadow-lg`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                      />
                    </svg>
                    Processing Data...
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Analyze Excel Data
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
                message.type === "error"
                  ? "bg-red-50 border-l-4 border-red-500 text-red-700"
                  : message.type === "success"
                  ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                  : "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
              }`}
            >
              {message.type === "error" ? (
                <FiAlertCircle className="text-lg" />
              ) : (
                <FiCheckCircle className="text-lg" />
              )}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Footer */}
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Results Section */}
          {data.length > 0 && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-10">
                <h2 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
                  <span className="bg-indigo-100 text-indigo-600 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Analysis Results
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollToSection("data-preview")}
                    className="bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-all duration-200 shadow-sm"
                  >
                    Data Preview
                  </button>
                  <button
                    onClick={() => scrollToSection("visualization")}
                    className="bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-all duration-200 shadow-sm"
                  >
                    Visualization
                  </button>
                  <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
                    </svg>
                    Save Results
                  </button>
                  <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Export Data
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-xl shadow-lg mb-10 overflow-hidden ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Data Preview
                  </h3>
                  <span className="text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                    {data.length} rows total
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead
                      className={`${
                        darkMode
                          ? "bg-gray-700"
                          : "bg-indigo-50 text-indigo-800"
                      }`}
                    >
                      <tr>
                        {Object.keys(data[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 border-b border-gray-200 font-semibold text-left"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 10).map((row, i) => (
                        <tr
                          key={i}
                          className={`${
                            i % 2 === 0
                              ? darkMode
                                ? "bg-gray-700"
                                : "bg-gray-50"
                              : ""
                          } hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
                        >
                          {Object.values(row).map((val, j) => (
                            <td
                              key={j}
                              className="px-4 py-3 border-b border-gray-200"
                            >
                              {val?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.length > 10 && (
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-gray-500 text-sm">
                      Showing first 10 of {data.length} rows
                    </p>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                      View all data
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Chart Display */}
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-xl shadow-lg ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Data Visualization
                  </h3>
                  <div className="flex space-x-2">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Refresh
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-hidden">
                  <div
                    className="w-full h-full max-w-full"
                    style={{ maxHeight: "600px", overflowY: "hidden" }}
                  >
                    <ChartVisualizer
                      data={data}
                      defaultXKey={Object.keys(data[0])[0]}
                      defaultYKey={Object.keys(data[0])[1]}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    Bar Charts
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    Line Charts
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    Pie Charts
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    3D Visualizations
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                    Interactive Elements
                  </span>
                </div>
              </motion.div>

              {/* Analysis Summary Card */}
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-xl shadow-lg mt-10 mb-8 ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-100"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Data Analysis Summary
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
                      Your Excel data has been processed successfully. Use the
                      visualizations above to gain insights.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                    >
                      {isGeneratingReport ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <FiFile className="mr-2" />
                          Generate AI Report
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Viewer Component with Download Options */}
                {aiReportHtml && (
                  <ReportViewer
                    reportHtml={aiReportHtml}
                    isLoading={isGeneratingReport}
                    onDownload={(type) =>
                      setMessage({
                        text: `✅ Report downloaded as ${type.toUpperCase()} file`,
                        type: "success",
                      })
                    }
                  />
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-md hover:bg-indigo-700 transition-all"
          >
            ↑
          </button>
        )}
      </motion.div>
    </div>
  );
}
