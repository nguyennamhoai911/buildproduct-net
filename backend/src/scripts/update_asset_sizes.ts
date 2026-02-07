import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { figmaClipboardItems } from '../db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString, { ssl: 'require', max: 1 });
const db = drizzle(client);

/**
 * Fetch file size from URL
 */
async function getFileSizeFromUrl(url: string): Promise<number> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
        console.error(`Failed to fetch size for ${url}:`, error);
        return 0;
    }
}

async function updateAssetSizes() {
    console.log('🔄 Starting asset size update...\n');

    try {
        // Fetch all assets
        const assets = await db.select().from(figmaClipboardItems);
        console.log(`📦 Found ${assets.length} assets to process\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const asset of assets) {
            const updates: any = {};
            let needsUpdate = false;

            // Calculate content size if not set or is 0
            if (!asset.size || asset.size === 0) {
                if (asset.content) {
                    const contentSize = Buffer.byteLength(asset.content, 'utf8');
                    updates.size = contentSize;
                    needsUpdate = true;
                    console.log(`  📝 Asset #${asset.id}: Content size = ${contentSize} bytes`);
                }
            }

            // Fetch thumbnail size from R2 if not set or is 0
            if ((!asset.thumbnailSize || asset.thumbnailSize === 0) && asset.illustration) {
                console.log(`  🖼️  Asset #${asset.id}: Fetching thumbnail size from ${asset.illustration}`);
                const thumbnailSize = await getFileSizeFromUrl(asset.illustration);
                if (thumbnailSize > 0) {
                    updates.thumbnailSize = thumbnailSize;
                    needsUpdate = true;
                    console.log(`  ✓  Thumbnail size = ${thumbnailSize} bytes`);
                } else {
                    console.log(`  ⚠️  Could not fetch thumbnail size`);
                }
            }

            // Update if needed
            if (needsUpdate) {
                await db.update(figmaClipboardItems)
                    .set(updates)
                    .where(eq(figmaClipboardItems.id, asset.id));
                
                updatedCount++;
                const totalSize = (updates.size || asset.size || 0) + (updates.thumbnailSize || asset.thumbnailSize || 0);
                console.log(`  ✅ Updated! Total size: ${totalSize} bytes\n`);
            } else {
                skippedCount++;
                console.log(`  ⏭️  Asset #${asset.id}: Already has size data, skipping\n`);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n✅ Update completed!');
        console.log(`   Updated: ${updatedCount} assets`);
        console.log(`   Skipped: ${skippedCount} assets`);
        
    } catch (error) {
        console.error('❌ Error updating asset sizes:', error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

updateAssetSizes();
