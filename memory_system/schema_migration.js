// memory_system/schema_migration.js
// SAFE SCHEMA ALIGNMENT – NO DROPS, NO DATA LOSS

import { getDbPool } from './db_singleton.js';

const log = (...a) => console.log('[SCHEMA_MIGRATION]', ...a);

export async function unifyDatabaseSchema() {
  const pool = await getDbPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Only run if persistent_memories exists
    const exists = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'persistent_memories' LIMIT 1
    `);
    if (exists.rowCount === 0) {
      log('persistent_memories not found; nothing to migrate.');
      await client.query('COMMIT');
      return { success: true, changed: false };
    }

    // Rename columns if needed (idempotent)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='persistent_memories' AND column_name='category')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name='persistent_memories' AND column_name='category_name') THEN
          EXECUTE 'ALTER TABLE persistent_memories RENAME COLUMN category TO category_name';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='persistent_memories' AND column_name='subcategory')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name='persistent_memories' AND column_name='subcategory_name') THEN
          EXECUTE 'ALTER TABLE persistent_memories RENAME COLUMN subcategory TO subcategory_name';
        END IF;
      END $$;
    `);

    // Ensure expected index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pm_user_cat_rel_created
        ON persistent_memories (user_id, category_name, relevance_score DESC, created_at DESC);
    `);

    await client.query('COMMIT');
    log('Schema alignment complete (no drops).');
    return { success: true, changed: true };

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[SCHEMA_MIGRATION] failed:', e);
    throw e;
  } finally {
    client.release();
  }
}

