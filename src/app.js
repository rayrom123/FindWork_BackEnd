const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const app = express();
const cors = require("cors");
const Database = require("./config/DatabaseConnection");
const Passport = require("./config/Passport");
dotenv.config();
Database.connectDB();

const port = process.env.PORT;
app.use(cors());
app.use(express.json());
routes(app);
Passport(app);

app.get("/", (req, res) => {
  res.send("HELLO");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
