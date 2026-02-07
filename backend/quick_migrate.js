const postgres = require('postgres');

const connectionString = "postgresql://neondb_owner:npg_gtKUvBe21nwj@ep-misty-tooth-a1jcjlay-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
    const sql = postgres(connectionString, { ssl: 'require', prepare: false });

    try {
        console.log('✓ Connected to database');

        // Add category column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS category text;`;
        console.log('✓ Added category column');

        // Add type column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS type text;`;
        console.log('✓ Added type column');

        // Add project column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS project text;`;
        console.log('✓ Added project column');

        // Add size column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS size integer DEFAULT 0;`;
        console.log('✓ Added size column');

        // Add thumbnail_size column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS thumbnail_size integer DEFAULT 0;`;
        console.log('✓ Added thumbnail_size column');

        // Add user_id column
        await sql`ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS user_id integer;`;
        console.log('✓ Added user_id column');

        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

migrate();
