
import { db } from './src/db';
import { sql } from 'drizzle-orm';
import { figmaClipboardItems } from './src/db/schema';
import * as path from 'path';
import * as fs from 'fs';

// Manually load DATABASE_URL from .env if missing
if (!process.env.DATABASE_URL) {
    const rootEnv = path.join(process.cwd(), '.env');
    const backendEnv = path.join(process.cwd(), 'backend', '.env');
    const envPath = fs.existsSync(rootEnv) ? rootEnv : (fs.existsSync(backendEnv) ? backendEnv : null);

    if (envPath) {
        console.log(`📝 Loading environment from: ${envPath}`);
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^DATABASE_URL=["']?([^"'\n\r]+)["']?$/m);
        if (match) {
            process.env.DATABASE_URL = match[1].trim();
        }
    }
}

async function runForceMigration() {
    console.log("🚀 Starting database schema update...");

    try {
        // Add project column if not exists
        console.log("Adding 'project' column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS project text;`);

        // Add size column if not exists
        console.log("Adding 'size' column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS size integer DEFAULT 0;`);

        // Add thumbnail_size column if not exists
        console.log("Adding 'thumbnail_size' column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS thumbnail_size integer DEFAULT 0;`);

        // Add user_id column if not exists
        console.log("Adding 'user_id' column...");
        await db.execute(sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS user_id integer;`);

        console.log("✅ Database schema updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runForceMigration();
