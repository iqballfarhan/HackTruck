require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const aiRoutes = require("./routes/aiRoutes");
const cargoRoutes = require("./routes/cargo");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// ✅ Konfigurasi CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://hacktruck-8c735.web.app", // Tambahkan domain frontend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Untuk menghindari masalah 204
};

// ✅ Gunakan CORS dan preflight untuk menangani request dengan metode OPTIONS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Tangani preflight OPTIONS

// ✅ Middleware bawaan
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);     // Auth: login, register, dll
app.use("/api/posts", postRoutes);    // Postingan muatan kosong
app.use("/api/ai", aiRoutes);         // Rekomendasi AI
app.use("/api/cargo", cargoRoutes);   // Cargo-related route (prefixed untuk konsistensi)

// ✅ Route 404 (jika tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// ✅ Error handling middleware
app.use(errorHandler);

// ✅ Start server setelah database terkoneksi
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error);
    // Optionally, close the server if database connection fails
    process.exit(1); // Exit the process to indicate failure
  });

module.exports = app;
