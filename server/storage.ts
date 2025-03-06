import { 
  LexiconEntry, InsertLexiconEntry,
  PhonologyConfig, InsertPhonologyConfig,
  SoundChangeRule, InsertSoundChangeRule,
  User, InsertUser
} from "@shared/schema";

export interface IStorage {
  // User Management
  createUser(user: InsertUser): Promise<User>;
  getUser(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Lexicon
  getLexiconEntries(userId: number): Promise<LexiconEntry[]>;
  getSharedLexiconEntries(userId: number): Promise<LexiconEntry[]>;
  getLexiconEntry(id: number): Promise<LexiconEntry | undefined>;
  createLexiconEntry(entry: InsertLexiconEntry & { createdBy: number }): Promise<LexiconEntry>;
  updateLexiconEntry(id: number, entry: InsertLexiconEntry): Promise<LexiconEntry | undefined>;
  deleteLexiconEntry(id: number): Promise<boolean>;
  shareLexiconEntry(entryId: number, userId: number): Promise<boolean>;
  unshareLeximconEntry(entryId: number, userId: number): Promise<boolean>;

  // Phonology Config
  getPhonologyConfig(userId: number): Promise<PhonologyConfig | undefined>;
  getSharedPhonologyConfigs(userId: number): Promise<PhonologyConfig[]>;
  savePhonologyConfig(config: InsertPhonologyConfig & { createdBy: number }): Promise<PhonologyConfig>;
  sharePhonologyConfig(configId: number, userId: number): Promise<boolean>;
  unsharePhonologyConfig(configId: number, userId: number): Promise<boolean>;

  // Sound Change Rules
  getSoundChangeRules(userId: number): Promise<SoundChangeRule[]>;
  getSharedSoundChangeRules(userId: number): Promise<SoundChangeRule[]>;
  createSoundChangeRule(rule: InsertSoundChangeRule & { createdBy: number }): Promise<SoundChangeRule>;
  deleteSoundChangeRule(id: number): Promise<boolean>;
  shareSoundChangeRule(ruleId: number, userId: number): Promise<boolean>;
  unshareSoundChangeRule(ruleId: number, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lexicon: Map<number, LexiconEntry>;
  private phonologyConfigs: Map<number, PhonologyConfig>;
  private soundChangeRules: Map<number, SoundChangeRule>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.lexicon = new Map();
    this.phonologyConfigs = new Map();
    this.soundChangeRules = new Map();
    this.currentId = 1;
  }

  // User Management
  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUser(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Lexicon
  async getLexiconEntries(userId: number): Promise<LexiconEntry[]> {
    return Array.from(this.lexicon.values()).filter(
      entry => entry.createdBy === userId || entry.sharedWith.includes(userId.toString())
    );
  }

  async getSharedLexiconEntries(userId: number): Promise<LexiconEntry[]> {
    return Array.from(this.lexicon.values()).filter(
      entry => entry.sharedWith.includes(userId.toString())
    );
  }

  async getLexiconEntry(id: number): Promise<LexiconEntry | undefined> {
    return this.lexicon.get(id);
  }

  async createLexiconEntry(entry: InsertLexiconEntry & { createdBy: number }): Promise<LexiconEntry> {
    const id = this.currentId++;
    const newEntry = { ...entry, id, notes: entry.notes || "", sharedWith: [] };
    this.lexicon.set(id, newEntry);
    return newEntry;
  }

  async updateLexiconEntry(id: number, entry: InsertLexiconEntry): Promise<LexiconEntry | undefined> {
    if (!this.lexicon.has(id)) return undefined;
    const current = this.lexicon.get(id)!;
    const updatedEntry = { ...entry, id, notes: entry.notes || "", sharedWith: current.sharedWith };
    this.lexicon.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteLexiconEntry(id: number): Promise<boolean> {
    return this.lexicon.delete(id);
  }

  async shareLexiconEntry(entryId: number, userId: number): Promise<boolean> {
    const entry = this.lexicon.get(entryId);
    if (!entry) return false;
    if (!entry.sharedWith.includes(userId.toString())) {
      entry.sharedWith.push(userId.toString());
      this.lexicon.set(entryId, entry);
    }
    return true;
  }

  async unshareLeximconEntry(entryId: number, userId: number): Promise<boolean> {
    const entry = this.lexicon.get(entryId);
    if (!entry) return false;
    entry.sharedWith = entry.sharedWith.filter(id => id !== userId.toString());
    this.lexicon.set(entryId, entry);
    return true;
  }

  // Phonology Config
  async getPhonologyConfig(userId: number): Promise<PhonologyConfig | undefined> {
    return Array.from(this.phonologyConfigs.values()).find(
      config => config.createdBy === userId || config.sharedWith.includes(userId.toString())
    );
  }

  async getSharedPhonologyConfigs(userId: number): Promise<PhonologyConfig[]> {
    return Array.from(this.phonologyConfigs.values()).filter(
      config => config.sharedWith.includes(userId.toString())
    );
  }

  async savePhonologyConfig(config: InsertPhonologyConfig & { createdBy: number }): Promise<PhonologyConfig> {
    const id = this.currentId++;
    const newConfig = { ...config, id, sharedWith: [] };
    this.phonologyConfigs.set(id, newConfig);
    return newConfig;
  }

  async sharePhonologyConfig(configId: number, userId: number): Promise<boolean> {
    const config = this.phonologyConfigs.get(configId);
    if (!config) return false;
    if (!config.sharedWith.includes(userId.toString())) {
      config.sharedWith.push(userId.toString());
      this.phonologyConfigs.set(configId, config);
    }
    return true;
  }

  async unsharePhonologyConfig(configId: number, userId: number): Promise<boolean> {
    const config = this.phonologyConfigs.get(configId);
    if (!config) return false;
    config.sharedWith = config.sharedWith.filter(id => id !== userId.toString());
    this.phonologyConfigs.set(configId, config);
    return true;
  }

  // Sound Change Rules
  async getSoundChangeRules(userId: number): Promise<SoundChangeRule[]> {
    return Array.from(this.soundChangeRules.values()).filter(
      rule => rule.createdBy === userId || rule.sharedWith.includes(userId.toString())
    );
  }

  async getSharedSoundChangeRules(userId: number): Promise<SoundChangeRule[]> {
    return Array.from(this.soundChangeRules.values()).filter(
      rule => rule.sharedWith.includes(userId.toString())
    );
  }

  async createSoundChangeRule(rule: InsertSoundChangeRule & { createdBy: number }): Promise<SoundChangeRule> {
    const id = this.currentId++;
    const newRule = { ...rule, id, sharedWith: [] };
    this.soundChangeRules.set(id, newRule);
    return newRule;
  }

  async deleteSoundChangeRule(id: number): Promise<boolean> {
    return this.soundChangeRules.delete(id);
  }

  async shareSoundChangeRule(ruleId: number, userId: number): Promise<boolean> {
    const rule = this.soundChangeRules.get(ruleId);
    if (!rule) return false;
    if (!rule.sharedWith.includes(userId.toString())) {
      rule.sharedWith.push(userId.toString());
      this.soundChangeRules.set(ruleId, rule);
    }
    return true;
  }

  async unshareSoundChangeRule(ruleId: number, userId: number): Promise<boolean> {
    const rule = this.soundChangeRules.get(ruleId);
    if (!rule) return false;
    rule.sharedWith = rule.sharedWith.filter(id => id !== userId.toString());
    this.soundChangeRules.set(ruleId, rule);
    return true;
  }
}

export const storage = new MemStorage();