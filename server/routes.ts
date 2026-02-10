import type { Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsSchema, insertEventSchema, insertGallerySchema, updateGallerySchema, insertContactSchema, insertBiographySchema, insertSpotifySettingsSchema, insertUserSchema, updateUserSchema, updateNewsSchema, updateEventSchema, insertProductSchema, updateProductSchema, insertCommentSchema, updateCommentSchema, insertBandMemberSchema, updateBandMemberSchema, insertUserProfileSchema } from "@shared/schema";
import { registerAuthRoutes, requireAuth, requireRole } from "./auth";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

declare module 'express-session' {
  interface SessionData {
    customerUserId?: string;
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===== AUTH ROUTES =====
  registerAuthRoutes(app);
  
  // ===== OBJECT STORAGE ROUTES =====
  // Get presigned URL for file upload (protected - admin only)
  app.post("/api/objects/upload", requireAuth, async (_req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Normalize upload URL to object path (for frontend use after upload)
  app.post("/api/objects/normalize-path", requireAuth, async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ objectPath: normalizedPath });
    } catch (error) {
      console.error("Error normalizing path:", error);
      res.status(500).json({ error: "Failed to normalize path" });
    }
  });

  // Serve uploaded objects (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  
  // ===== ADMIN STATS ROUTE =====
  app.get("/api/admin/stats", requireAuth, async (_req, res) => {
    try {
      const [news, events, gallery, products, users, contacts, comments] = await Promise.all([
        storage.getAllNews(),
        storage.getAllEvents(),
        storage.getAllGallery(),
        storage.getAllProducts(),
        storage.getAllUsers(),
        storage.getAllContacts(),
        storage.getAllComments(),
      ]);

      const newContacts = contacts.filter(c => c.status === 'new').length;
      const pendingComments = comments.filter((c: any) => c.isApproved === 0).length;

      res.json({
        news: news.length,
        events: events.length,
        gallery: gallery.length,
        products: products.length,
        contacts: newContacts,
        comments: pendingComments,
        users: users.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  
  // ===== NEWS ROUTES =====
  app.get("/api/news", async (_req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.getNewsById(req.params.id);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", requireAuth, async (req, res) => {
    try {
      const validated = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(validated);
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  app.patch("/api/news/:id", requireAuth, async (req, res) => {
    try {
      const validated = updateNewsSchema.parse(req.body);
      const news = await storage.updateNews(req.params.id, validated);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid news data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update news" });
    }
  });

  app.delete("/api/news/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteNews(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "News not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete news" });
    }
  });

  // ===== EVENTS ROUTES =====
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const validated = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validated);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const validated = updateEventSchema.parse(req.body);
      const event = await storage.updateEvent(req.params.id, validated);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // ===== GALLERY ROUTES =====
  app.get("/api/gallery", async (_req, res) => {
    try {
      const gallery = await storage.getAllGallery();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const item = await storage.getGalleryById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery item" });
    }
  });

  app.post("/api/gallery", requireAuth, async (req, res) => {
    try {
      const validated = insertGallerySchema.parse(req.body);
      const item = await storage.createGalleryItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid gallery data" });
    }
  });

  app.patch("/api/gallery/:id", requireAuth, async (req, res) => {
    try {
      const validated = updateGallerySchema.parse(req.body);
      const updated = await storage.updateGalleryItem(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid gallery data" });
    }
  });

  app.delete("/api/gallery/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteGalleryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gallery item" });
    }
  });

  // ===== CONTACTS ROUTES =====
  app.get("/api/contacts", requireAuth, async (_req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const contact = await storage.getContactById(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validated = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validated);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Contact creation error:", error);
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.patch("/api/contacts/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const contact = await storage.updateContactStatus(req.params.id, status);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact status" });
    }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteContact(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // ===== BIOGRAPHY ROUTES =====
  app.get("/api/biography", async (_req, res) => {
    try {
      const biography = await storage.getBiography();
      if (!biography) {
        return res.status(404).json({ error: "Biography not found" });
      }
      res.json(biography);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch biography" });
    }
  });

  app.put("/api/biography", requireAuth, async (req, res) => {
    try {
      const validated = insertBiographySchema.parse(req.body);
      const biography = await storage.updateBiography(validated);
      res.json(biography);
    } catch (error) {
      res.status(400).json({ error: "Invalid biography data" });
    }
  });

  // ===== BAND MEMBERS ROUTES =====
  app.get("/api/band-members", async (_req, res) => {
    try {
      const members = await storage.getAllBandMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch band members" });
    }
  });

  app.get("/api/band-members/:id", async (req, res) => {
    try {
      const member = await storage.getBandMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Band member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch band member" });
    }
  });

  app.post("/api/band-members", requireAuth, async (req, res) => {
    try {
      const validated = insertBandMemberSchema.parse(req.body);
      const member = await storage.createBandMember(validated);
      res.status(201).json(member);
    } catch (error) {
      console.error("Band member creation error:", error);
      res.status(400).json({ error: "Invalid band member data" });
    }
  });

  app.patch("/api/band-members/:id", requireAuth, async (req, res) => {
    try {
      const validated = updateBandMemberSchema.parse(req.body);
      const member = await storage.updateBandMember(req.params.id, validated);
      if (!member) {
        return res.status(404).json({ error: "Band member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid band member data" });
    }
  });

  app.delete("/api/band-members/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteBandMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Band member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete band member" });
    }
  });

  // ===== SPOTIFY SETTINGS ROUTES =====
  app.get("/api/spotify-settings", async (_req, res) => {
    try {
      const settings = await storage.getSpotifySettings();
      res.json(settings || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Spotify settings" });
    }
  });

  app.put("/api/spotify-settings", requireAuth, async (req, res) => {
    try {
      const validated = insertSpotifySettingsSchema.parse(req.body);
      const settings = await storage.updateSpotifySettings(validated);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid Spotify settings data" });
    }
  });

  // ===== USERS MANAGEMENT ROUTES (Admin only) =====
  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== 'admin' || user.isActive !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: "Authorization check failed" });
    }
  };

  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validated.password, 10);
      const user = await storage.createUser({ ...validated, password: hashedPassword });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = updateUserSchema.parse(req.body);
      
      if (validated.password) {
        validated.password = await bcrypt.hash(validated.password, 10);
      }
      
      if (req.session.userId === req.params.id && validated.role && validated.role !== req.session.role) {
        return res.status(400).json({ error: "Cannot change your own role" });
      }
      
      const user = await storage.updateUser(req.params.id, validated);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Prevent self-deletion
      if (req.session.userId === req.params.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ===== E-COMMERCE ROUTES =====
  
  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, active, featured } = req.query;
      
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId as string);
      } else if (active === 'true') {
        products = await storage.getActiveProducts();
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validated);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ===== COMMENTS ROUTES =====

  app.get("/api/comments", async (_req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
    try {
      const comment = await storage.getCommentById(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comment" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      // Require customer login for comments
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Login required to comment" });
      }
      
      // Get the authenticated user's profile
      const userProfile = await storage.getUserProfileById(req.session.customerUserId);
      if (!userProfile) {
        return res.status(401).json({ error: "User profile not found" });
      }
      
      const { contentType, contentId, comment } = req.body;
      
      // Validate required fields
      if (!contentType || !contentId || !comment) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      if (comment.length < 10 || comment.length > 1000) {
        return res.status(400).json({ error: "Comment must be between 10 and 1000 characters" });
      }
      
      // Create comment with server-verified user data
      const newComment = await storage.createComment({
        userId: userProfile.id,
        userProfileId: userProfile.id,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        userTotalComments: userProfile.totalComments || 0,
        contentType,
        contentId,
        comment,
        isApproved: 0,
      });
      
      res.status(201).json(newComment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.patch("/api/comments/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Get original comment to check if it was already approved
      const originalComment = await storage.getCommentById(req.params.id);
      if (!originalComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      const validated = updateCommentSchema.parse(req.body);
      const comment = await storage.updateComment(req.params.id, validated);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      // If comment was just approved (was 0, now 1), increment user's total approved comments
      if (originalComment.isApproved === 0 && validated.isApproved === 1 && comment.userProfileId) {
        await storage.incrementUserProfileComments(comment.userProfileId);
        // Update the userTotalComments in the comment to reflect the new count
        const updatedProfile = await storage.getUserProfileById(comment.userProfileId);
        if (updatedProfile) {
          await storage.updateComment(req.params.id, { 
            userTotalComments: updatedProfile.totalComments 
          });
        }
      }
      
      res.json(comment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // ===== CUSTOMER AUTH ROUTES =====
  
  // Customer Registration
  app.post("/api/customer/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password and name are required" });
      }
      
      const existingUser = await storage.getUserProfileByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const profile = await storage.createUserProfile({
        email,
        password: hashedPassword,
        name,
        isActive: 1,
      });
      
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.customerUserId = profile.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }
          const { password: _, ...safeProfile } = profile;
          res.status(201).json(safeProfile);
        });
      });
    } catch (error: any) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });
  
  // Customer Login
  app.post("/api/customer/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const profile = await storage.getUserProfileByEmail(email);
      if (!profile) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, profile.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (profile.isActive === 0) {
        return res.status(401).json({ error: "Account is inactive" });
      }
      
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.customerUserId = profile.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }
          const { password: _, ...safeProfile } = profile;
          res.json(safeProfile);
        });
      });
    } catch (error) {
      console.error("Customer login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });
  
  // Customer Logout
  app.post("/api/customer/logout", (req, res) => {
    req.session.customerUserId = undefined;
    res.json({ success: true });
  });
  
  // Get current customer
  app.get("/api/customer/me", async (req, res) => {
    try {
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const profile = await storage.getUserProfileById(req.session.customerUserId);
      if (!profile) {
        req.session.customerUserId = undefined;
        return res.status(401).json({ error: "Profile not found" });
      }
      
      // Calculate approved comments count dynamically
      const allComments = await storage.getAllComments();
      const approvedCommentsCount = allComments.filter(
        c => c.userProfileId === profile.id && c.isApproved === 1
      ).length;
      
      const { password: _, ...safeProfile } = profile;
      res.json({ ...safeProfile, totalComments: approvedCommentsCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  
  // Customer file upload - presigned URL
  app.post("/api/customer/upload", async (req, res) => {
    try {
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating customer upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Customer normalize upload path
  app.post("/api/customer/normalize-path", async (req, res) => {
    try {
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ objectPath: normalizedPath });
    } catch (error) {
      console.error("Error normalizing customer path:", error);
      res.status(500).json({ error: "Failed to normalize path" });
    }
  });

  // Update customer profile
  app.patch("/api/customer/profile", async (req, res) => {
    try {
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { name, avatar, biography, musicalTastes, preferredPaymentMethod, phone, address, city, postalCode, country } = req.body;
      
      const updated = await storage.updateUserProfile(req.session.customerUserId, {
        name,
        avatar,
        biography,
        musicalTastes,
        preferredPaymentMethod,
        phone,
        address,
        city,
        postalCode,
        country,
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      const { password: _, ...safeProfile } = updated;
      res.json(safeProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  
  // Get customer orders
  app.get("/api/customer/orders", async (req, res) => {
    try {
      if (!req.session.customerUserId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const orders = await storage.getOrdersByUserProfileId(req.session.customerUserId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // ===== STRIPE PAYMENT ROUTES =====
  
  // Create Payment Intent for checkout
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "eur", orderId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // amount already in cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId || "",
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent: " + error.message });
    }
  });

  // Stripe Webhook Handler
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Missing signature or webhook secret');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const orderId = paymentIntent.metadata.orderId;
          
          if (orderId) {
            await storage.updateOrderStatus(orderId, 'paid');
            console.log(`Order ${orderId} marked as paid`);
          }
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          const failedOrderId = failedIntent.metadata.orderId;
          
          if (failedOrderId) {
            await storage.updateOrderStatus(failedOrderId, 'cancelled');
            console.log(`Order ${failedOrderId} marked as cancelled`);
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Orders
  app.post("/api/orders/create-with-payment", async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, shippingAddress, items } = req.body;

      if (!customerName || !customerEmail || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (!product.isActive) {
          return res.status(400).json({ error: `Product ${product.name} is not available` });
        }
        if (product.type === 'physical' && product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderNumber = `ORD-${timestamp}-${random}`;

      const orderToCreate: any = {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        billingAddress: null,
        totalAmount,
        status: "pending" as const,
        paymentMethod: "stripe",
        paymentIntentId: null,
        notes: null,
      };
      
      const order = await storage.createOrder(orderToCreate);

      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          ...item,
        });
      }

      const amountInCents = Math.round(totalAmount * 100);
      console.log("Creating Stripe PaymentIntent for order:", order.id, "Amount (EUR):", totalAmount, "Amount (cents):", amountInCents);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always',
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      console.log("PaymentIntent created:", {
        id: paymentIntent.id,
        hasClientSecret: !!paymentIntent.client_secret,
        status: paymentIntent.status
      });

      await storage.updateOrder(order.id, {
        paymentIntentId: paymentIntent.id,
      });

      res.status(201).json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating order with payment:", error);
      res.status(500).json({ error: "Failed to create order: " + error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderNumber = `ORD-${timestamp}-${random}`;
      
      const order = await storage.createOrder({
        ...orderData,
        orderNumber,
      });
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Failed to create order: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/number/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByOrderNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItemsByOrderId(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders/:orderId/items", async (req, res) => {
    try {
      const itemData = {
        ...req.body,
        orderId: req.params.orderId,
      };
      const item = await storage.createOrderItem(itemData);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating order item:", error);
      res.status(400).json({ error: "Failed to create order item: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
