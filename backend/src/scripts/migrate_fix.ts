import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = "postgresql://neondb_owner:npg_gtKUvBe21nwj@ep-misty-tooth-a1jcjlay-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const client = postgres(connectionString);
const db = drizzle(client);

async function run() {
    console.log('Starting migration...');
    try {
        console.log('Adding user_id column...');
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id);`);
        
        console.log('Adding size column...');
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS size integer DEFAULT 0;`);

        console.log('Adding thumbnail_size column...');
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS thumbnail_size integer DEFAULT 0;`);

        console.log('Creating user_activity_logs...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS user_activity_logs (
                id serial PRIMARY KEY,
                user_id integer REFERENCES users(id),
                action text NOT NULL,
                ip_address text,
                country text,
                device text,
                details text,
                created_at timestamp DEFAULT now()
            );
        `);

        console.log('Creating asset_actions...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS asset_actions (
                id serial PRIMARY KEY,
                user_id integer REFERENCES users(id),
                asset_id integer REFERENCES figma_clipboard_items(id),
                action text NOT NULL, /* COPY, VIEW */
                created_at timestamp DEFAULT now()
            );
        `);

        console.log('Migration successful!');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

run();
