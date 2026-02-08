import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, eq, isNull } from 'drizzle-orm';
import { figmaClipboardItems, users } from '../db/schema';
import * as path from 'path';
import * as fs from 'fs';

// Manually load DATABASE_URL from .env if missing
if (!process.env.DATABASE_URL) {
    const rootEnv = path.join(process.cwd(), 'backend', '.env');
    const localEnv = path.join(process.cwd(), '.env');
    const scriptEnv = path.join(__dirname, '..', '..', '..', '.env');
    
    const envPath = fs.existsSync(rootEnv) ? rootEnv : 
                   (fs.existsSync(localEnv) ? localEnv : 
                   (fs.existsSync(scriptEnv) ? scriptEnv : null));

    if (envPath) {
        console.log(`📝 Loading environment from: ${envPath}`);
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^DATABASE_URL=["']?([^"'\n\r]+)["']?$/m);
        if (match) {
            process.env.DATABASE_URL = match[1].trim();
        }
    } else {
        console.warn("⚠️ Could not find .env file in expected locations.");
    }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client);

async function assignUnknownAssets() {
    console.log("Starting asset assignment process...");
    
    try {
        // 1. Find the first user (likely the admin/main user)
        const allUsers = await db.select().from(users).limit(1);
        
        if (allUsers.length === 0) {
            console.error("❌ No users found in the database. Please create a user first.");
            process.exit(1);
        }

        const targetUser = allUsers[0];
        console.log(`👤 Found target user: ${targetUser.name || 'Admin'} (ID: ${targetUser.id}, Email: ${targetUser.email})`);

        // 2. Count unknown assets
        const unknownCountResult = await db.execute(sql`SELECT count(*) FROM figma_clipboard_items WHERE user_id IS NULL`);
        const unknownCount = unknownCountResult[0].count;

        if (Number(unknownCount) === 0) {
            console.log("✅ No assets with 'Unknown' creator found. Everything is up to date!");
            process.exit(0);
        }

        console.log(`📦 Found ${unknownCount} assets with no assigned creator.`);

        // 3. Assign them
        console.log(`🚀 Assigning all unknown assets to ${targetUser.name || targetUser.email}...`);
        
        await db.update(figmaClipboardItems)
            .set({ userId: targetUser.id })
            .where(isNull(figmaClipboardItems.userId));

        console.log(`✅ Success! All ${unknownCount} assets have been assigned to user ${targetUser.id}.`);
        
    } catch (error) {
        console.error("❌ Error during assignment:", error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

assignUnknownAssets();
