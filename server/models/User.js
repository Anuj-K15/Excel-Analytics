import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if authProvider is not provided
        return !this.authProvider;
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // All new users will be active by default
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Only these values are allowed
      default: "user", // Default role is 'user'
    },
    authProvider: {
      type: String,
      enum: [null, "google"],
      default: null,
    },
    providerUID: {
      type: String,
      sparse: true, // Only indexed if field exists
    },
    photoURL: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
