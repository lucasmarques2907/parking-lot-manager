import express from "express";
import { config } from "./config.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { errorMiddleware, middlewareLogResponse } from "./api/middleware.js";
import {
  getVehicleHandler,
  getAllVehiclesHandler,
  parkVehicleHandler,
  removeVehicleHandler,
  resetVehiclesHandler,
} from "./api/vehicles.js";
import { getAllParkingSpacesHandler } from "./api/parking-lot.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponse);
app.use(express.json());

// * Vehicles Endpoints
app.post("/vehicles", (req, res, next) => {
  Promise.resolve(parkVehicleHandler(req, res)).catch(next);
});

app.get("/vehicles", (req, res, next) => {
  Promise.resolve(getAllVehiclesHandler(req, res)).catch(next);
});

app.get("/vehicles/:plate", (req, res, next) => {
  Promise.resolve(getVehicleHandler(req, res)).catch(next);
});

app.delete("/vehicles/reset", (req, res, next) => {
  Promise.resolve(resetVehiclesHandler(req, res)).catch(next);
});

app.delete("/vehicles/:plate", (req, res, next) => {
  Promise.resolve(removeVehicleHandler(req, res)).catch(next);
});


// * Parking Lot Endpoints
app.get("/parking-spaces", (req, res, next) => {
  Promise.resolve(getAllParkingSpacesHandler(req, res)).catch(next);
});

app.use(errorMiddleware);

app.listen(config.api.port, () => {
  console.log(`Server is running at https://localhost:${config.api.port}`);
});
