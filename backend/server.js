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

const frontendPath = path.join(__dirname, '../frontend');

connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static(frontendPath, { extensions: ['html'] }));

app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

const serveHtml = (filename) => (req, res) => {
  const directPath = path.join(frontendPath, filename);
  if (fs.existsSync(directPath)) {
    return res.sendFile(directPath);
  }

  const lowerPath = path.join(frontendPath, filename.toLowerCase());
  if (fs.existsSync(lowerPath)) {
    return res.sendFile(lowerPath);
  }

  res.status(404).send(`Cannot GET ${req.originalUrl}`);
};

app.get('/', serveHtml('index.html'));
app.get('/index', serveHtml('index.html'));
app.get('/index.html', serveHtml('index.html'));

app.get('/repair', serveHtml('repair.html'));
app.get('/repair.html', serveHtml('repair.html'));

app.get('/repairCategory', serveHtml('repairCategory.html'));
app.get('/repairCategory.html', serveHtml('repairCategory.html'));
app.get('/repaircategory', serveHtml('repairCategory.html'));
app.get('/repaircategory.html', serveHtml('repairCategory.html'));

app.get('/repairModel', serveHtml('repairModel.html'));
app.get('/repairModel.html', serveHtml('repairModel.html'));
app.get('/repairmodel', serveHtml('repairModel.html'));
app.get('/repairmodel.html', serveHtml('repairModel.html'));

app.get('/category', serveHtml('category.html'));
app.get('/category.html', serveHtml('category.html'));

app.get('/CashBack', serveHtml('CashBack.html'));
app.get('/CashBack.html', serveHtml('CashBack.html'));
app.get('/cashback', serveHtml('CashBack.html'));
app.get('/cashback.html', serveHtml('CashBack.html'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});