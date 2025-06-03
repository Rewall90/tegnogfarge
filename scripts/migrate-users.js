const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI er ikke definert i miljøvariablene');
    process.exit(1);
  }

  // Konfigurer MongoClient med SSL-alternativer
  const options = {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true
  };

  const client = new MongoClient(uri, options);

  try {
    console.log('Kobler til MongoDB...');
    await client.connect();
    console.log('Tilkoblet MongoDB');

    // Hent brukere fra test-databasen
    const testDb = client.db('test');
    const users = await testDb.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('Ingen brukere funnet i test-databasen.');
      return;
    }

    console.log(`Fant ${users.length} bruker(e) i test-databasen.`);
    
    // Opprett eller koble til den nye databasen
    const targetDb = client.db('fargeleggingsapp');
    
    // Sjekk om users-collection eksisterer i måldatabasen
    const collections = await targetDb.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('Oppretter users-collection i fargeleggingsapp-databasen...');
      await targetDb.createCollection('users');
      
      // Oppretter indekser
      await targetDb.collection('users').createIndex({ email: 1 }, { unique: true });
      await targetDb.collection('users').createIndex({ createdAt: -1 });
      console.log('Indekser opprettet på users-collection');
    }
    
    // Kopier brukere til den nye databasen
    console.log('Migrerer brukere til fargeleggingsapp-databasen...');
    
    for (const user of users) {
      // Sjekk om brukeren allerede eksisterer
      const existingUser = await targetDb.collection('users').findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`Bruker med e-post ${user.email} eksisterer allerede i måldatabasen.`);
        continue;
      }
      
      // Sett inn brukeren i den nye databasen
      const result = await targetDb.collection('users').insertOne(user);
      console.log(`Migrert bruker: ${user.name} (${user.email})`);
    }
    
    console.log('Migrering fullført!');
    
    // Verifiser at migreringen var vellykket
    const migratedUsers = await targetDb.collection('users').find({}).toArray();
    console.log(`Antall brukere i fargeleggingsapp-databasen: ${migratedUsers.length}`);
    
  } catch (error) {
    console.error('Feil under migrering:', error);
  } finally {
    await client.close();
    console.log('Databasetilkobling lukket');
  }
}

migrateUsers().catch(error => {
  console.error('Uventet feil:', error);
}); 