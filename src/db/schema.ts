import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  plate: varchar("plate", { length: 7 }).unique().notNull(),
  type: varchar("type", { length: 256 }).notNull(),
  parkingSpace: varchar("parking_space", { length: 256 }).notNull(),
});

export type NewVehicle = typeof vehicles.$inferInsert;
