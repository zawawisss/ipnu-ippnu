const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function importJsonToDb() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const jsonDir = path.join(__dirname, '../output');
    const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(jsonDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const collectionName = path.basename(file, '.json');

      console.log(`🔄 Importing ${file} into collection: ${collectionName}`);

      // This is a generic approach. For specific schemas, you'd use the model directly.
      const collection = mongoose.connection.collection(collectionName);
      
      // Clear existing data before import
      await collection.deleteMany({}); 
      await collection.insertMany(data);

      console.log(`✅ Successfully imported ${data.length} documents into ${collectionName}`);
    }

  } catch (error) {
    console.error('💥 An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

importJsonToDb();
