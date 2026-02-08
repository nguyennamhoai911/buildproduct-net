// Temporary migration endpoint - REMOVE AFTER USE
import { db } from '../db';
import { sql, eq } from 'drizzle-orm';
import { figmaClipboardItems, users } from '../db/schema';

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

        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS project text;`);
        results.push('✓ Added project column');

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

export async function assignUnknownAssets(targetUserId?: number) {
    const results: string[] = [];
    try {
        results.push('Starting asset assignment...');

        let userId = targetUserId;
        if (!userId) {
            results.push('No userId provided, finding first user...');
            const firstUser = await db.select().from(users).limit(1);
            if (firstUser.length === 0) {
                return { success: false, error: 'No users found in database' };
            }
            userId = firstUser[0].id;
        }

        const targetUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (targetUser.length === 0) {
            return { success: false, error: `User with ID ${userId} not found` };
        }

        results.push(`👤 Assigning to user: ${targetUser[0].name || targetUser[0].email} (ID: ${userId})`);

        // Count items with NULL userId using SQL
        const itemsToUpdate = await db.execute(sql`SELECT count(*) FROM figma_clipboard_items WHERE user_id IS NULL`);
        const count = itemsToUpdate[0].count;

        results.push(`📦 Found ${count} assets with no creator`);

        if (Number(count) > 0) {
            await db.update(figmaClipboardItems)
                .set({ userId })
                .where(sql`user_id IS NULL`);
            results.push(`✅ Successfully assigned ${count} assets`);
        } else {
            results.push('Done. No assets needed assignment.');
        }

        return { success: true, results };

    } catch (error) {
        results.push(`❌ Error: ${error}`);
        return { success: false, results, error: String(error) };
    }
}
