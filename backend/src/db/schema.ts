import { pgTable, serial, text, timestamp, boolean, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'ROOT']);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),
    password: text("password"), // Hashed, nullable for OAuth users
    name: text("name"),
    role: roleEnum("role").default('USER').notNull(),
    avatar: text("avatar"),
    provider: text("provider").default('email'), // 'email', 'google'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const inspirations = pgTable("inspirations", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    website: text("website").notNull(),
    category: text("category").default('Product'), // 'Product' | 'Source'
    tags: text("tags"), // e.g. "UI/UX, Graphic, Portfolio"
    style: text("style"),
    field: text("field"),
    rating: text("rating"), // Storing as text to support empty/varied input, or convert to int if consistent
    country: text("country").default('Việt Nam'),
    description: text("description"), // For "Đánh giá cá nhân" if needed separately, or map to style
    thumbnail: text("thumbnail"), // Can fetch automatically later
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type Inspiration = typeof inspirations.$inferSelect;
export type NewInspiration = typeof inspirations.$inferInsert;

export const folders = pgTable("folders", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    parentId: integer("parent_id"), // simple hierarchy
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export const figmaClipboardItems = pgTable("figma_clipboard_items", {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    illustration: text("illustration"),
    description: text("description"),
    title: text("title"),
    tags: text("tags"),
    folderId: integer("folder_id"),
    category: text("category"), // e.g. "Button", "Card"
    type: text("type"), // e.g. "Component", "Page", "Icon"
    // TODO: Uncomment these after migration adds the columns
    project: text("project"), // e.g. "E-commerce", "Dashboard"
    size: integer("size").default(0), // Content size in bytes
    thumbnailSize: integer("thumbnail_size").default(0), // Thumbnail size in bytes
    userId: integer("user_id"), // User who created this
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type FigmaClipboardItem = typeof figmaClipboardItems.$inferSelect;
export type NewFigmaClipboardItem = typeof figmaClipboardItems.$inferInsert;

// TODO: After running /migrate endpoint, add back:
// - userActivityLogs table
// - assetActions table
// - userId, size, thumbnailSize fields to figmaClipboardItems
