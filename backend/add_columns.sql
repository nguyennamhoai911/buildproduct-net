-- Add category and type columns to figma_clipboard_items table
ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "category" text;
ALTER TABLE figma_clipboard_items ADD COLUMN IF NOT EXISTS "type" text;
