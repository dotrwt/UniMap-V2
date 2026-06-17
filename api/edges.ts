// api/edges.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';

/** GET /api/edges handler. Fetches all edges from the MongoDB collection. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const db = await getDb();
    const edges = await db.collection('edges').find({}, { projection: { _id: 0 } }).toArray();
    res.status(200).json({ data: edges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch edges' });
  }
}
