import { db } from "../index.js";
import { parkingSpaces } from "../schema.js";
import { generateSpaces } from "./parking-spaces.js";

async function seed() {
  const spaces = generateSpaces();
  await db.insert(parkingSpaces).values(spaces).onConflictDoNothing();
  console.log(`${spaces.length} vagas configuradas`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
