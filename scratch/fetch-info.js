import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://dotrwt:UniMap%40dotrwt110107@unimap.lsvyahq.mongodb.net/?appName=UniMap';
const client = new MongoClient(mongoUrl);

async function run() {
  try {
    await client.connect();
    const db = client.db('UniMap');
    const nodes = await db.collection('nodes').find({}).toArray();
    const mapGroups = {};
    
    nodes.forEach(n => {
      if (n.name && n.name.trim() !== '' && n.type !== 'corridor' && n.type !== 'intersection') {
        if (!mapGroups[n.map]) {
          mapGroups[n.map] = [];
        }
        mapGroups[n.map].push(n.name);
      }
    });
    
    for (const [map, names] of Object.entries(mapGroups)) {
      console.log(`\nMap: ${map} (${names.length} named nodes)`);
      console.log(names.slice(0, 10).map(n => `  - ${n}`).join('\n'));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
