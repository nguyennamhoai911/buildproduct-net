import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Direct connection string - replace with your actual DATABASE_URL
const connectionString = "postgresql://neondb_owner:npg_gtKUvBe21nwj@ep-misty-tooth-a1jcjlay-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const client = postgres(connectionString, { ssl: 'require', max: 1 });
const db = drizzle(client);

async function run() {
    console.log('Starting migration to add category and type columns...');

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "category" text;`);
        console.log('✓ Added category column to figma_clipboard_items');
    } catch (e) {
        console.log('✗ Error adding category column:', e);
    }

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "type" text;`);
        console.log('✓ Added type column to figma_clipboard_items');
    } catch (e) {
        console.log('✗ Error adding type column:', e);
    }

    console.log('Migration completed!');
    await client.end();
    process.exit(0);
}

run().catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
});
