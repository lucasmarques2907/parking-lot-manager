import { getParkingSpaces } from "../db/queries/parking.js";
import { respondWithJSON } from "./json.js";
import type { Request, Response } from "express";

export async function getAllParkingSpacesHandler(req: Request, res: Response) {
  const parkingSpaces = await getParkingSpaces();

  respondWithJSON(res, 200, parkingSpaces);
}
