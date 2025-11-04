import database from '../config/database';
import { seedAdhkar } from '../utils/seedAdhkar';

/**
 * Seed script to populate initial data
 */
const runSeed = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to database');

    // Seed adhkar
    await seedAdhkar();

    console.log('✅ Database seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  }
};

// Run the seed
runSeed();
