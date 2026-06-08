import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://dotrwt:UniMap%40dotrwt110107@unimap.lsvyahq.mongodb.net/?appName=UniMap';

async function main() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db('UniMap');
    const types = await db.collection('nodes').distinct('type');
    const categories = await db.collection('nodes').distinct('category');
    console.log('Unique node types:', types);
    console.log('Unique node categories:', categories);

    const matchZyx = await db.collection('nodes').find({
      $or: [
        { id: { $regex: /zyx/i } },
        { name: { $regex: /zyx/i } }
      ]
    }).toArray();
    console.log('Sample of zyx nodes:', matchZyx.map(n => ({ id: n.id, name: n.name, type: n.type })));

    const matchIntersection = await db.collection('nodes').find({
      $or: [
        { id: { $regex: /intersection/i } },
        { name: { $regex: /intersection/i } },
        { type: { $regex: /intersection/i } }
      ]
    }).toArray();
    console.log('Sample of intersection nodes count:', matchIntersection.length);
    console.log('Sample of intersection nodes:', matchIntersection.slice(0, 5).map(n => ({ id: n.id, name: n.name, type: n.type })));

    const allTypesCount = {};
    const allNodes = await db.collection('nodes').find({}).toArray();
    for (const node of allNodes) {
      allTypesCount[node.type] = (allTypesCount[node.type] || 0) + 1;
    }
    console.log('Node counts by type:', allTypesCount);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
