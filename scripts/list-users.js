const { MongoClient } = require('mongodb');
require('dotenv').config();

async function listUsers() {
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

    // List alle databaser
    const databasesList = await client.db().admin().listDatabases();
    console.log('Tilgjengelige databaser:');
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });

    // Sjekk hver database for users collection
    for (const dbInfo of databasesList.databases) {
      const dbName = dbInfo.name;
      if (['admin', 'local'].includes(dbName)) continue; // Hopp over systembaser
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      if (collections.some(col => col.name === 'users')) {
        console.log(`\nFant users collection i database: ${dbName}`);
        const users = await db.collection('users').find({}).toArray();
        
        console.log(`Antall brukere: ${users.length}`);
        if (users.length > 0) {
          users.forEach(user => {
            // Fjern passord fra utskriften for sikkerhet
            const { password, ...userWithoutPassword } = user;
            console.log('Bruker:', JSON.stringify(userWithoutPassword, null, 2));
          });
        }
      }
    }

  } catch (error) {
    console.error('Feil ved listing av brukere:', error);
  } finally {
    await client.close();
    console.log('Databasetilkobling lukket');
  }
}

listUsers().catch(error => {
  console.error('Uventet feil:', error);
}); 