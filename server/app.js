require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const aiRoutes = require("./routes/aiRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const cargoRoutes = require("./routes/cargo");

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "https://hacktruck-b0e4d.web.app"], // array of allowed origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (CRUD implementation)
app.use("/api/auth", authRoutes); // Create, Read for users
app.use("/api/posts", postRoutes); // Create, Read, Update, Delete for posts
app.use("/api/ai", aiRoutes); // AI recommendation endpoint
app.use("/cargo", cargoRoutes);

// Error Handler
app.use(errorHandler);

// Remove duplicate dotenv import and fix conditional logic
// Note: The original condition `process.env.NODE_ENV !== '!production'` seems incorrect
// Assuming you meant `!== 'production'` for development environment
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load .env variables in development
}

// Database Connection and Server Start
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = app;
