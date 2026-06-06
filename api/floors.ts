// api/floors.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';

/** GET /api/floors handler. Fetches all floors from the MongoDB collection. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const db = await getDb();
    const floors = await db.collection('floors').find({}, { projection: { _id: 0 } }).toArray();
    res.status(200).json({ data: floors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floors' });
  }
}
