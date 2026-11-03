import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './src/db/index.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const possibleDirs = [
  path.join(__dirname, '../frontend'),
  path.join(__dirname, 'frontend'),
  path.join(process.cwd(), 'frontend'),
  path.join(__dirname, '../public'),
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'public'),
  __dirname,
  path.join(__dirname, '..'),
  process.cwd()
];

const frontendPath = possibleDirs.find(dir => {
  try {
    return fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'));
  } catch {
    return false;
  }
}) || possibleDirs[0];

connectDB();

app.use(cors());
app.use(express.json());

possibleDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    app.use(express.static(dir, { extensions: ['html'] }));
  }
});

app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

const findHtmlFile = (filename) => {
  const cleanName = filename.replace(/\.html$/i, '').toLowerCase();

  for (const dir of possibleDirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir);
      const matched = files.find(f => {
        const fClean = f.replace(/\.html$/i, '').toLowerCase();
        return fClean === cleanName && f.toLowerCase().endsWith('.html');
      });

      if (matched) {
        return path.join(dir, matched);
      }
    } catch {}
  }
  return null;
};

const handleHtmlRoute = (filename) => (req, res) => {
  const filePath = findHtmlFile(filename);
  if (filePath) {
    return res.sendFile(filePath);
  }

  let existing = [];
  try {
    if (fs.existsSync(frontendPath)) {
      existing = fs.readdirSync(frontendPath);
    }
  } catch {}

  res.status(404).send(`File "${filename}" not found. Directory contains: ${existing.join(', ')}`);
};

app.get('/', handleHtmlRoute('index.html'));

app.get('/:page.html', (req, res, next) => {
  const filePath = findHtmlFile(`${req.params.page}.html`);
  if (filePath) {
    return res.sendFile(filePath);
  }
  next();
});

app.get('/:page', (req, res, next) => {
  if (req.params.page.startsWith('api')) return next();
  const filePath = findHtmlFile(`${req.params.page}.html`);
  if (filePath) {
    return res.sendFile(filePath);
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});