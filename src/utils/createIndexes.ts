import mongoose from 'mongoose';

/**
 * Create database indexes for performance optimization
 * This function should be called after all models are registered
 */
export const createDatabaseIndexes = async (): Promise<void> => {
  try {
    console.log('🔍 Creating database indexes...');

    // Get all registered models
    const models = mongoose.modelNames();

    // Create indexes for each model
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      await model.createIndexes();
      console.log(`✅ Indexes created for ${modelName}`);
    }

    console.log('✅ All database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
};

/**
 * Drop all indexes (useful for development/testing)
 */
export const dropDatabaseIndexes = async (): Promise<void> => {
  try {
    console.log('🗑️  Dropping database indexes...');

    const models = mongoose.modelNames();

    for (const modelName of models) {
      const model = mongoose.model(modelName);
      const collection = model.collection;
      await collection.dropIndexes();
      console.log(`✅ Indexes dropped for ${modelName}`);
    }

    console.log('✅ All database indexes dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping database indexes:', error);
    throw error;
  }
};

/**
 * List all indexes for a specific collection
 */
export const listCollectionIndexes = async (collectionName: string): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    
    console.log(`📋 Indexes for ${collectionName}:`);
    console.log(JSON.stringify(indexes, null, 2));
  } catch (error) {
    console.error(`❌ Error listing indexes for ${collectionName}:`, error);
    throw error;
  }
};
