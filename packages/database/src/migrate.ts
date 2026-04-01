import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is not set');
  }

  console.log('🔄 Running migrations...');
  console.log('📡 Connecting to Supabase PostgreSQL...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: './migrations' });
  console.log('✅ Migrations completed!');

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
