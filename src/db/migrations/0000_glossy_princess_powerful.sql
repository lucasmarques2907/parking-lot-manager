CREATE TYPE "public"."vehicle_type" AS ENUM('car', 'motorcycle');--> statement-breakpoint
CREATE TABLE "parking_spaces" (
	"code" varchar(5) PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"type" "vehicle_type" NOT NULL,
	CONSTRAINT "parking_spaces_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"plate" varchar(7) NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"parking_space_code" varchar(5) NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate"),
	CONSTRAINT "vehicles_parking_space_code_unique" UNIQUE("parking_space_code")
);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_parking_space_code_parking_spaces_code_fk" FOREIGN KEY ("parking_space_code") REFERENCES "public"."parking_spaces"("code") ON DELETE no action ON UPDATE no action;