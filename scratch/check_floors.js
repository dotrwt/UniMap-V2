import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://dotrwt:UniMap%40dotrwt110107@unimap.lsvyahq.mongodb.net/?appName=UniMap';

async function main() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db('UniMap');
    const floors = await db.collection('floors').find({}).toArray();
    console.log('Floors collection:', JSON.stringify(floors, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
