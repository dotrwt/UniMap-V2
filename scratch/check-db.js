// scratch/check-db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      }
    });
  }
}

loadEnv();

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  console.log('Connecting to:', mongoUrl);
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db('UniMap');
    
    // List databases
    const adminDb = client.db().admin();
    const dbsList = await adminDb.listDatabases();
    console.log('All Databases:', dbsList.databases.map(d => d.name));

    const collections = await db.listCollections().toArray();
    console.log('Collections in "UniMap":', collections.map(c => c.name));

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- Collection "${col.name}" has ${count} documents`);
      if (col.name === 'maps') {
        const samples = await db.collection(col.name).find().toArray();
        console.log('All Map Documents:', samples);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
