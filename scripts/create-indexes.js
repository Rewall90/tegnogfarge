const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI er ikke definert i miljøvariablene');
    process.exit(1);
  }

  // Konfigurer MongoClient med SSL-alternativer
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true  // Kun for feilsøking, ikke bruk i produksjon
  };

  const client = new MongoClient(uri, options);

  try {
    console.log('Forsøker å koble til MongoDB...');
    await client.connect();
    console.log('Koblet til MongoDB');

    const db = client.db();
    console.log('Databaser tilgjengelig:', await client.db().admin().listDatabases());
    
    // Opprett unik indeks på email-feltet i users-collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Opprettet unik indeks på email i users-collection');

    // Opprett indeks på createdAt for bedre sortering
    await db.collection('users').createIndex({ createdAt: -1 });
    console.log('Opprettet indeks på createdAt i users-collection');

    // Andre nyttige indekser kan legges til her
    // For eksempel:
    // await db.collection('favorites').createIndex({ userId: 1, drawingId: 1 }, { unique: true });
    // await db.collection('drawings').createIndex({ categoryId: 1 });
    // await db.collection('colorings').createIndex({ userId: 1 });

    console.log('Alle indekser opprettet');
  } catch (error) {
    console.error('Feil ved oppretting av indekser:', error);
    if (error.code) {
      console.error('Feilkode:', error.code);
    }
    if (error.message) {
      console.error('Feilmelding:', error.message);
    }
  } finally {
    await client.close();
    console.log('Databasetilkobling lukket');
  }
}

createIndexes().catch(error => {
  console.error('Uventet feil:', error);
}); 