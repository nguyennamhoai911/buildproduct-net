import { db } from "../db";
import { inspirations } from "../db/schema";

async function diagnose() {
  console.log("Diagnosing DB connection...");
  try {
    const data = await db.select().from(inspirations).limit(5);
    console.log("Success! Data found:", data.length);
    console.log(data);
  } catch (error) {
    console.error("❌ DB Query Failed!", error);
  }
  process.exit(0);
}

diagnose();
