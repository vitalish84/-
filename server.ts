import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const HOMEOWNERS_FILE = path.join(DATA_DIR, 'homeowners.json');
const REQUIREMENTS_FILE = path.join(DATA_DIR, 'requirements.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(HOMEOWNERS_FILE)) fs.writeFileSync(HOMEOWNERS_FILE, '[]');
if (!fs.existsSync(REQUIREMENTS_FILE)) fs.writeFileSync(REQUIREMENTS_FILE, '[]');

function readJSON<T>(file: string): T[] {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function writeJSON(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

// ── Homeowners ───────────────────────────────────────────────────────────────

app.get('/api/homeowners', (_req, res) => {
  res.json(readJSON(HOMEOWNERS_FILE));
});

app.post('/api/homeowners', (req, res) => {
  const homeowners = readJSON<any>(HOMEOWNERS_FILE);
  const { id, name, apartment, building, phone } = req.body;

  if (!name?.trim() || !apartment?.trim()) {
    return res.status(400).json({ error: 'שם ומספר דירה נדרשים' });
  }

  const idx = homeowners.findIndex((h: any) => h.id === id);
  const now = new Date().toISOString();
  const homeowner = {
    id: id || `h_${Date.now()}`,
    name: name.trim(),
    apartment: apartment.trim(),
    building: building?.trim() || '',
    phone: phone?.trim() || '',
    createdAt: idx >= 0 ? homeowners[idx].createdAt : now,
    updatedAt: now,
  };

  if (idx >= 0) homeowners[idx] = homeowner;
  else homeowners.push(homeowner);

  writeJSON(HOMEOWNERS_FILE, homeowners);
  res.json(homeowner);
});

app.delete('/api/homeowners/:id', (req, res) => {
  const homeowners = readJSON<any>(HOMEOWNERS_FILE).filter((h: any) => h.id !== req.params.id);
  writeJSON(HOMEOWNERS_FILE, homeowners);
  const requirements = readJSON<any>(REQUIREMENTS_FILE).filter((r: any) => r.homeownerId !== req.params.id);
  writeJSON(REQUIREMENTS_FILE, requirements);
  res.json({ success: true });
});

// ── Requirements ─────────────────────────────────────────────────────────────

app.get('/api/requirements/:homeownerId', (req, res) => {
  const found = readJSON<any>(REQUIREMENTS_FILE).find((r: any) => r.homeownerId === req.params.homeownerId);
  res.json(found || null);
});

app.post('/api/requirements', (req, res) => {
  const requirements = readJSON<any>(REQUIREMENTS_FILE);
  const { homeownerId, categories } = req.body;

  if (!homeownerId) return res.status(400).json({ error: 'homeownerId נדרש' });

  const idx = requirements.findIndex((r: any) => r.homeownerId === homeownerId);
  const requirement = { homeownerId, categories: categories || {}, updatedAt: new Date().toISOString() };

  if (idx >= 0) requirements[idx] = requirement;
  else requirements.push(requirement);

  writeJSON(REQUIREMENTS_FILE, requirements);
  res.json(requirement);
});

// ── Dashboard ────────────────────────────────────────────────────────────────

app.get('/api/dashboard', (_req, res) => {
  const homeowners = readJSON<any>(HOMEOWNERS_FILE);
  const requirements = readJSON<any>(REQUIREMENTS_FILE);
  const data = homeowners.map((h: any) => ({
    ...h,
    requirements: requirements.find((r: any) => r.homeownerId === h.id) || null,
  }));
  res.json(data);
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
