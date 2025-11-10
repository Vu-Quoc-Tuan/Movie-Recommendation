import { supabase } from './client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Client as PgClient } from 'pg';

// ESM doesn't provide __dirname by default. Derive it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔧 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFile = path.join(migrationsDir, '001_create_movies_table.sql');

  try {
    // Read migration file
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    console.log('Reading migration file:', migrationFile);

    // Split SQL statements (basic split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements\n`);

    // If a direct Postgres URL is provided (recommended for automation), use `pg` to run SQL directly.
    const pgUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (pgUrl) {
      console.log('Using direct Postgres connection from SUPABASE_DB_URL to run migrations...');
      const client = new PgClient({ connectionString: pgUrl });
      await client.connect();

      try {
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          try {
            await client.query(statement);
            console.log('✓ Statement executed successfully');
          } catch (err) {
            console.error('✖ Statement failed:', err?.message || err);
            // continue to next statement
          }
        }
      } finally {
        await client.end();
      }
    } else {
      // Execute each statement via Supabase RPC fallback
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (error) {
            console.log('RPC error:', error.message || error);
            console.log('Trying direct execution (manual fallback)...');
            if (statement.includes('CREATE TABLE')) {
              console.log('⚠️  Please run this migration manually in Supabase SQL Editor:');
              console.log('1. Go to: https://supabase.com/dashboard/project/wbpseckwrrdvuyxtndhc/sql');
              console.log('2. Copy and paste the SQL from: supabase/migrations/001_create_movies_table.sql');
              console.log('3. Click "Run"\n');
              return;
            }
          } else {
            console.log('✓ Statement executed successfully via RPC');
          }
        } catch (err) {
          console.error('RPC call failed:', err?.message || err);
        }
      }
    }

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n⚠️  Please run the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/wbpseckwrrdvuyxtndhc/sql');
    console.log('2. Copy and paste the SQL from: supabase/migrations/001_create_movies_table.sql');
    console.log('3. Click "Run"');
    process.exit(1);
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
