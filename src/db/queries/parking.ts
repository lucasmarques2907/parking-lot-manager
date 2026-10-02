import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { parkingSpaces, vehicles, type NewVehicle } from "../schema.js";

export async function getParkingSpaces() {
  return db
    .select({
      code: parkingSpaces.code,
      type: parkingSpaces.type,
      vehicleId: vehicles.id,
      plate: vehicles.plate,
    })
    .from(parkingSpaces)
    .leftJoin(vehicles, eq(vehicles.parkingSpaceCode, parkingSpaces.code))
    .orderBy(asc(parkingSpaces.number));
}

export async function getParkingSpaceWithVehicle(code: string) {
  const [result] = await db
    .select({
      code: parkingSpaces.code,
      type: parkingSpaces.type,
      vehicleId: vehicles.id,
    })
    .from(parkingSpaces)
    .leftJoin(vehicles, eq(vehicles.parkingSpaceCode, parkingSpaces.code))
    .where(eq(parkingSpaces.code, code));

  return result;
}

export async function getVehicles() {
  return db.select().from(vehicles).orderBy(asc(vehicles.createdAt));
}

export async function getVehicleByPlate(plate: string) {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.plate, plate));
  return vehicle;
}

export async function createVehicle(vehicle: NewVehicle) {
  const [created] = await db.insert(vehicles).values(vehicle).returning();
  return created;
}

export async function deleteVehicle(plate: string) {
  const rows = await db
    .delete(vehicles)
    .where(eq(vehicles.plate, plate))
    .returning();
  return rows.length > 0;
}

export async function resetVehicles() {
  const rows = await db.delete(vehicles).returning();
  return rows.length > 0;
}
