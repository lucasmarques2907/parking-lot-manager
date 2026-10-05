import express from "express";
import { config } from "./config.js";
import {
  errorMiddleware,
  LIMITER,
  middlewareLogResponse,
} from "./api/middleware.js";
import {
  getVehicleHandler,
  getAllVehiclesHandler,
  parkVehicleHandler,
  removeVehicleHandler,
} from "./api/vehicles.js";
import { getAllParkingSpacesHandler } from "./api/parking-lot.js";
import cors from "cors";

const app = express();

app.set("trust proxy", 1);

app.use(middlewareLogResponse);
app.use(
  cors({
    origin: config.api.allowedOrigins,
    methods: ["GET", "POST", "DELETE"],
  }),
);
app.use(LIMITER);
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

app.delete("/vehicles/:plate", (req, res, next) => {
  Promise.resolve(removeVehicleHandler(req, res)).catch(next);
});

// * Parking Lot Endpoints
app.get("/parking-spaces", (req, res, next) => {
  Promise.resolve(getAllParkingSpacesHandler(req, res)).catch(next);
});

app.use(errorMiddleware);

if (!process.env.VERCEL) {
  app.listen(config.api.port, () => {
    console.log(`Server is running at https://localhost:${config.api.port}`);
  });
}

export default app;
