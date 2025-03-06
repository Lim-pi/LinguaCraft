import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const lexiconEntries = pgTable("lexicon_entries", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  category: text("category").notNull(),
  notes: text("notes").default(""),
  createdBy: text("created_by").references(() => users.id).notNull(),
  sharedWith: text("shared_with").array().default([]),
});

export const insertLexiconEntrySchema = createInsertSchema(lexiconEntries);

export const phonologyConfig = pgTable("phonology_config", {
  id: serial("id").primaryKey(),
  consonants: text("consonants").array().notNull(),
  vowels: text("vowels").array().notNull(),
  syllablePatterns: text("syllable_patterns").array().notNull(),
  createdBy: text("created_by").references(() => users.id).notNull(),
  sharedWith: text("shared_with").array().default([]),
});

export const insertPhonologyConfigSchema = createInsertSchema(phonologyConfig).pick({
  consonants: true,
  vowels: true,
  syllablePatterns: true,
});

export const soundChangeRules = pgTable("sound_change_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rules: text("rules").array().notNull(),
  createdBy: text("created_by").references(() => users.id).notNull(),
  sharedWith: text("shared_with").array().default([]),
});

export const insertSoundChangeRuleSchema = createInsertSchema(soundChangeRules).pick({
  name: true,
  rules: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LexiconEntry = typeof lexiconEntries.$inferSelect;
export type InsertLexiconEntry = z.infer<typeof insertLexiconEntrySchema>;

export type PhonologyConfig = typeof phonologyConfig.$inferSelect;
export type InsertPhonologyConfig = z.infer<typeof insertPhonologyConfigSchema>;

export type SoundChangeRule = typeof soundChangeRules.$inferSelect;
export type InsertSoundChangeRule = z.infer<typeof insertSoundChangeRuleSchema>;