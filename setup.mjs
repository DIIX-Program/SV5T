#!/usr/bin/env node

/**
 * Interactive setup script for SV5T project
 * Run: npm run setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log(`
╔════════════════════════════════════════════════════════════╗
║     SV5T Readiness Evaluator - Interactive Setup           ║
╚════════════════════════════════════════════════════════════╝
`);

// Check if .env exists
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

console.log('📋 Checking project structure...\n');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from template...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env created successfully\n');
  } else {
    console.log('❌ .env.example not found\n');
  }
} else {
  console.log('✅ .env file found\n');
}

// Check required files
const requiredFiles = [
  'package.json',
  'prisma/schema.prisma',
  'server/lib/prisma.ts',
  'server/services/authService.ts',
  'server/middleware/authMiddleware.ts'
];

console.log('📁 Checking required files...\n');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check your project structure.');
  process.exit(1);
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    SETUP COMPLETE                          ║
╚════════════════════════════════════════════════════════════╝

✅ Project structure is valid
✅ All required files are present
✅ .env file is ready

📝 NEXT STEPS:

1️⃣  Update .env with your database connection:
   - Edit .env file
   - Set DATABASE_URL (PostgreSQL connection string)
   
2️⃣  Choose your database:
   
   Option A: PostgreSQL Cloud (RECOMMENDED)
   └─ Neon: https://console.neon.tech
   └─ Supabase: https://supabase.com
   
   Option B: PostgreSQL Local
   └─ Download: https://www.postgresql.org/download/
   └─ Create database manually

3️⃣  Initialize database:
   
   npm run prisma:generate    # Generate Prisma client
   npm run prisma:push        # Create tables & indexes
   npm run prisma:seed        # (Optional) Add test data

4️⃣  Run development servers:
   
   # Terminal 1 - Backend
   npm run server:dev
   
   # Terminal 2 - Frontend
   npm run dev

5️⃣  Test your setup:
   
   Backend:  http://localhost:5000
   Frontend: http://localhost:5173
   Health:   http://localhost:5000/health

📖 For detailed instructions, see:
   - LOCAL_SETUP_GUIDE.md
   - DATABASE_QUICK_START.md
   - POSTGRESQL_MIGRATION_GUIDE.md

🔗 Quick Links:
   API Base: http://localhost:5000
   Frontend: http://localhost:5173
   Prisma Studio: npm run prisma:studio (http://localhost:5555)

════════════════════════════════════════════════════════════
Happy coding! 🚀
════════════════════════════════════════════════════════════
`);
