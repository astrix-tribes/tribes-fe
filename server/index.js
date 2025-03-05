import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import debug from 'debug';
import dotenv from 'dotenv';

import tribesRouter from './routes/tribes.js';
import usersRouter from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const serverDebug = debug('tribes:server');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(join(__dirname, '../dist')));

// API Routes
app.use('/api/tribes', tribesRouter);
app.use('/api/users', usersRouter);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  serverDebug(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  serverDebug(`Server running on port ${port}`);
});

export default app; 