import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertLexiconEntrySchema, insertPhonologyConfigSchema, insertSoundChangeRuleSchema } from "@shared/schema";
import { requireAuth } from "./auth";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Lexicon Routes
  app.get("/api/lexicon", requireAuth, async (req, res) => {
    const entries = await storage.getLexiconEntries(req.user!.id);
    res.json(entries);
  });

  app.post("/api/lexicon", requireAuth, async (req, res) => {
    const parsed = insertLexiconEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid entry data" });
    }
    const entry = await storage.createLexiconEntry({
      ...parsed.data,
      createdBy: req.user!.id
    });
    res.json(entry);
  });

  app.put("/api/lexicon/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertLexiconEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid entry data" });
    }
    const entry = await storage.updateLexiconEntry(id, parsed.data);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json(entry);
  });

  app.delete("/api/lexicon/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteLexiconEntry(id);
    if (!success) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json({ success: true });
  });

  // Phonology Config Routes
  app.get("/api/phonology", requireAuth, async (req, res) => {
    const config = await storage.getPhonologyConfig(req.user!.id);
    res.json(config || {});
  });

  app.post("/api/phonology", requireAuth, async (req, res) => {
    const parsed = insertPhonologyConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid config data" });
    }
    const config = await storage.savePhonologyConfig({
      ...parsed.data,
      createdBy: req.user!.id
    });
    res.json(config);
  });

  // Sound Change Rules Routes
  app.get("/api/sound-rules", requireAuth, async (req, res) => {
    const rules = await storage.getSoundChangeRules(req.user!.id);
    res.json(rules);
  });

  app.post("/api/sound-rules", requireAuth, async (req, res) => {
    const parsed = insertSoundChangeRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid rule data" });
    }
    const rule = await storage.createSoundChangeRule({
      ...parsed.data,
      createdBy: req.user!.id
    });
    res.json(rule);
  });

  app.delete("/api/sound-rules/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteSoundChangeRule(id);
    if (!success) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}