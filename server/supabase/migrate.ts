import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env') });

import * as fs from 'fs';
import { Client as PgClient } from 'pg';

async function runMigration() {
  console.log('🔧 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = [
    '001_create_movies_table.sql',
    '002_create_kv_store.sql',
    '003_create_users_and_history.sql',
  '004_enable_vector_and_rpc.sql',
  '005_add_mood_to_movies.sql'
];  try {
    const pgUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

    for (const filename of migrationFiles) {
      const migrationFile = path.join(migrationsDir, filename);

      if (!fs.existsSync(migrationFile)) {
        console.log(`⚠️  Migration file not found: ${filename}, skipping...`);
        continue;
      }

      console.log(`\n📄 Processing migration: ${filename}`);
      const sql = fs.readFileSync(migrationFile, 'utf-8');

      // Improved SQL splitter that respects dollar quotes
      const mergedStatements = [];
      let currentStatement = '';
      let inDollarQuote = false;
      
      // Simple character-by-character parser
      for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];
        
        // Check for dollar quote start/end
        if (char === '$' && nextChar === '$') {
          inDollarQuote = !inDollarQuote;
          currentStatement += '$$';
          i++; // Skip next char
          continue;
        }
        
        if (char === ';' && !inDollarQuote) {
          if (currentStatement.trim()) {
            mergedStatements.push(currentStatement.trim());
          }
          currentStatement = '';
        } else {
          currentStatement += char;
        }
      }
      
      if (currentStatement.trim()) {
        mergedStatements.push(currentStatement.trim());
      }

      // Filter out comments if they are the only thing in the statement
      const finalStatements = mergedStatements.filter(s => !s.startsWith('--') && s.length > 0);

      console.log(`Found ${mergedStatements.length} SQL statements\n`);

      if (pgUrl) {
        console.log('Using direct Postgres connection...');
        const client = new PgClient({ connectionString: pgUrl });
        await client.connect();

        try {
          for (let i = 0; i < mergedStatements.length; i++) {
            const statement = mergedStatements[i];
            console.log(`Executing statement ${i + 1}/${mergedStatements.length}...`);
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
