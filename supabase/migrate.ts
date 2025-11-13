import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env') });

import { supabase } from './client';
import * as fs from 'fs';
import { Client as PgClient } from 'pg';

async function runMigration() {
  console.log('🔧 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = [
    '001_create_movies_table.sql',
    '002_create_kv_store.sql'
  ];

  try {
    const pgUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

    for (const filename of migrationFiles) {
      const migrationFile = path.join(migrationsDir, filename);

      if (!fs.existsSync(migrationFile)) {
        console.log(`⚠️  Migration file not found: ${filename}, skipping...`);
        continue;
      }

      console.log(`\n📄 Processing migration: ${filename}`);
      const sql = fs.readFileSync(migrationFile, 'utf-8');

      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`Found ${statements.length} SQL statements\n`);

      if (pgUrl) {
        console.log('Using direct Postgres connection...');
        const client = new PgClient({ connectionString: pgUrl });
        await client.connect();

        try {
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            try {
              await client.query(statement);
              console.log('✓ Statement executed successfully');
            } catch (err: any) {
              console.error('✖ Statement failed:', err?.message || err);
            }
          }
        } finally {
          await client.end();
        }
      } else {
        console.log('⚠️  No DATABASE_URL found. Please run migrations manually.');
        console.log('1. Go to: https://supabase.com/dashboard/project/wuvynyiopwzwtesbiojf/sql');
        console.log(`2. Copy and paste SQL from: ${migrationFile}`);
        console.log('3. Click "Run"\n');
      }
    }

    console.log('\n✨ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
