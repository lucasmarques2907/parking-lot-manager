import type { Request, Response } from "express";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "./errors.js";
import {
  createVehicle,
  deleteVehicle,
  getParkingSpaceWithVehicle,
  getVehicleByPlate,
  getVehicles,
} from "../db/queries/parking.js";
import { respondWithJSON } from "./json.js";

const VEHICLE_TYPES = ["car", "motorcycle"] as const;
type VehicleType = (typeof VEHICLE_TYPES)[number];

const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export async function parkVehicleHandler(req: Request, res: Response) {
  const { plate, type, parkingSpace } = req.body;

  if (!plate || !type || !parkingSpace) {
    throw new BadRequestError(
      "Campos obrigatórios não preenchidos corretamente",
    );
  }

  if (!VEHICLE_TYPES.includes(type)) {
    throw new BadRequestError(
      `Tipo inválido. Use: ${VEHICLE_TYPES.join(", ")}`,
    );
  }

  const normalizedPlate = String(plate)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const spaceCode = String(parkingSpace).trim().toUpperCase();

  if (!PLATE_REGEX.test(normalizedPlate)) {
    throw new BadRequestError("Placa inválida. Use o formato: ABC1D23");
  }

  const space = await getParkingSpaceWithVehicle(spaceCode);
  if (!space) {
    throw new NotFoundError(`Vaga ${spaceCode} não existe`);
  }
  if (space.type !== (type as VehicleType)) {
    throw new UnprocessableEntityError(
      `Vaga ${spaceCode} não é para esse tipo de veículo`,
    );
  }
  if (space.vehicleId) {
    throw new ConflictError(`Vaga ${spaceCode} já está ocupada`);
  }

  const alreadyParked = await getVehicleByPlate(normalizedPlate);
  if (alreadyParked) {
    throw new ConflictError(
      `Veículo ${normalizedPlate} já está na vaga ${alreadyParked.parkingSpaceCode}`,
    );
  }

  const vehicle = await createVehicle({
    plate: normalizedPlate,
    type,
    parkingSpaceCode: spaceCode,
  });

  respondWithJSON(res, 201, vehicle);
}

export async function getAllVehiclesHandler(req: Request, res: Response) {
  const vehicles = await getVehicles();

  respondWithJSON(res, 200, vehicles);
}

export async function getVehicleHandler(req: Request, res: Response) {
  const { plate } = req.params;

  if (typeof plate !== "string") {
    throw new BadRequestError("Placa inválida. Use o formato: ABC1D23");
  }

  const vehicle = await getVehicleByPlate(plate);
  if (!vehicle) {
    throw new NotFoundError(`Veículo com a placa ${plate} não encontrado.`);
  }

  respondWithJSON(res, 200, vehicle);
}

export async function removeVehicleHandler(req: Request, res: Response) {
  const { plate } = req.params;

  if (typeof plate !== "string") {
    throw new BadRequestError("Placa inválida. Use o formato: ABC1D23");
  }

  const vehicle = await getVehicleByPlate(plate);
  if (!vehicle) {
    throw new NotFoundError(`Veículo com a placa ${plate} não encontrado`);
  }

  const deleted = await deleteVehicle(vehicle.plate);
  if (!deleted) {
    throw new Error(`Falha ao remover veículo com a placa ${vehicle.plate}`);
  }

  res.status(204).send();
}
