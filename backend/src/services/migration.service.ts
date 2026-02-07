// Temporary migration endpoint - REMOVE AFTER USE
import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function runMigration() {
    const results: string[] = [];

    try {
        results.push('Starting migration...');

        // Add columns to figma_clipboard_items
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id);`);
        results.push('✓ Added user_id column');

        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS size integer DEFAULT 0;`);
        results.push('✓ Added size column');

        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS thumbnail_size integer DEFAULT 0;`);
        results.push('✓ Added thumbnail_size column');

        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS category text;`);
        results.push('✓ Added category column');

        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS type text;`);
        results.push('✓ Added type column');

        // Create user_activity_logs table
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
        results.push('✓ Created user_activity_logs table');

        // Create asset_actions table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS asset_actions (
                id serial PRIMARY KEY,
                user_id integer REFERENCES users(id),
                asset_id integer REFERENCES figma_clipboard_items(id),
                action text NOT NULL,
                created_at timestamp DEFAULT now()
            );
        `);
        results.push('✓ Created asset_actions table');

        results.push('Migration completed successfully!');
        return { success: true, results };

    } catch (error) {
        results.push(`❌ Error: ${error}`);
        return { success: false, results, error: String(error) };
    }
}
