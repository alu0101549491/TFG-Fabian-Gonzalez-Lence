/**
 * Drop and recreate database schema (development only)
 */
import 'dotenv/config';
import {AppDataSource} from './data-source';

async function resetDatabase(): Promise<void> {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Database reset only allowed in development mode');
    }

    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    
    console.log('🗑️  Dropping existing schema...');
    await AppDataSource.dropDatabase();
    
    console.log('✨ Creating fresh schema...');
    await AppDataSource.synchronize();
    
    console.log('✅ Database reset complete!');
    console.log('💡 Run `npm run db:seed` to populate with test data');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

void resetDatabase();
