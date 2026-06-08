import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://dotrwt:UniMap%40dotrwt110107@unimap.lsvyahq.mongodb.net/?appName=UniMap';

async function main() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db('UniMap');
    const maps = await db.collection('nodes').distinct('map');
    console.log('Unique map ids in nodes collection:', maps);
    
    const count = await db.collection('nodes').countDocuments();
    console.log('Total nodes count:', count);

    const firstFew = await db.collection('nodes').find({}).limit(5).toArray();
    console.log('Sample nodes:', JSON.stringify(firstFew, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
