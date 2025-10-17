import {
  type User,
  type InsertUser,
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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  deleteGalleryItem(id: string): Promise<boolean>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContactStatus(id: string, status: string): Promise<Contact | undefined>;

  // Biography
  getBiography(): Promise<Biography | undefined>;
  updateBiography(bio: InsertBiography): Promise<Biography>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private news: Map<string, News>;
  private events: Map<string, Event>;
  private gallery: Map<string, Gallery>;
  private contacts: Map<string, Contact>;
  private biography: Biography | undefined;

  constructor() {
    this.users = new Map();
    this.news = new Map();
    this.events = new Map();
    this.gallery = new Map();
    this.contacts = new Map();
    this.biography = undefined;

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

    const sampleNews: News[] = [
      {
        id: randomUUID(),
        title: "Novo Álbum 'Horizons' Lançado",
        titleEn: "New Album 'Horizons' Released",
        content: "Estamos muito felizes em anunciar o lançamento do nosso novo álbum 'Horizons'. Este trabalho representa uma nova direção sonora para a banda, explorando territórios mais experimentais.",
        contentEn: "We are thrilled to announce the release of our new album 'Horizons'. This work represents a new sonic direction for the band, exploring more experimental territories.",
        images: ["https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80"],
        publishedAt: new Date('2024-01-15'),
        featured: 1,
      },
      {
        id: randomUUID(),
        title: "Tour Europeia Anunciada",
        titleEn: "European Tour Announced",
        content: "A Snowman anuncia a sua primeira tour europeia! Vamos passar por várias cidades icónicas apresentando o novo álbum 'Horizons' ao vivo.",
        contentEn: "Snowman announces its first European tour! We'll be visiting several iconic cities presenting the new album 'Horizons' live.",
        images: ["https://images.unsplash.com/photo-1540039155733-5fca0d5f428e?w=800&q=80"],
        publishedAt: new Date('2024-02-01'),
        featured: 0,
      },
      {
        id: randomUUID(),
        title: "Entrevista na Rock Magazine",
        titleEn: "Interview in Rock Magazine",
        content: "Confira a nossa entrevista exclusiva na Rock Magazine onde falamos sobre o processo criativo por trás do novo álbum e os desafios de ser uma banda de prog rock em Portugal.",
        contentEn: "Check out our exclusive interview in Rock Magazine where we talk about the creative process behind the new album and the challenges of being a prog rock band in Portugal.",
        images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80"],
        publishedAt: new Date('2024-02-10'),
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
        caption: 'Live in Lisbon 2024',
        captionEn: 'Live in Lisbon 2024',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
        caption: 'Studio Session',
        captionEn: 'Studio Session',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        caption: 'Backstage Moments',
        captionEn: 'Backstage Moments',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80',
        caption: 'Album Recording',
        captionEn: 'Album Recording',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        caption: 'Concert Night',
        captionEn: 'Concert Night',
        uploadedAt: new Date(),
      },
      {
        id: randomUUID(),
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
        caption: 'On Tour',
        captionEn: 'On Tour',
        uploadedAt: new Date(),
      },
    ];

    sampleGallery.forEach(item => this.gallery.set(item.id, item));
  }

  // Users
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
