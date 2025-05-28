import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { landmarksRouter, usersRouter, notesRouter } from './routes';

const app = express();
const cors = require("cors");
//app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", require("./routes/users")); // new route for login/register
app.use("/api/notes", require("./routes/notes")); // existing notes route
app.use("/api/path", require("./routes/path"));  // path search API

// Start server
const PORT = process.env.PORT || 5050;

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error: ", err);
  }

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/users", usersRouter); // Route for login/register
  app.use("/api/notes", notesRouter);
  app.use("/api/landmarks", landmarksRouter); 

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main();