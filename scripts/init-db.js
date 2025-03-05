import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Ensure .env file exists
const envPath = join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found. Please create one first.');
  process.exit(1);
}

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migrations
  console.log('\nRunning database migrations...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });

  console.log('\nDatabase initialization completed successfully!');
} catch (error) {
  console.error('Error initializing database:', error.message);
  process.exit(1);
} 