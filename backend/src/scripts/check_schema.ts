import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'figma_clipboard_items';
        `);
        console.log('Columns in figma_clipboard_items:', result);
        
        const logsTable = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'user_activity_logs';
        `);
        console.log('User logs table exists:', logsTable);

    } catch (e) {
        console.error('Check failed:', e);
    }
    process.exit(0);
}
main();
