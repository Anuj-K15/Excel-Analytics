import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ThreeJsChart from "./ThreeJsChart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ChartVisualizer({
  data = [],
  defaultXKey = "Name",
  defaultYKey = "Salary",
}) {
  const [xKey, setXKey] = useState(defaultXKey);
  const [yKey, setYKey] = useState(defaultYKey);
  const [chartType, setChartType] = useState("Bar");
  const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.9);
  const chartRef = useRef(null);

  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const isReady =
    data.length > 0 &&
    xKey &&
    yKey &&
    keys.includes(xKey) &&
    keys.includes(yKey);

  // Responsive chart width
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 500) setChartWidth(width * 0.95);
      else if (width < 800) setChartWidth(width * 0.9);
      else setChartWidth(800);
    };
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, [data, isReady]);

  // Save history to backend when chart is generated
  useEffect(() => {
    const saveHistory = async () => {
      if (!isReady) return;

      try {
        await axios.post(
          "http://localhost:5000/api/history",
          {
            fileName: data[0]?.__filename || "uploaded_file.xlsx",
            chartType,
            xAxis: xKey,
            yAxis: yKey,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("✅ History saved");
      } catch (err) {
        console.error(
          "❌ Error saving history:",
          err.response?.data || err.message
        );
      }
    };

    saveHistory();
  }, [xKey, yKey, chartType, data, isReady]);

  const handleXChange = (e) => setXKey(e.target.value);
  const handleYChange = (e) => setYKey(e.target.value);
  const handleTypeChange = (e) => setChartType(e.target.value);

  const handleDownload = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = `chart-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <h2>Generate Chart</h2>
        <p style={{ color: "red" }}>No data available</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <h2>Generate Chart</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <select onChange={handleXChange} value={xKey}>
            <option value="">Select X-axis</option>
            {keys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <select onChange={handleYChange} value={yKey}>
            <option value="">Select Y-axis</option>
            {keys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <select onChange={handleTypeChange} value={chartType}>
            <option value="Bar">Bar</option>
            <option value="Line">Line</option>
            <option value="Pie">Pie</option>
            <option value="3D">3D Chart</option>
          </select>
        </div>
        <p style={{ color: "red" }}>Please select valid X and Y axes</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <h2>Generate Chart</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <select onChange={handleXChange} value={xKey}>
          <option value="">Select X-axis</option>
          {keys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <select onChange={handleYChange} value={yKey}>
          <option value="">Select Y-axis</option>
          {keys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <select onChange={handleTypeChange} value={chartType}>
          <option value="Bar">Bar</option>
          <option value="Line">Line</option>
          <option value="Pie">Pie</option>
          <option value="3D">3D Chart</option>
        </select>
      </div>

      <div
        ref={chartRef}
        style={{ width: chartWidth, height: 400, margin: "0 auto" }}
      >
        {chartType === "Bar" && (
          <BarChart width={chartWidth} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill="#8884d8" />
          </BarChart>
        )}

        {chartType === "Line" && (
          <LineChart width={chartWidth} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke="#82ca9d" />
          </LineChart>
        )}

        {chartType === "Pie" && (
          <PieChart width={chartWidth} height={400}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              dataKey={yKey}
              nameKey={xKey}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}

        {chartType === "3D" && (
          <div style={{ backgroundColor: "#fff", padding: "20px" }}>
            {/* Use key to force remount when data or axes change */}
            <ThreeJsChart
              key={`3d-chart-${xKey}-${yKey}-${data.length}`}
              data={data}
              xKey={xKey}
              yKey={yKey}
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p>
                True 3D Visualization of {yKey} by {xKey}
              </p>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Tip: Use mouse to rotate (drag), zoom (scroll) and pan
                (shift+drag) the 3D chart
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleDownload}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            fontSize: "1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📸 Download Chart
        </button>
      </div>
    </div>
  );
}
