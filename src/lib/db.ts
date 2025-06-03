import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // I utvikling, bruk en global variabel for å bevare tilkoblingen
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // I produksjon, opprett ny tilkobling
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Hjelpefunksjon for å få tak i databaseinstansen
export async function getDb() {
  const client = await clientPromise;
  return client.db('fargeleggingsapp'); // Eksplisitt angi databasenavn
} 