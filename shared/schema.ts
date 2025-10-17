import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for backoffice authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// News/Notícias table
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  content: text("content").notNull(), // max 1200 chars enforced in validation
  contentEn: text("content_en"),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  featured: integer("featured").notNull().default(0), // 1 for featured, 0 for regular
});

// Events/Eventos table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  eventDate: timestamp("event_date").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  ticketLink: text("ticket_link"),
});

// Gallery/Galeria table
export const gallery = pgTable("gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'photo' or 'video'
  url: text("url").notNull(),
  thumbnail: text("thumbnail"), // for videos
  caption: text("caption"),
  captionEn: text("caption_en"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Contacts/Tickets table
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: text("ticket_id").notNull().unique(), // e.g. "geral_ABC123"
  type: text("type").notNull(), // 'geral', 'eventos', 'parc', 'loja', 'imprensa'
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default('received'), // received -> pending -> resolved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Biography/Banda table (single row)
export const biography = pgTable("biography", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(), // max 800 chars
  contentEn: text("content_en"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertNewsSchema = createInsertSchema(news).omit({ id: true }).extend({
  content: z.string().max(1200, "Content must be 1200 characters or less"),
  contentEn: z.string().max(1200, "Content must be 1200 characters or less").optional(),
});
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, ticketId: true, status: true, createdAt: true, updatedAt: true });
export const insertBiographySchema = createInsertSchema(biography).omit({ id: true }).extend({
  content: z.string().max(800, "Biography must be 800 characters or less"),
  contentEn: z.string().max(800, "Biography must be 800 characters or less").optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertBiography = z.infer<typeof insertBiographySchema>;
export type Biography = typeof biography.$inferSelect;
