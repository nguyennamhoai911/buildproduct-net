
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
    try {
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'figma_clipboard_items'
        `);
        console.log('Columns in figma_clipboard_items:');
        console.table(columns);
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
