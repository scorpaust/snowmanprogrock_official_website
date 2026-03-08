import {
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type News,
  type InsertNews,
  type Event,
  type InsertEvent,
  type Gallery,
  type InsertGallery,
  type Contact,
  type InsertContact,
  type Biography,
  type InsertBiography,
  type SpotifySettings,
  type InsertSpotifySettings,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Comment,
  type InsertComment,
  type BandMember,
  type InsertBandMember,
  type DownloadToken,
  type InsertDownloadToken,
  users,
  userProfiles,
  news,
  events,
  gallery,
  contacts,
  biography,
  spotifySettings,
  categories,
  products,
  orders,
  orderItems,
  comments,
  bandMembers,
  downloadTokens,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // News
  getAllNews(): Promise<News[]>;
  getNewsById(id: string): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: string, news: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<boolean>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Gallery
  getAllGallery(): Promise<Gallery[]>;
  getGalleryById(id: string): Promise<Gallery | undefined>;
  createGalleryItem(item: InsertGallery): Promise<Gallery>;
  updateGalleryItem(id: string, item: Partial<InsertGallery>): Promise<Gallery | undefined>;
  deleteGalleryItem(id: string): Promise<boolean>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContactStatus(id: string, status: string): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<void>;

  // Biography
  getBiography(): Promise<Biography | undefined>;
  updateBiography(bio: InsertBiography): Promise<Biography>;

  // Spotify Settings
  getSpotifySettings(): Promise<SpotifySettings | undefined>;
  updateSpotifySettings(settings: InsertSpotifySettings): Promise<SpotifySettings>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order Items
  getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Comments
  getAllComments(): Promise<Comment[]>;
  getCommentById(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  // Band Members
  getAllBandMembers(): Promise<BandMember[]>;
  getBandMemberById(id: string): Promise<BandMember | undefined>;
  createBandMember(member: InsertBandMember): Promise<BandMember>;
  updateBandMember(id: string, member: Partial<InsertBandMember>): Promise<BandMember | undefined>;
  deleteBandMember(id: string): Promise<boolean>;

  // User Profiles (Customer accounts)
  getAllUserProfiles(): Promise<UserProfile[]>;
  getUserProfileById(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  deleteUserProfile(id: string): Promise<boolean>;
  incrementUserProfileComments(id: string): Promise<UserProfile | undefined>;
  getOrdersByUserProfileId(userId: string): Promise<Order[]>;

  // Download Tokens
  createDownloadToken(token: InsertDownloadToken): Promise<DownloadToken>;
  getDownloadTokenByToken(token: string): Promise<DownloadToken | undefined>;
  getDownloadTokensByOrderItem(orderItemId: string): Promise<DownloadToken[]>;
  getDownloadTokensByUser(userId: string): Promise<DownloadToken[]>;
  incrementDownloadCount(id: string): Promise<DownloadToken | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private news: Map<string, News>;
  private events: Map<string, Event>;
  private gallery: Map<string, Gallery>;
  private contacts: Map<string, Contact>;
  private biography: Biography | undefined;
  private spotifySettings: SpotifySettings | undefined;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private comments: Map<string, Comment>;
  private bandMembersMap: Map<string, BandMember>;
  private userProfiles: Map<string, UserProfile>;

  constructor() {
    this.users = new Map();
    this.news = new Map();
    this.events = new Map();
    this.gallery = new Map();
    this.contacts = new Map();
    this.biography = undefined;
    this.spotifySettings = undefined;
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.comments = new Map();
    this.bandMembersMap = new Map();
    this.userProfiles = new Map();

    this.seedData();
  }

  private seedData() {
    const bio: Biography = {
      id: randomUUID(),
      content: "Snowman é uma banda de rock progressivo portuguesa formada em Lisboa. Com uma abordagem única que combina complexidade rítmica, atmosferas envolventes e uma energia vibrante, a banda tem conquistado palcos e corações por todo o país.",
      contentEn: "Snowman is a Portuguese progressive rock band formed in Lisbon. With a unique approach that combines rhythmic complexity, immersive atmospheres and vibrant energy, the band has been conquering stages and hearts across the country.",
      updatedAt: new Date(),
    };
    this.biography = bio;

    const spotify: SpotifySettings = {
      id: randomUUID(),
      embedUrl: "https://open.spotify.com/embed/album/7MXVkk9YMctZqd1Srtv4MB",
      displayType: "player",
      isActive: 1,
      updatedAt: new Date(),
    };
    this.spotifySettings = spotify;

    const sampleNews: News[] = [
      {
        id: randomUUID(),
        title: "Novo Álbum 'Horizons' Lançado",
        titleEn: "New Album 'Horizons' Released",
        content: "Estamos muito felizes em anunciar o lançamento do nosso novo álbum 'Horizons'. Este trabalho representa uma nova direção sonora para a banda, explorando territórios mais experimentais.",
        contentEn: "We are thrilled to announce the release of our new album 'Horizons'. This work represents a new sonic direction for the band, exploring more experimental territories.",
        images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
        publishedAt: new Date(),
        featured: 1,
      },
      {
        id: randomUUID(),
        title: "Tour Europeia Anunciada",
        titleEn: "European Tour Announced",
        content: "A Snowman anuncia a sua primeira tour europeia! Vamos passar por várias cidades icónicas apresentando o novo álbum 'Horizons' ao vivo.",
        contentEn: "Snowman announces its first European tour! We'll be visiting several iconic cities presenting the new album 'Horizons' live.",
        images: ["https://images.unsplash.com/photo-1540039155733-5fca0d5f428e?w=800&q=80"],
        publishedAt: new Date(),
        featured: 0,
      },
      {
        id: randomUUID(),
        title: "Entrevista na Rock Magazine",
        titleEn: "Interview in Rock Magazine",
        content: "Confira a nossa entrevista exclusiva na Rock Magazine onde falamos sobre o processo criativo por trás do novo álbum e os desafios de ser uma banda de prog rock em Portugal.",
        contentEn: "Check out our exclusive interview in Rock Magazine where we talk about the creative process behind the new album and the challenges of being a prog rock band in Portugal.",
        images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80"],
        publishedAt: new Date(),
        featured: 0,
      },
    ];

    sampleNews.forEach(news => this.news.set(news.id, news));

    const sampleEvents: Event[] = [
      {
        id: randomUUID(),
        title: "Snowman Live em Lisboa",
        titleEn: "Snowman Live in Lisbon",
        venue: "LAV - Lisboa ao Vivo",
        city: "Lisboa",
        country: "Portugal",
        eventDate: new Date('2024-06-15T21:00:00'),
        description: "Apresentação do novo álbum 'Horizons' em Lisboa",
        descriptionEn: "Presentation of the new album 'Horizons' in Lisbon",
        ticketLink: "https://example.com/tickets",
      },
      {
        id: randomUUID(),
        title: "Festival RockFest Porto",
        titleEn: "RockFest Porto Festival",
        venue: "Hard Club",
        city: "Porto",
        country: "Portugal",
        eventDate: new Date('2024-07-20T20:00:00'),
        description: "Participação no Festival RockFest Porto",
        descriptionEn: "Participation in RockFest Porto Festival",
        ticketLink: "https://example.com/tickets",
      },
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));

    const sampleGallery: Gallery[] = [
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        thumbnail: null,
        caption: 'Live in Lisbon 2024',
        captionEn: 'Live in Lisbon 2024',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
        thumbnail: null,
        caption: 'Studio Session',
        captionEn: 'Studio Session',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        thumbnail: null,
        caption: 'Backstage Moments',
        captionEn: 'Backstage Moments',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80',
        thumbnail: null,
        caption: 'Album Recording',
        captionEn: 'Album Recording',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        thumbnail: null,
        caption: 'Concert Night',
        captionEn: 'Concert Night',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
        thumbnail: null,
        caption: 'On Tour',
        captionEn: 'On Tour',
        uploadedAt: new Date(),
      },
    ];

    sampleGallery.forEach(item => this.gallery.set(item.id, item));
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // News
  async getAllNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getNewsById(id: string): Promise<News | undefined> {
    return this.news.get(id);
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = randomUUID();
    const news: News = {
      ...insertNews,
      id,
      publishedAt: new Date(),
    };
    this.news.set(id, news);
    return news;
  }

  async updateNews(id: string, updates: Partial<InsertNews>): Promise<News | undefined> {
    const existing = this.news.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.news.set(id, updated);
    return updated;
  }

  async deleteNews(id: string): Promise<boolean> {
    return this.news.delete(id);
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Gallery
  async getAllGallery(): Promise<Gallery[]> {
    return Array.from(this.gallery.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getGalleryById(id: string): Promise<Gallery | undefined> {
    return this.gallery.get(id);
  }

  async createGalleryItem(insertItem: InsertGallery): Promise<Gallery> {
    const id = randomUUID();
    const item: Gallery = {
      ...insertItem,
      id,
      uploadedAt: new Date(),
    };
    this.gallery.set(id, item);
    return item;
  }

  async updateGalleryItem(id: string, updates: Partial<InsertGallery>): Promise<Gallery | undefined> {
    const existing = this.gallery.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.gallery.set(id, updated);
    return updated;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    return this.gallery.delete(id);
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const prefix = insertContact.type;
    const ticketId = `${prefix}_${randomUUID().substring(0, 8).toUpperCase()}`;
    
    const contact: Contact = {
      ...insertContact,
      id,
      ticketId,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<void> {
    this.contacts.delete(id);
  }

  // Biography
  async getBiography(): Promise<Biography | undefined> {
    return this.biography;
  }

  async updateBiography(insertBio: InsertBiography): Promise<Biography> {
    const bio: Biography = {
      ...insertBio,
      id: this.biography?.id || randomUUID(),
      updatedAt: new Date(),
    };
    this.biography = bio;
    return bio;
  }

  // Spotify Settings
  async getSpotifySettings(): Promise<SpotifySettings | undefined> {
    return this.spotifySettings;
  }

  async updateSpotifySettings(insertSettings: InsertSpotifySettings): Promise<SpotifySettings> {
    const settings: SpotifySettings = {
      ...insertSettings,
      id: this.spotifySettings?.id || randomUUID(),
      updatedAt: new Date(),
    };
    this.spotifySettings = settings;
    return settings;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCat: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCat, id, createdAt: new Date() };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId);
  }

  async getActiveProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive === 1);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured === 1 && p.isActive === 1);
  }

  async createProduct(insertProd: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProd, id, createdAt: new Date(), updatedAt: new Date() };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.orderNumber === orderNumber);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${randomUUID().substring(0, 6).toUpperCase()}`;
    const order: Order = { ...insertOrder, id, orderNumber, createdAt: new Date(), updatedAt: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  // Order Items
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = { ...insertItem, id, createdAt: new Date() };
    this.orderItems.set(id, item);
    return item;
  }

  async getAllComments(): Promise<Comment[]> {
    return Array.from(this.comments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCommentById(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: randomUUID(),
      ...comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    const updated: Comment = {
      ...comment,
      ...updates,
      updatedAt: new Date(),
    };
    this.comments.set(id, updated);
    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Band Members
  async getAllBandMembers(): Promise<BandMember[]> {
    return Array.from(this.bandMembersMap.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }

  async getBandMemberById(id: string): Promise<BandMember | undefined> {
    return this.bandMembersMap.get(id);
  }

  async createBandMember(member: InsertBandMember): Promise<BandMember> {
    const id = randomUUID();
    const newMember: BandMember = {
      ...member,
      id,
      createdAt: new Date(),
    };
    this.bandMembersMap.set(id, newMember);
    return newMember;
  }

  async updateBandMember(id: string, updates: Partial<InsertBandMember>): Promise<BandMember | undefined> {
    const existing = this.bandMembersMap.get(id);
    if (!existing) return undefined;
    const updated: BandMember = { ...existing, ...updates };
    this.bandMembersMap.set(id, updated);
    return updated;
  }

  async deleteBandMember(id: string): Promise<boolean> {
    return this.bandMembersMap.delete(id);
  }

  // User Profiles (Customer accounts)
  async getAllUserProfiles(): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values());
  }

  async getUserProfileById(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(p => p.email === email);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const newProfile: UserProfile = {
      ...profile,
      id,
      totalComments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateUserProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    const updated: UserProfile = { ...existing, ...updates, updatedAt: new Date() };
    this.userProfiles.set(id, updated);
    return updated;
  }

  async deleteUserProfile(id: string): Promise<boolean> {
    return this.userProfiles.delete(id);
  }

  async incrementUserProfileComments(id: string): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    const updated: UserProfile = { 
      ...existing, 
      totalComments: (existing.totalComments || 0) + 1,
      updatedAt: new Date() 
    };
    this.userProfiles.set(id, updated);
    return updated;
  }

  async getOrdersByUserProfileId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  private downloadTokensMap: Map<string, DownloadToken> = new Map();

  async createDownloadToken(token: InsertDownloadToken): Promise<DownloadToken> {
    const id = randomUUID();
    const newToken: DownloadToken = {
      id,
      ...token,
      downloadsUsed: token.downloadsUsed ?? 0,
      maxDownloads: token.maxDownloads ?? 5,
      createdAt: new Date(),
    } as DownloadToken;
    this.downloadTokensMap.set(id, newToken);
    return newToken;
  }

  async getDownloadTokenByToken(token: string): Promise<DownloadToken | undefined> {
    return Array.from(this.downloadTokensMap.values()).find(t => t.token === token);
  }

  async getDownloadTokensByOrderItem(orderItemId: string): Promise<DownloadToken[]> {
    return Array.from(this.downloadTokensMap.values()).filter(t => t.orderItemId === orderItemId);
  }

  async getDownloadTokensByUser(userId: string): Promise<DownloadToken[]> {
    return Array.from(this.downloadTokensMap.values()).filter(t => t.userId === userId);
  }

  async incrementDownloadCount(id: string): Promise<DownloadToken | undefined> {
    const existing = this.downloadTokensMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, downloadsUsed: existing.downloadsUsed + 1 };
    this.downloadTokensMap.set(id, updated);
    return updated;
  }
}

export class DbStorage implements IStorage {
  async seedData() {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0) {
        const hashedPassword = await bcrypt.hash("snowman2024", 10);
        await db.insert(users).values({
          username: "admin",
          email: "snowmanprogrock@gmail.com",
          password: hashedPassword,
          role: "admin",
          isActive: 1,
        });
        console.log("Admin user seeded successfully");
      }
    } catch (err) {
      console.error("Error seeding admin user:", err);
    }

    const SEED_VERSION = 2;
    const needsReseed = await this.checkSeedVersion(SEED_VERSION);

    if (needsReseed) {
      console.log(`Reseeding database to version ${SEED_VERSION}...`);
      await db.delete(bandMembers);
      await db.delete(downloadTokens);
      await db.delete(orderItems);
      await db.delete(orders);
      await db.delete(products);
      await db.delete(categories);
      await db.delete(gallery);
      await db.delete(events);
      await db.delete(news);
      await db.delete(spotifySettings);
      await db.delete(biography);
    }

    const existingBio = await db.select().from(biography).limit(1);
    if (existingBio.length === 0) {
      await db.insert(biography).values({
        content: "Nascidos em Portugal e movidos pela paixão do rock progressivo, os Snowman criam paisagens sonoras intensas e emotivas, inspiradas por Pink Floyd, Genesis, Porcupine Tree e Camel. Liderados por Pedro Fernandes (voz, guitarra) e Dinis Costa (teclados), e acompanhados por músicos convidados como David Vieira, Ruydabass, João Nero e Cristiana Gomes, o projeto cresce desde 2018. Com discos como In a Better Place (2022) e Transient Reality (2024), afirmaram-se como uma das vozes mais autênticas do prog rock nacional. Após o aclamado single Hand in Hand (Toda a Palavra é Corpo), 2026 marca um novo capítulo com o lançamento de Another Cigarette, aprofundando ainda mais a sua identidade sonora única.",
        contentEn: "Born in Portugal and driven by a passion for progressive rock, Snowman crafts intense and emotional soundscapes inspired by Pink Floyd, Genesis, Porcupine Tree, and Camel. Led by Pedro Fernandes (vocals, guitar) and Dinis Costa (keyboards), and joined by guest musicians like David Vieira, Ruydabass, João Nero, and Cristiana Gomes, the project has been growing since 2018. With albums like In a Better Place (2022) and Transient Reality (2024), they've become one of Portugal's most authentic prog rock voices. Following the acclaimed single Hand in Hand (Toda a Palavra é Corpo), 2026 marks a new chapter with Another Cigarette, deepening their unique sonic identity.",
        contentFr: "Nés au Portugal et portés par la passion du rock progressif, Snowman tisse des paysages sonores intenses et émouvants, inspirés par Pink Floyd, Genesis, Porcupine Tree et Camel. Mené par Pedro Fernandes (voix, guitare) et Dinis Costa (claviers), avec des musiciens invités comme David Vieira, Ruydabass, João Nero et Cristiana Gomes, le projet évolue depuis 2018. Avec les albums In a Better Place (2022) et Transient Reality (2024), Snowman s'impose comme l'une des voix les plus authentiques du prog rock portugais. Après le single acclamé Hand in Hand (Toda a Palavra é Corpo), 2026 marque un nouveau chapitre avec Another Cigarette, approfondissant leur identité sonore unique.",
        contentEs: "Nacidos en Portugal y movidos por la pasión del rock progresivo, Snowman crea paisajes sonoros intensos y emotivos, inspirados en Pink Floyd, Genesis, Porcupine Tree y Camel. Liderados por Pedro Fernandes (voz, guitarra) y Dinis Costa (teclados), junto a músicos invitados como David Vieira, Ruydabass, João Nero y Cristiana Gomes, el proyecto crece desde 2018. Con álbumes como In a Better Place (2022) y Transient Reality (2024), se han consolidado como una de las voces más auténticas del prog rock portugués. Tras el aclamado sencillo Hand in Hand (Toda la Palabra es Cuerpo), 2026 marca un nuevo capítulo con el lanzamiento de Another Cigarette, una obra que profundiza su identidad sonora única.",
        contentDe: "Snowman, gegründet in Portugal, lässt sich von der Leidenschaft für Progressive Rock antreiben und schafft intensive, emotionale Klanglandschaften, inspiriert von Pink Floyd, Genesis, Porcupine Tree und Camel. Geleitet von Pedro Fernandes (Gesang, Gitarre) und Dinis Costa (Keyboards), unterstützt von Gästen wie David Vieira, Ruydabass, João Nero und Cristiana Gomes, wächst das Projekt seit 2018 stetig. Mit Alben wie In a Better Place (2022) und Transient Reality (2024) etablierte sich Snowman als eine der authentischsten Stimmen des portugiesischen Prog Rocks. Nach der gefeierten Single Hand in Hand (Toda a Palavra é Corpo) eröffnet 2026 mit Another Cigarette ein neues Kapitel in ihrer klanglichen Reise.",
        bandImage: "/objects/uploads/3f418012-4c9f-415a-a19d-d8324c79f10e",
      });
    }

    const existingSpotify = await db.select().from(spotifySettings).limit(1);
    if (existingSpotify.length === 0) {
      await db.insert(spotifySettings).values({
        embedUrl: "https://open.spotify.com/embed/album/619NixBSvlPPEH50CZqgM1",
        displayType: "banner",
        isActive: 1,
      });
    }

    const existingNews = await db.select().from(news).limit(1);
    if (existingNews.length === 0) {
      await db.insert(news).values([
        {
          title: `"Another Cigarette": o novo fôlego introspectivo dos Snowman`,
          titleEn: `"Another Cigarette" marks a new chapter for Snowman`,
          titleFr: `"Another Cigarette" : le nouveau souffle introspectif de Snowman`,
          titleEs: `"Another Cigarette": el nuevo impulso introspectivo de Snowman`,
          titleDe: `„Another Cigarette": der neue introspektive Atemzug von Snowman`,
          content: `A banda portuguesa Snowman, conhecida pelas suas paisagens sonoras atmosféricas e progressivas, acaba de lançar o single "Another Cigarette". A canção, escrita por Pedro Miguel Fernandes e produzida por André Eusébio (Lemon Drops Media), mergulha num universo melancólico e introspectivo, onde vício, memória e identidade se entrelaçam. O videoclipe oficial já está disponível e acompanha o lançamento do tema, que marca uma nova fase criativa para a banda, com uma abordagem mais direta, mas fiel às suas raízes progressivas. Com três álbuns no currículo, os Snowman continuam a explorar a fragilidade humana através da música.`,
          contentEn: `Portuguese band Snowman, known for their atmospheric and progressive soundscapes, have just released their new single "Another Cigarette". Written by Pedro Miguel Fernandes and produced by André Eusébio (Lemon Drops Media), the track dives into a melancholic, introspective world where addiction, memory, and identity collide. The official video is now available and marks a new creative chapter for the band — more direct, yet true to their progressive roots. With three albums already released, Snowman continue to explore human fragility through emotionally charged music.`,
          contentFr: `Le groupe portugais Snowman, connu pour ses paysages sonores atmosphériques et progressifs, vient de sortir le single "Another Cigarette". Écrite par Pedro Miguel Fernandes et produite par André Eusébio (Lemon Drops Media), la chanson plonge dans un univers mélancolique et introspectif, où se mêlent dépendance, mémoire et identité. Le clip officiel est désormais disponible et accompagne la sortie du morceau, qui marque une nouvelle phase créative pour le groupe, avec une approche plus directe tout en restant fidèle à ses racines progressives. Avec trois albums à leur actif, Snowman continue d'explorer la fragilité humaine à travers la musique.`,
          contentEs: `La banda portuguesa Snowman, conocida por sus paisajes sonoros atmosféricos y progresivos, acaba de lanzar el single "Another Cigarette". Escrita por Pedro Miguel Fernandes y producida por André Eusébio (Lemon Drops Media), la canción se sumerge en un universo melancólico e introspectivo, donde se entrelazan la adicción, la memoria y la identidad. El videoclip oficial ya está disponible y acompaña el lanzamiento del tema, que marca una nueva etapa creativa para la banda, con un enfoque más directo, pero fiel a sus raíces progresivas. Con tres discos en su trayectoria, Snowman sigue explorando la fragilidad humana a través de la música.`,
          contentDe: `Die portugiesische Band Snowman, bekannt für ihre atmosphärischen und progressiven Klanglandschaften, hat soeben ihre neue Single „Another Cigarette" veröffentlicht. Der Song, geschrieben von Pedro Miguel Fernandes und produziert von André Eusébio (Lemon Drops Media), taucht ein in eine melancholische und introspektive Welt, in der sich Sucht, Erinnerung und Identität miteinander verweben. Das offizielle Musikvideo ist jetzt verfügbar und begleitet die Veröffentlichung des Titels, der eine neue kreative Phase der Band einläutet – direkter, aber dennoch treu zu ihren progressiven Wurzeln. Mit drei Alben im Gepäck erforscht Snowman weiterhin die Zerbrechlichkeit des menschlichen Daseins durch Musik.`,
          images: ["/objects/uploads/a8583f67-e2e1-4ac3-805a-178e1011741d"],
          videoUrls: ["https://youtu.be/UnXDFIrEAUQ?si=VO65rLj7wyukOVOc"],
          publishedAt: new Date('2026-02-09T23:49:54.366Z'),
          featured: 1,
        },
      ]);
    }

    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        {
          title: "SNOWMAN – Uma Viagem Pelo Som",
          titleEn: "Snowman Live in Lisbon",
          venue: "Cine Incrível",
          city: "Almada",
          country: "Portugal",
          eventDate: new Date('2025-08-22T20:00:00'),
          description: "Pela primeira vez ao vivo, os Snowman sobem ao palco para um concerto único, onde apresentam os grandes momentos da sua discografia — desde a introspeção de Inner Light, passando pela densidade emocional de Transient Reality, até à poesia sonora de Hand in Hand (Toda a Palavra é Corpo).",
          descriptionEn: "Presentation of the new album 'Horizons' in Lisbon",
          ticketLink: "https://www.seetickets.com/pt/event/snowman-rock-progressivo/cine-incrivel/3458501",
        },
      ]);
    }

    const existingGallery = await db.select().from(gallery).limit(1);
    if (existingGallery.length === 0) {
      await db.insert(gallery).values([
        {
          type: 'photo',
          url: '/objects/uploads/2359cedf-2582-4a77-b92b-4f17f857e59f',
          caption: 'Gravação "In a Better Place" (2020). Foto de Daniel Pêgo.',
          captionEn: 'Recording of In a Better Place (2020). Photo by Daniel Pêgo.',
          captionFr: 'Enregistrement de In a Better Place (2020). Photo de Daniel Pêgo.',
          captionEs: 'Grabación de In a Better Place (2020). Foto de Daniel Pêgo.',
          captionDe: 'Aufnahme von In a Better Place (2020). Foto von Daniel Pêgo.',
        },
        {
          type: 'photo',
          url: '/objects/uploads/02caf81e-a381-4e52-9190-cf0bb64156b7',
          caption: 'André Eusébio (Produtor). Gravação "In a Better Place" (2020). Foto de Daniel Pêgo.',
          captionEn: "André Eusébio (Producer). Recording of 'In a Better Place' (2020). Photo by Daniel Pêgo.",
          captionFr: "André Eusébio (Producteur). Enregistrement de « In a Better Place » (2020). Photo de Daniel Pêgo.",
          captionEs: 'André Eusébio (Productor). Grabación de "In a Better Place" (2020). Foto de Daniel Pêgo.',
          captionDe: 'André Eusébio (Produzent). Aufnahme von „In a Better Place" (2020). Foto von Daniel Pêgo.',
        },
        {
          type: 'photo',
          url: '/objects/uploads/cdc24186-7391-44fe-92f8-ace28a143280',
          caption: "Dinis Costa. Gravação 'In a Better Place' (2020). Foto de Daniel Pêgo.",
          captionEn: 'Dinis Costa. Recording of In a Better Place (2020). Photo by Daniel Pêgo.',
          captionFr: 'Dinis Costa. Enregistrement de In a Better Place (2020). Photo de Daniel Pêgo.',
          captionEs: 'Dinis Costa. Grabación de In a Better Place (2020). Foto de Daniel Pêgo.',
          captionDe: 'Dinis Costa. Aufnahme von In a Better Place (2020). Foto von Daniel Pêgo.',
        },
        {
          type: 'photo',
          url: '/objects/uploads/ca910d8a-59a4-4043-803d-9be8f6d92ab4',
          caption: "Ruydabass. Gravação 'In a Better Place' (2020). Foto de Daniel Pêgo.",
          captionEn: 'Ruydabass. Recording of In a Better Place (2020). Photo by Daniel Pêgo.',
          captionFr: 'Ruydabass. Enregistrement de In a Better Place (2020). Photo de Daniel Pêgo.',
          captionEs: 'Ruydabass. Grabación de In a Better Place (2020). Foto de Daniel Pêgo.',
          captionDe: 'Aufnahme von In a Better Place (2020). Foto von Daniel Pêgo.',
        },
      ]);
    }

    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(categories).values([
        {
          name: "Discografia",
          nameEn: "Discography",
          nameFr: "Discographie",
          nameEs: "Discografía",
          nameDe: "Diskographie",
          slug: "discografia",
          description: "Álbuns e singles da banda Snowman",
          descriptionEn: "Snowman band albums and singles",
          descriptionFr: "Albums et singles du groupe Snowman",
          descriptionEs: "Álbumes y singles de la banda Snowman",
          descriptionDe: "Alben und Singles der Band Snowman",
        },
        {
          name: "Merchandise",
          nameEn: "Merchandise",
          nameFr: "Marchandise",
          nameEs: "Mercancía",
          nameDe: "Merchandise",
          slug: "merch",
          description: "Produtos oficiais da banda",
          descriptionEn: "Official band merchandise",
          descriptionFr: "Produits officiels du groupe",
          descriptionEs: "Productos oficiales de la banda",
          descriptionDe: "Offizielle Band-Merchandise",
        },
      ]);
    }

    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      const discografiaCategory = await db.select().from(categories).where(eq(categories.slug, 'discografia')).limit(1);
      const discografiaId = discografiaCategory[0]?.id;

      if (discografiaId) {
        await db.insert(products).values([
          {
            name: "In a Better Place - CD Físico",
            nameEn: "In a Better Place – Physical CD",
            description: "O aclamado álbum de 2022 dos Snowman agora disponível em formato físico. Um mergulho emocional no universo do rock progressivo português, com temas que exploram perda, esperança e transformação. Inclui arte gráfica exclusiva.",
            descriptionEn: "Snowman's acclaimed 2022 album is now available in physical format. An emotional journey through Portuguese progressive rock, exploring themes of loss, hope, and transformation. Includes exclusive artwork.",
            price: 1299,
            type: "physical",
            categoryId: discografiaId,
            images: ["/objects/uploads/af23b4e4-6999-440a-9e6f-33cd69457806"],
            stock: 4,
            isActive: 1,
            featured: 1,
          },
          {
            name: "Transient Reality – CD Físico",
            nameEn: "Transient Reality – Physical CD",
            description: `"Transient Reality" mergulha no universo complexo da saúde mental com empatia e sensibilidade musical. Cada faixa é uma reflexão emocional sobre a fragilidade humana e os desafios psicológicos do nosso tempo. Agora disponível em formato físico, com arte gráfica exclusiva.`,
            descriptionEn: `"Transient Reality" delves into the complex world of mental health with empathy and musical sensitivity. Each track is a deep emotional reflection on human fragility and psychological struggles. Now available in physical format, including exclusive artwork.`,
            price: 499,
            type: "physical",
            categoryId: discografiaId,
            images: ["/objects/uploads/e123ee54-d591-46e9-b7af-4b4d18139d36"],
            stock: 23,
            isActive: 1,
            featured: 1,
          },
          {
            name: "Hand in Hand (Toda a Palavra é Corpo)",
            nameEn: "Hand in Hand (Toda a Palavra é Corpo)",
            description: `Snowman regressa com "Hand in Hand (Toda a Palavra é Corpo)", uma fusão assombrosamente poética de rock progressivo e palavra falada. Com letras que tocam a alma de Pedro Miguel Fernandes e a voz evocativa de Inês Antunes (falafogo), o tema oferece uma viagem emocional pela linguagem, intimidade e identidade — onde cada palavra se torna corpo e cada som carrega peso.\nConstruída com texturas atmosféricas e ambição cinematográfica, a faixa desenrola-se em camadas, revelando novas profundidades emocionais a cada escuta. Produzida, misturada e masterizada por André Eusébio na Lemon Drops Media, a sonoridade é nítida, imersiva e sem concessões.`,
            descriptionEn: `Snowman returns with "Hand in Hand (Toda a Palavra é Corpo)," a hauntingly poetic fusion of progressive rock and spoken word. With soul-stirring lyrics by Pedro Miguel Fernandes and the evocative voice of Inês Antunes (falafogo), the track delivers an emotional journey through language, intimacy, and identity — where every word becomes body, and every sound carries weight.\n\nCrafted with atmospheric textures and cinematic ambition, the track unfolds in layers, revealing new emotional depths with every listen. Produced, mixed, and mastered by André Eusébio at Lemon Drops Media, the sound is crisp, immersive, and uncompromising.`,
            price: 99,
            type: "digital",
            categoryId: discografiaId,
            images: ["/objects/uploads/ef621867-2ce8-429e-b4a8-880f284e3e3f"],
            stock: 0,
            downloadUrl: "https://example.com/test-album.zip",
            digitalFileUrl: "/objects/uploads/8344da15-7b32-4694-9517-0c241d0870e1",
            isActive: 1,
            featured: 0,
          },
          {
            name: "Another Cigarette",
            nameEn: "Another Cigarette",
            description: `Snowman revelam "Another Cigarette", um single cru e intimista sobre fuga, vício e auto-reflexão. Com letras melancólicas e texturas cinematográficas, o tema mergulha profundamente nas lutas de uma alma perdida em busca de redenção — onde cada nota é um passo pela escuridão e cada palavra um grito por clareza.\n\nInterpretado por Snowman. Música e letra de Pedro Miguel Fernandes. Produzido por André Eusébio @ Lemon Drops Media. Vídeo de Daniel Pêgo. Agradecimentos especiais ao Skadi Bar.`,
            descriptionEn: `Snowman unveil "Another Cigarette", a raw and intimate single about escape, addiction, and self-reflection. With melancholic lyrics and cinematic textures, the track dives deep into the struggles of a lost soul seeking redemption — where every note is a step through darkness, and every word a cry for clarity.\n\nPerformed by Snowman. Music and Lyrics by Pedro Miguel Fernandes. Produced by André Eusébio @ Lemon Drops Media. Video by Daniel Pêgo. Special Thanks to Skadi Bar.`,
            price: 99,
            type: "digital",
            categoryId: discografiaId,
            images: ["/objects/uploads/0beecaa0-840a-4459-b84a-81204f97047a"],
            stock: 0,
            downloadUrl: "https://example.com/test-album.zip",
            digitalFileUrl: "/objects/uploads/d68bf6b3-bdf1-4bd8-8788-6fb016c98c16",
            isActive: 1,
            featured: 1,
          },
        ]);
      }
    }

    const existingMembers = await db.select().from(bandMembers).limit(1);
    if (existingMembers.length === 0) {
      await db.insert(bandMembers).values([
        {
          name: "Pedro Miguel Fernandes",
          role: "Guitarra e Voz",
          roleEn: "Guitar and Vocals",
          roleFr: "Guitare et Voix",
          roleEs: "Guitarra y Voz",
          roleDe: "Gitarre und Gesang",
          image: "/objects/uploads/68d300af-ce49-479e-8773-543ef1e4c373",
          displayOrder: 0,
          isActive: 1,
        },
        {
          name: "Dinis Miguel Costa",
          role: "Teclados",
          roleEn: "Keyboards",
          roleFr: "Claviers",
          roleEs: "Teclados",
          roleDe: "Keyboards",
          image: "/objects/uploads/a66179e7-c49b-4485-bf62-e4505d6b1104",
          displayOrder: 1,
          isActive: 1,
        },
        {
          name: "David Vieira",
          role: "Bateria",
          roleEn: "Drums",
          roleFr: "Batterie",
          roleEs: "Batería",
          roleDe: "Schlagzeug",
          image: "/objects/uploads/bb95d328-1032-49dd-aa98-3ac7d45ba9bb",
          displayOrder: 3,
          isActive: 1,
        },
        {
          name: "Ruydabass",
          role: "Baixo",
          roleEn: "Bass",
          roleFr: "Basse",
          roleEs: "Bajo",
          roleDe: "Bass",
          image: "/objects/uploads/b4cd97a4-a494-498a-bd39-7b3276f40250",
          displayOrder: 4,
          isActive: 1,
        },
        {
          name: "João Nero",
          role: "Guitarra Ritmo",
          roleEn: "Rhythm Guitar",
          roleFr: "Guitare Rythmique",
          roleEs: "Guitarra Rítmica",
          roleDe: "Rhythmusgitarre",
          image: "/objects/uploads/b6c58d8e-cdbd-481b-b8fb-8bd669169f56",
          displayOrder: 5,
          isActive: 1,
        },
      ]);
    }

    if (needsReseed) {
      await this.setSeedVersion(SEED_VERSION);
      console.log(`Database reseeded to version ${SEED_VERSION}`);
    }
  }

  private async checkSeedVersion(targetVersion: number): Promise<boolean> {
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS seed_meta (key TEXT PRIMARY KEY, value TEXT)`);
      const result = await db.execute(sql`SELECT value FROM seed_meta WHERE key = 'version'`);
      const rows = result.rows as any[];
      if (!rows || rows.length === 0) return true;
      const currentVersion = parseInt(rows[0].value || '0');
      return currentVersion < targetVersion;
    } catch {
      return true;
    }
  }

  private async setSeedVersion(version: number): Promise<void> {
    await db.execute(sql`
      INSERT INTO seed_meta (key, value) VALUES ('version', ${String(version)})
      ON CONFLICT (key) DO UPDATE SET value = ${String(version)};
    `);
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllNews(): Promise<News[]> {
    return db.select().from(news).orderBy(desc(news.publishedAt));
  }

  async getNewsById(id: string): Promise<News | undefined> {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return result[0];
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const result = await db.insert(news).values(insertNews).returning();
    return result[0];
  }

  async updateNews(id: string, updates: Partial<InsertNews>): Promise<News | undefined> {
    const result = await db.update(news).set(updates).where(eq(news.id, id)).returning();
    return result[0];
  }

  async deleteNews(id: string): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id)).returning();
    return result.length > 0;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(insertEvent).returning();
    return result[0];
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  async getAllGallery(): Promise<Gallery[]> {
    return db.select().from(gallery).orderBy(desc(gallery.uploadedAt));
  }

  async getGalleryById(id: string): Promise<Gallery | undefined> {
    const result = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
    return result[0];
  }

  async createGalleryItem(insertGallery: InsertGallery): Promise<Gallery> {
    const result = await db.insert(gallery).values(insertGallery).returning();
    return result[0];
  }

  async updateGalleryItem(id: string, updates: Partial<InsertGallery>): Promise<Gallery | undefined> {
    const result = await db.update(gallery).set(updates).where(eq(gallery.id, id)).returning();
    return result[0];
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id)).returning();
    return result.length > 0;
  }

  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const prefix = insertContact.type;
    const ticketId = `${prefix}_${randomUUID().substring(0, 8).toUpperCase()}`;
    
    const result = await db.insert(contacts).values({
      ...insertContact,
      ticketId,
    }).returning();
    return result[0];
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const result = await db.update(contacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getBiography(): Promise<Biography | undefined> {
    const result = await db.select().from(biography).limit(1);
    return result[0];
  }

  async updateBiography(insertBio: InsertBiography): Promise<Biography> {
    const existing = await this.getBiography();
    if (existing) {
      const result = await db.update(biography)
        .set({ ...insertBio, updatedAt: new Date() })
        .where(eq(biography.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(biography).values(insertBio).returning();
      return result[0];
    }
  }

  async getSpotifySettings(): Promise<SpotifySettings | undefined> {
    const result = await db.select().from(spotifySettings).limit(1);
    return result[0];
  }

  async updateSpotifySettings(insertSettings: InsertSpotifySettings): Promise<SpotifySettings> {
    const existing = await this.getSpotifySettings();
    if (existing) {
      const result = await db.update(spotifySettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(spotifySettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(spotifySettings).values(insertSettings).returning();
      return result[0];
    }
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(insertCat: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCat).returning();
    return result[0];
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(products.name);
  }

  async getActiveProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, 1)).orderBy(desc(products.featured), products.name);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, 1)).orderBy(products.name);
  }

  async createProduct(insertProd: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProd).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    // First delete related order_items
    await db.delete(orderItems).where(eq(orderItems.productId, id));
    // Then delete related comments
    await db.delete(comments).where(and(eq(comments.contentId, id), eq(comments.contentType, 'product')));
    // Finally delete the product
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${randomUUID().substring(0, 6).toUpperCase()}`;
    const result = await db.insert(orders).values({ ...insertOrder, orderNumber }).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  // Order Items
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertItem).returning();
    return result[0];
  }

  // Comments
  async getAllComments(): Promise<Comment[]> {
    return db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getCommentById(id: string): Promise<Comment | undefined> {
    const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return result[0];
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();
    return result[0];
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    const result = await db.update(comments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return result[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  // Band Members
  async getAllBandMembers(): Promise<BandMember[]> {
    return db.select().from(bandMembers).orderBy(bandMembers.displayOrder);
  }

  async getBandMemberById(id: string): Promise<BandMember | undefined> {
    const result = await db.select().from(bandMembers).where(eq(bandMembers.id, id)).limit(1);
    return result[0];
  }

  async createBandMember(insertMember: InsertBandMember): Promise<BandMember> {
    const result = await db.insert(bandMembers).values(insertMember).returning();
    return result[0];
  }

  async updateBandMember(id: string, updates: Partial<InsertBandMember>): Promise<BandMember | undefined> {
    const result = await db.update(bandMembers)
      .set(updates)
      .where(eq(bandMembers.id, id))
      .returning();
    return result[0];
  }

  async deleteBandMember(id: string): Promise<boolean> {
    const result = await db.delete(bandMembers).where(eq(bandMembers.id, id)).returning();
    return result.length > 0;
  }

  // User Profiles (Customer accounts)
  async getAllUserProfiles(): Promise<UserProfile[]> {
    return db.select().from(userProfiles).orderBy(desc(userProfiles.createdAt));
  }

  async getUserProfileById(id: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
    return result[0];
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.email, email)).limit(1);
    return result[0];
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(insertProfile).returning();
    return result[0];
  }

  async updateUserProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const result = await db.update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return result[0];
  }

  async deleteUserProfile(id: string): Promise<boolean> {
    const result = await db.delete(userProfiles).where(eq(userProfiles.id, id)).returning();
    return result.length > 0;
  }

  async incrementUserProfileComments(id: string): Promise<UserProfile | undefined> {
    const profile = await this.getUserProfileById(id);
    if (!profile) return undefined;
    const result = await db.update(userProfiles)
      .set({ totalComments: profile.totalComments + 1, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return result[0];
  }

  async getOrdersByUserProfileId(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createDownloadToken(token: InsertDownloadToken): Promise<DownloadToken> {
    const result = await db.insert(downloadTokens).values(token).returning();
    return result[0];
  }

  async getDownloadTokenByToken(token: string): Promise<DownloadToken | undefined> {
    const result = await db.select().from(downloadTokens).where(eq(downloadTokens.token, token));
    return result[0];
  }

  async getDownloadTokensByOrderItem(orderItemId: string): Promise<DownloadToken[]> {
    return db.select().from(downloadTokens).where(eq(downloadTokens.orderItemId, orderItemId));
  }

  async getDownloadTokensByUser(userId: string): Promise<DownloadToken[]> {
    return db.select().from(downloadTokens).where(eq(downloadTokens.userId, userId)).orderBy(desc(downloadTokens.createdAt));
  }

  async incrementDownloadCount(id: string): Promise<DownloadToken | undefined> {
    const existing = await db.select().from(downloadTokens).where(eq(downloadTokens.id, id));
    if (!existing[0]) return undefined;
    const result = await db.update(downloadTokens)
      .set({ downloadsUsed: existing[0].downloadsUsed + 1 })
      .where(eq(downloadTokens.id, id))
      .returning();
    return result[0];
  }
}

async function initStorage(): Promise<DbStorage> {
  const dbStorage = new DbStorage();
  try {
    await dbStorage.seedData();
  } catch (err) {
    console.error("Error during database seeding (non-fatal):", err);
  }
  return dbStorage;
}

export const storage: IStorage = await initStorage();
