import { pgTable, serial, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

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

export const figmaClipboardItems = pgTable("figma_clipboard_items", {
    id: serial("id").primaryKey(),
    content: text("content").notNull(), // Storing as JSON string to ensure compatibility if jsonb isn't set up or needed
    illustration: text("illustration"), // URL to the image
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type FigmaClipboardItem = typeof figmaClipboardItems.$inferSelect;
export type NewFigmaClipboardItem = typeof figmaClipboardItems.$inferInsert;
