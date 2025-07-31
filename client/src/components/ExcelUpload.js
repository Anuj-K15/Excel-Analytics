import { useState, useEffect } from "react";
import axios from "axios";
import ChartVisualizer from "./ChartVisualizer";

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [uploadPassword, setUploadPassword] = useState("");
  const [data, setData] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("excelProUser"));
    setIsAdmin(user?.role === "admin");
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setMessage({ text: "❌ Only Excel files are allowed!", type: "error" });
      return;
    }

    setFile(selectedFile);
    setMessage({ text: "", type: "" });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: "📎 Please select a file!", type: "error" });
      return;
    }

    if (isAdmin && !uploadPassword) {
      setMessage({ text: "🔒 Admin upload password required!", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file); // Must match backend field name
    if (isAdmin) {
      formData.append("uploadPassword", uploadPassword);
    }

    try {
      setLoading(true);
      setMessage({ text: "⏳ Uploading file...", type: "info" });

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/upload/excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data.data);
      setMessage({
        text: `✅ ${res.data.message || "Upload successful!"}`,
        type: "success",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Upload failed";
      setMessage({ text: `❌ ${errorMsg}`, type: "error" });
      console.error("Upload error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10 bg-gradient-to-br from-blue-50 to-purple-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        {isAdmin ? "🔐 Admin Excel Upload" : "📊 Excel Data Visualizer"}
      </h1>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">
            Excel File (.xlsx, .xls):
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="file-input file-input-bordered w-full"
            disabled={loading}
          />
        </div>

        {isAdmin && (
          <div>
            <label className="block mb-2 font-medium">
              Admin Upload Password:
            </label>
            <input
              type="password"
              value={uploadPassword}
              onChange={(e) => setUploadPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          className={`btn ${
            loading ? "loading" : isAdmin ? "btn-secondary" : "btn-primary"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload"}
        </button>
      </div>

      {message.text && (
        <div
          className={`alert ${
            message.type === "error"
              ? "alert-error"
              : message.type === "success"
              ? "alert-success"
              : "alert-info"
          } mb-6`}
        >
          <div>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="overflow-auto rounded-lg shadow border bg-white p-4 mb-8">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-indigo-200">
                <tr>
                  {Object.keys(data[0]).map((key, i) => (
                    <th key={i} className="p-3 text-left font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-2 border">
                        {val?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ChartVisualizer data={data} />
        </>
      )}
    </div>
  );
}
