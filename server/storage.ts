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
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
    const existingBio = await db.select().from(biography).limit(1);
    if (existingBio.length === 0) {
      await db.insert(biography).values({
        content: "Snowman é uma banda de rock progressivo portuguesa formada em Lisboa. Com uma abordagem única que combina complexidade rítmica, atmosferas envolventes e uma energia vibrante, a banda tem conquistado palcos e corações por todo o país.",
        contentEn: "Snowman is a Portuguese progressive rock band formed in Lisbon. With a unique approach that combines rhythmic complexity, immersive atmospheres and vibrant energy, the band has been conquering stages and hearts across the country.",
      });
    }

    const existingSpotify = await db.select().from(spotifySettings).limit(1);
    if (existingSpotify.length === 0) {
      await db.insert(spotifySettings).values({
        embedUrl: "https://open.spotify.com/embed/album/7MXVkk9YMctZqd1Srtv4MB",
        displayType: "player",
        isActive: 1,
      });
    }

    const existingNews = await db.select().from(news).limit(1);
    if (existingNews.length === 0) {
      await db.insert(news).values([
        {
          title: "Novo Álbum 'Horizons' Lançado",
          titleEn: "New Album 'Horizons' Released",
          content: "Estamos muito felizes em anunciar o lançamento do nosso novo álbum 'Horizons'. Este trabalho representa uma nova direção sonora para a banda, explorando territórios mais experimentais.",
          contentEn: "We are thrilled to announce the release of our new album 'Horizons'. This work represents a new sonic direction for the band, exploring more experimental territories.",
          images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
          publishedAt: new Date(),
          featured: 1,
        },
        {
          title: "Tour Europeia Anunciada",
          titleEn: "European Tour Announced",
          content: "A Snowman anuncia a sua primeira tour europeia! Vamos passar por várias cidades icónicas apresentando o novo álbum 'Horizons' ao vivo.",
          contentEn: "Snowman announces its first European tour! We'll be visiting several iconic cities presenting the new album 'Horizons' live.",
          images: ["https://images.unsplash.com/photo-1540039155733-5fca0d5f428e?w=800&q=80"],
          publishedAt: new Date(),
          featured: 0,
        },
        {
          title: "Entrevista na Rock Magazine",
          titleEn: "Interview in Rock Magazine",
          content: "Confira a nossa entrevista exclusiva na Rock Magazine onde falamos sobre o processo criativo por trás do novo álbum e os desafios de ser uma banda de prog rock em Portugal.",
          contentEn: "Check out our exclusive interview in Rock Magazine where we talk about the creative process behind the new album and the challenges of being a prog rock band in Portugal.",
          images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80"],
          publishedAt: new Date(),
          featured: 0,
        },
      ]);
    }

    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        {
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
      ]);
    }

    const existingGallery = await db.select().from(gallery).limit(1);
    if (existingGallery.length === 0) {
      await db.insert(gallery).values([
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
          caption: 'Live in Lisbon 2024',
          captionEn: 'Live in Lisbon 2024',
        },
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
          caption: 'Studio Session',
          captionEn: 'Studio Session',
        },
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
          caption: 'Backstage Moments',
          captionEn: 'Backstage Moments',
        },
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80',
          caption: 'Album Recording',
          captionEn: 'Album Recording',
        },
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
          caption: 'Concert Night',
          captionEn: 'Concert Night',
        },
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
          caption: 'On Tour',
          captionEn: 'On Tour',
        },
      ]);
    }

    // E-commerce seed data
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
      const merchCategory = await db.select().from(categories).where(eq(categories.slug, 'merch')).limit(1);
      
      const discografiaId = discografiaCategory[0]?.id;
      const merchId = merchCategory[0]?.id;

      if (discografiaId && merchId) {
        await db.insert(products).values([
          {
            name: "Horizons - Álbum Digital",
            nameEn: "Horizons - Digital Album",
            description: "Álbum completo 'Horizons' em formato digital. Inclui 10 faixas originais.",
            descriptionEn: "Complete 'Horizons' album in digital format. Includes 10 original tracks.",
            price: 999, // €9.99
            type: "digital",
            categoryId: discografiaId,
            images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
            stock: 0,
            downloadUrl: "https://example.com/download/horizons",
            isActive: 1,
            featured: 1,
          },
          {
            name: "Horizons - CD Físico",
            nameEn: "Horizons - Physical CD",
            description: "CD físico do álbum 'Horizons' com encarte deluxe de 16 páginas.",
            descriptionEn: "Physical CD of 'Horizons' album with 16-page deluxe booklet.",
            price: 1499, // €14.99
            type: "physical",
            categoryId: discografiaId,
            images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
            stock: 50,
            downloadUrl: null,
            isActive: 1,
            featured: 1,
          },
          {
            name: "Horizons - Vinil Limitado",
            nameEn: "Horizons - Limited Vinyl",
            description: "Edição limitada em vinil de 180g. Apenas 300 cópias numeradas.",
            descriptionEn: "Limited edition 180g vinyl. Only 300 numbered copies.",
            price: 2999, // €29.99
            type: "physical",
            categoryId: discografiaId,
            images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
            stock: 25,
            downloadUrl: null,
            isActive: 1,
            featured: 1,
          },
          {
            name: "T-Shirt Oficial Snowman",
            nameEn: "Official Snowman T-Shirt",
            description: "Camiseta 100% algodão com logo da banda. Disponível em várias cores.",
            descriptionEn: "100% cotton t-shirt with band logo. Available in multiple colors.",
            price: 1999, // €19.99
            type: "physical",
            categoryId: merchId,
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
            stock: 100,
            downloadUrl: null,
            isActive: 1,
            featured: 0,
          },
          {
            name: "Poster Tour 2024",
            nameEn: "2024 Tour Poster",
            description: "Poster oficial da Tour Europeia 2024. Tamanho A2 (42x59cm).",
            descriptionEn: "Official 2024 European Tour poster. A2 size (42x59cm).",
            price: 899, // €8.99
            type: "physical",
            categoryId: merchId,
            images: ["https://images.unsplash.com/photo-1611171711912-e0e5a28d1d49?w=800&q=80"],
            stock: 75,
            downloadUrl: null,
            isActive: 1,
            featured: 0,
          },
        ]);
      }
    }
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
  await dbStorage.seedData();
  return dbStorage;
}

export const storage: IStorage = await initStorage();
