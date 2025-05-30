const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const routes = require("./routers");
const path = require("path");
const http = require("http");
const app = express();
const Database = require("./config/DatabaseConnection");
const { initSocket } = require("./config/socket");
const Passport = require("./config/passport");

app.use("/uploads", express.static("uploads"));

// Load environment variables
dotenv.config();

// Database connection
Database.connectDB();

const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport
Passport(app);

// Serve static files from the uploads directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "*");
    },
  }),
);

Passport(app);

// Register routes
routes(app);

const server = http.createServer(app);
initSocket(server);

// Start server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = {
  app
};
