import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for backoffice authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(), // For notifications and admin identification
  password: text("password").notNull(),
  role: text("role").notNull().default('editor'), // 'admin', 'editor'
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Profiles table (for frontoffice/customer accounts)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  biography: text("biography"),
  musicalTastes: text("musical_tastes"),
  preferredPaymentMethod: text("preferred_payment_method").default('card'),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default('Portugal'),
  totalComments: integer("total_comments").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// News/Notícias table
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  titleFr: text("title_fr"),
  titleEs: text("title_es"),
  titleDe: text("title_de"),
  content: text("content").notNull(), // max 1200 chars enforced in validation
  contentEn: text("content_en"),
  contentFr: text("content_fr"),
  contentEs: text("content_es"),
  contentDe: text("content_de"),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  featured: integer("featured").notNull().default(0), // 1 for featured, 0 for regular
});

// Events/Eventos table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  titleFr: text("title_fr"),
  titleEs: text("title_es"),
  titleDe: text("title_de"),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  eventDate: timestamp("event_date").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionEs: text("description_es"),
  descriptionDe: text("description_de"),
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
  captionFr: text("caption_fr"),
  captionEs: text("caption_es"),
  captionDe: text("caption_de"),
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
  // Event-specific fields
  eventDate: text("event_date"), // for eventos
  eventLocation: text("event_location"), // for eventos
  expectedAttendees: text("expected_attendees"), // for eventos
  // Partnership-specific fields
  partnershipType: text("partnership_type"), // for parc
  companyName: text("company_name"), // for parc
  // Store-specific fields
  storeInquiryType: text("store_inquiry_type"), // for loja
  // Press-specific fields
  outletName: text("outlet_name"), // for imprensa
  deadline: text("deadline"), // for imprensa
  status: text("status").notNull().default('received'), // received -> pending -> resolved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Biography/Banda table (single row)
export const biography = pgTable("biography", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(), // max 800 chars
  contentEn: text("content_en"),
  contentFr: text("content_fr"),
  contentEs: text("content_es"),
  contentDe: text("content_de"),
  bandImage: text("band_image"), // Main band photo URL
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Spotify Settings table (single row)
export const spotifySettings = pgTable("spotify_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  embedUrl: text("embed_url").notNull(), // Spotify embed URL (album, playlist, track, etc.)
  displayType: text("display_type").notNull().default('player'), // 'player' or 'banner'
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// E-COMMERCE TABLES

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(), // 'discografia', 'merch', etc
  description: text("description"),
  descriptionEn: text("description_en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  nameEs: text("name_es"),
  nameDe: text("name_de"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionEs: text("description_es"),
  descriptionDe: text("description_de"),
  price: integer("price").notNull(), // price in cents (e.g., 1999 = €19.99)
  type: text("type").notNull(), // 'physical' or 'digital'
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  stock: integer("stock").notNull().default(0), // for physical products
  downloadUrl: text("download_url"), // for digital products
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
  featured: integer("featured").notNull().default(0), // 1 for featured, 0 for regular
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(), // e.g., "ORD-20241020-ABC123"
  userId: varchar("user_id").references(() => userProfiles.id, { onDelete: "set null" }), // Link to user profile if logged in
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"), // JSON string for physical products
  billingAddress: text("billing_address"), // JSON string
  totalAmount: integer("total_amount").notNull(), // in cents
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
  paymentMethod: text("payment_method"), // 'stripe', 'paypal', 'multibanco', 'mbway'
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  productName: text("product_name").notNull(), // snapshot at purchase time
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // price per unit in cents at purchase time
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Band Members table
export const bandMembers = pgTable("band_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(), // Portuguese role
  roleEn: text("role_en"),
  roleFr: text("role_fr"),
  roleEs: text("role_es"),
  roleDe: text("role_de"),
  image: text("image"), // Photo URL
  displayOrder: integer("display_order").notNull().default(0), // For ordering members
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comments table (for news and products)
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Display name for backward compatibility
  userProfileId: varchar("user_profile_id").references(() => userProfiles.id, { onDelete: "set null" }),
  userName: text("user_name"), // Cached user name at time of comment
  userAvatar: text("user_avatar"), // Cached user avatar at time of comment
  userTotalComments: integer("user_total_comments"), // Cached total comments at time of comment
  contentType: text("content_type").notNull(), // 'news' or 'product'
  contentId: varchar("content_id").notNull(), // ID of the news or product
  comment: text("comment").notNull(),
  isApproved: integer("is_approved").notNull().default(0), // 0 pending, 1 approved by admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'editor']).default('editor'),
  isActive: z.union([z.literal(0), z.literal(1)]).default(1),
});
export const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(['admin', 'editor']).optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
}).strict(); // Reject unknown fields
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isActive: z.union([z.literal(0), z.literal(1)]).default(1),
});
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  contentType: z.enum(['news', 'product']),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be at most 1000 characters"),
  isApproved: z.union([z.literal(0), z.literal(1)]).default(0),
});
export const updateCommentSchema = insertCommentSchema.partial().strict();
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, publishedAt: true }).extend({
  content: z.string().max(1200, "Content must be 1200 characters or less"),
  contentEn: z.string().max(1200, "Content must be 1200 characters or less").optional(),
  titleEn: z.string().optional(),
});
export const updateNewsSchema = insertNewsSchema.partial().strict();
export const insertEventSchema = createInsertSchema(events).omit({ id: true }).extend({
  titleEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  ticketLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export const updateEventSchema = insertEventSchema.partial().strict();
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true, uploadedAt: true }).extend({
  type: z.enum(['photo', 'video']),
  caption: z.string().optional(),
  captionEn: z.string().optional(),
  thumbnail: z.string().optional(),
});
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, ticketId: true, status: true, createdAt: true, updatedAt: true });
export const insertBiographySchema = createInsertSchema(biography).omit({ id: true }).extend({
  content: z.string().max(800, "Biography must be 800 characters or less"),
  contentEn: z.string().max(800, "Biography must be 800 characters or less").optional(),
  bandImage: z.string().optional(),
});
export const insertSpotifySettingsSchema = createInsertSchema(spotifySettings).omit({ id: true }).extend({
  embedUrl: z.string().regex(/^https:\/\/open\.spotify\.com\/embed\//, "Must be a Spotify embed URL"),
  displayType: z.enum(['player', 'banner']),
  isActive: z.union([z.literal(0), z.literal(1)]),
});

export const insertBandMemberSchema = createInsertSchema(bandMembers).omit({ id: true, createdAt: true }).extend({
  roleEn: z.string().nullable().optional(),
  roleFr: z.string().nullable().optional(),
  roleEs: z.string().nullable().optional(),
  roleDe: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.union([z.literal(0), z.literal(1)]).default(1),
});
export const updateBandMemberSchema = insertBandMemberSchema.partial().strict();

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  type: z.enum(['physical', 'digital']),
  price: z.number().int().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isActive: z.union([z.literal(0), z.literal(1)]),
  featured: z.union([z.literal(0), z.literal(1)]),
});
export const updateProductSchema = insertProductSchema.partial().strict();
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true }).extend({
  totalAmount: z.number().int().positive("Total amount must be positive"),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled']).default('pending'),
});
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true }).extend({
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.number().int().positive("Price must be positive"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

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

export type InsertSpotifySettings = z.infer<typeof insertSpotifySettingsSchema>;
export type SpotifySettings = typeof spotifySettings.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertBandMember = z.infer<typeof insertBandMemberSchema>;
export type BandMember = typeof bandMembers.$inferSelect;
