import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function History() {
  const navigate = useNavigate();
  const [darkMode] = useState(false); // can convert to toggle if needed
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Fetching history...");
        const res = await axios.get("http://localhost:5000/api/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("History data received:", res.data);
        setHistory(res.data.data || []);
        setError("");
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(
          err.response?.data?.error || err.message || "Error fetching history"
        );
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshCount]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshCount((prev) => prev + 1);
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading history...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={handleRefresh} style={buttonStyle}>
          Retry
        </button>
        <button
          onClick={() => navigate("/")}
          style={{ ...buttonStyle, marginLeft: "10px" }}
        >
          Back to Home
        </button>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "3rem" }}>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            📊 Upload History
          </h1>
          <button onClick={handleRefresh} style={buttonStyle}>
            ↻ Refresh
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>No history found.</p>
            <button onClick={() => navigate("/analyze")} style={buttonStyle}>
              Upload New File
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table style={tableStyle}>
              <thead style={{ backgroundColor: "#f2f2f2" }}>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>📁 File Name</th>
                  <th style={thStyle}>📅 Uploaded At</th>
                  <th style={thStyle}>📈 Chart Type</th>
                  <th style={thStyle}>🅧 X Axis</th>
                  <th style={thStyle}>🅨 Y Axis</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr
                    key={item._id || i}
                    style={i % 2 === 0 ? { backgroundColor: "#f9f9f9" } : {}}
                  >
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{item.fileName || "Untitled"}</td>
                    <td style={tdStyle}>
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td style={tdStyle}>{item.chartType}</td>
                    <td style={tdStyle}>{item.xAxis}</td>
                    <td style={tdStyle}>{item.yAxis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

// Styles
const buttonStyle = {
  padding: "8px 16px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background 0.3s",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "600px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  marginTop: "1rem",
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#4CAF50",
  color: "white",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
};
