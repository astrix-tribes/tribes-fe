import { PrismaClient } from '@prisma/client';
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dbDebug = debug('tribes:database');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to certificate
const CA_CERT_PATH = process.env.CA_CERT_PATH || path.join(__dirname, '../ssl/ca.pem');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    const datasourceUrl = process.env.DATABASE_URL;
    
    if (!datasourceUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // For Aiven PostgreSQL, we need to ensure SSL is enabled
    const url = new URL(datasourceUrl);
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }

    const prismaOptions = {
      datasources: {
        db: {
          url: url.toString()
        }
      }
    };

    // Check if SSL certificate is needed and exists
    if (url.searchParams.get('sslmode') === 'require' || url.searchParams.get('sslmode') === 'verify-ca') {
      if (fs.existsSync(CA_CERT_PATH)) {
        dbDebug(`Using SSL certificate at ${CA_CERT_PATH}`);
        const modifiedUrl = new URL(url.toString());
        modifiedUrl.searchParams.set('sslcert', CA_CERT_PATH);
        prismaOptions.datasources.db.url = modifiedUrl.toString();
      }
    }

    prisma = new PrismaClient(prismaOptions);

    // Add logging only in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        dbDebug('Query: %s', e.query);
      });
    }
  }
  return prisma;
}

export function getPrisma() {
  return getPrismaClient();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
}); 