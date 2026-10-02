import { PARKING_LAYOUT } from "../../config.js";
import type { NewParkingSpace } from "../schema.js";

export function generateSpaces(): NewParkingSpace[] {
  const spaces: NewParkingSpace[] = [];
  let number = 1;

  for (const { type, count, suffix } of PARKING_LAYOUT) {
    for (let i = 0; i < count; i++) {
      spaces.push({ code: `${number}${suffix}`, number, type });
      number++;
    }
  }

  return spaces;
}
