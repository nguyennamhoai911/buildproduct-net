
import { db } from './src/db';
import { figmaClipboardItems } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function checkData() {
    try {
        const items = await db.select().from(figmaClipboardItems).limit(5);
        console.log('Last 5 items in figma_clipboard_items:');
        console.log(JSON.stringify(items, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
}

checkData();
