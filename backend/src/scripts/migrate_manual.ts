import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Hardcode connection string or read from process.env if bun loads it automatically
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString, { ssl: 'require', max: 1 });
const db = drizzle(client);

async function run() {
    console.log('Starting manual migration...');

    // 1. Add columns to figma_clipboard_items
    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES users(id);`);
        console.log('- Added user_id to figma_clipboard_items');
    } catch (e) { console.log('- user_id column might already exist or error:', e); }

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "size" integer DEFAULT 0;`);
        console.log('- Added size to figma_clipboard_items');
    } catch (e) { console.log('- size column might already exist or error:', e); }

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "thumbnail_size" integer DEFAULT 0;`);
        console.log('- Added thumbnail_size to figma_clipboard_items');
    } catch (e) { console.log('- thumbnail_size column might already exist or error:', e); }

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "category" text;`);
        console.log('- Added category to figma_clipboard_items');
    } catch (e) { console.log('- category column might already exist or error:', e); }

    try {
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "type" text;`);
        console.log('- Added type to figma_clipboard_items');
    } catch (e) { console.log('- type column might already exist or error:', e); }

    // 2. Create user_activity_logs
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS user_activity_logs (
                id serial PRIMARY KEY,
                user_id integer REFERENCES users(id) NOT NULL,
                action text NOT NULL,
                ip_address text,
                country text,
                device text,
                details text,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log('- Created user_activity_logs table');
    } catch (e) { console.error('- Error creating user_activity_logs:', e); }

    // 3. Create asset_actions
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS asset_actions (
                id serial PRIMARY KEY,
                user_id integer REFERENCES users(id) NOT NULL,
                asset_id integer REFERENCES figma_clipboard_items(id) NOT NULL,
                action text NOT NULL,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log('- Created asset_actions table');
    } catch (e) { console.error('- Error creating asset_actions:', e); }

    console.log('Migration finished.');
    process.exit(0);
}

run();
