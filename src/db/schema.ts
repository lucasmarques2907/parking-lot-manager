import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const vehicleType = pgEnum("vehicle_type", ["car", "motorcycle"]);

export const parkingSpaces = pgTable("parking_spaces", {
  code: varchar("code", { length: 5 }).primaryKey(),
  number: integer("number").notNull().unique(),
  type: vehicleType("type").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  plate: varchar("plate", { length: 7 }).notNull().unique(),
  type: vehicleType("type").notNull(),
  parkingSpaceCode: varchar("parking_space_code", { length: 5 })
    .notNull()
    .unique()
    .references(() => parkingSpaces.code),
});

export type NewVehicle = typeof vehicles.$inferInsert;
export type NewParkingSpace = typeof parkingSpaces.$inferInsert;
