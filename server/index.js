import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db/pool.js";
import authRouter from "./routes/auth.js";
import cliniciansRouter from "./routes/clinicians.js";
import patientsRouter from "./routes/patients.js";
import visitsRouter from "./routes/visits.js";
import { ROUTES, apiPath } from "./config/api.js";
import { authenticate } from "./middleware/auth.js";
import { internalServerError } from "./utils/errorHelpers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [process.env.CLIENT_ORIGIN || "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.get(apiPath(ROUTES.health), async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: "error" });
  }
});

app.use(apiPath(ROUTES.auth), authRouter);
app.use(apiPath(ROUTES.clinicians), authenticate, cliniciansRouter);
app.use(apiPath(ROUTES.patients), authenticate, patientsRouter);
app.use(apiPath(ROUTES.visits), authenticate, visitsRouter);

app.use((err, _req, res, _next) => {
  internalServerError(res, err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
