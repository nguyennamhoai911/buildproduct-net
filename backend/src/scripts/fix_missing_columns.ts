
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client);

async function fixMissingColumns() {
    console.log("Starting DB migration fix...");
    
    // Add project column
    try {
        console.log("Adding project column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS project text;`);
        console.log("✓ Added project column");
    } catch (e) {
        console.log("- project column might already exist or error:", e);
    }

    // Add size column
    try {
        console.log("Adding size column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS size integer DEFAULT 0;`);
        console.log("✓ Added size column");
    } catch (e) {
        console.log("- size column might already exist or error:", e);
    }

    // Add thumbnail_size column
    try {
        console.log("Adding thumbnail_size column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS thumbnail_size integer DEFAULT 0;`);
        console.log("✓ Added thumbnail_size column");
    } catch (e) {
        console.log("- thumbnail_size column might already exist or error:", e);
    }

    // Add user_id column
    try {
        console.log("Adding user_id column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS user_id integer;`);
        console.log("✓ Added user_id column");
    } catch (e) {
        console.log("- user_id column might already exist or error:", e);
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
}

fixMissingColumns();
