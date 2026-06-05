// api/_db.ts
import { MongoClient, Db } from 'mongodb';

const mongoUrl = process.env.MONGO_URL;

let client: MongoClient | null = null;

/** Returns a connected MongoDB database instance, caching the client across invocations. */
export async function getDb(dbName = 'unimap'): Promise<Db> {
  if (!mongoUrl) {
    throw new Error('MONGO_URL is not set');
  }

  if (!client) {
    client = new MongoClient(mongoUrl);
    await client.connect();
  }

  return client.db(dbName);
}
