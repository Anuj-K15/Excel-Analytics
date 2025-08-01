import axios from "axios";

// Configure base URLs
const API_BASE_URL = `${
  process.env.REACT_APP_API_URL || "http://localhost:5000"
}/api`;

// Create axios instance with default configs
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - please try again");
    }

    if (!error.response) {
      throw new Error("Network error - check your internet connection");
    }

    return Promise.reject(error);
  }
);

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("excelFile", file);

  try {
    const response = await api.post("/upload/excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Override for file upload
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    let errorMsg = "Upload failed";

    if (error.response) {
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          errorMsg = "Session expired - please login again";
          break;
        case 403:
          errorMsg = "Permission denied";
          break;
        case 413:
          errorMsg = "File too large (max 10MB)";
          break;
        default:
          errorMsg = error.response.data?.error || errorMsg;
      }
    } else if (error.request) {
      errorMsg = "No response from server - check your connection";
    }

    throw new Error(errorMsg);
  }
};

// Additional API functions can use the same instance
export const loginUser = async (credentials) => {
  return api.post("/auth/login", credentials);
};

export const getHistory = async () => {
  return api.get("/history");
};
