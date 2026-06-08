import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://dotrwt:UniMap%40dotrwt110107@unimap.lsvyahq.mongodb.net/?appName=UniMap';

async function main() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db('UniMap');
    const nodes = await db.collection('nodes').find({
      type: { $in: ['room', 'gate', 'entry'] }
    }).toArray();

    const matched = nodes.filter(node => {
      const name = (node.name || '').toLowerCase();
      const id = (node.id || '').toLowerCase();
      return name.includes('node') || id.includes('node') ||
             name.includes('zyx') || id.includes('zyx') ||
             name.includes('intersection') || id.includes('intersection') ||
             name.includes('corridor') || id.includes('corridor');
    });

    console.log(`Matched ${matched.length} rooms/gates/entries with excluded terms:`);
    console.log(matched.map(n => ({ id: n.id, name: n.name, type: n.type })));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
