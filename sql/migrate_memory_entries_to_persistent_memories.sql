-- Non-destructive migration from memory_entries to persistent_memories
-- Idempotent on a single re-run; no schema expansion, no DROP CASCADE

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memory_entries')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memory_entries_legacy') THEN

    -- Backup source first time
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memory_entries_backup') THEN
      EXECUTE 'CREATE TABLE memory_entries_backup AS TABLE memory_entries';
    END IF;

    -- Copy rows to live table with existing columns only
    INSERT INTO persistent_memories (  
    user_id, category, subcategory, content, token_count,
      relevance_score, usage_frequency, last_accessed, created_at, metadata
    )
    SELECT
      COALESCE(user_id, 'unknown'),
      COALESCE(category, 'personal_development'),  
      COALESCE(subcategory, 'general'),
      COALESCE(content, ''),
      COALESCE(token_count, CEIL(LENGTH(content)::float / 4)::integer),
      COALESCE(relevance_score, 0.5),
      COALESCE(usage_frequency, 0),
      COALESCE(last_accessed, created_at, CURRENT_TIMESTAMP),
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(metadata, '{}'::jsonb)
    FROM memory_entries
    WHERE content IS NOT NULL AND LENGTH(TRIM(content)) > 0;

    -- Keep legacy for audit; do not drop
    EXECUTE 'ALTER TABLE memory_entries RENAME TO memory_entries_legacy';
  END IF;
END $$;
