import express from "express";
import { config } from "./config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { errorMiddleware, middlewareLogResponse } from "./api/middleware";
import {
  generateVehicleHandler,
  getVehicleHandler,
  parkVehicleHandler,
  removeVehicleHandler,
} from "./api/vehicles";
import { getSpotsHandler } from "./api/parking-lot";
import { resetHandler } from "./api/reset";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponse);
app.use(express.json());

// * Vehicles Endpoints
app.post("/vehicles/generate", (req, res, next) => {
  Promise.resolve(generateVehicleHandler(req, res)).catch(next);
});

app.post("/vehicles", (req, res, next) => {
  Promise.resolve(parkVehicleHandler(req, res)).catch(next);
});

app.get("/vehicles", (req, res, next) => {
  Promise.resolve(getVehicleHandler(req, res)).catch(next);
});

app.delete("/vehicles/:vehicleId", (req, res, next) => {
  Promise.resolve(removeVehicleHandler(req, res)).catch(next);
});

// * Parking Lot Endpoints
app.get("/parking-lot", (req, res, next) => {
  Promise.resolve(getSpotsHandler(req, res)).catch(next);
});

// * Extras
app.get("/reset", (req, res, next) => {
  Promise.resolve(resetHandler(req, res)).catch(next);
});

app.use(errorMiddleware);

app.listen(config.api.port, () => {
  console.log(`Server is running at https://localhost:${config.api.port}`);
});
