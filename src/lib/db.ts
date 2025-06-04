import { MongoClient } from 'mongodb';

// Logg miljøvariabler (minus sensitive detaljer)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI er satt:', !!process.env.MONGODB_URI);

// Bruk uri fra begge miljøvariabler
let uri = process.env.MONGODB_URI || '';

// Ikke modifiser SRV URIs med directConnection
console.log('Bruker MongoDB URI:', uri.startsWith('mongodb+srv://') ? 'SRV connection' : 'Standard connection');

if (!uri) {
  console.error('MONGODB_URI er ikke definert i miljøvariablene. Sjekk .env.local filen.');
  // Ikke kast en feil her, da det vil bryte applikasjonen ved oppstart
}

// Forenklet oppsett av tilkoblingsalternativer for å unngå TLS-problemer
// Dette følger MongoDB Node.js driver 5.x anbefalinger
const options = {
  // Default-timeout er 30000 ms (30 sekunder)
  connectTimeoutMS: 30000,
  // Deaktiver SSL/TLS-validering i utviklingsmodus
  ...(process.env.NODE_ENV === 'development' ? {
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  } : {})
};

// Globalt klientobjekt
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Wrap klienten i en try-catch for å fange opp feil tidlig
try {
  if (process.env.NODE_ENV === 'development') {
    // I utvikling, bruk en global variabel for å bevare tilkoblingen
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      
      // Wrap tilkoblingen i en try-catch for bedre feilhåndtering
      globalWithMongo._mongoClientPromise = client.connect()
        .then(client => {
          console.log('MongoDB tilkobling opprettet i utviklingsmodus');
          return client;
        })
        .catch(err => {
          console.error('Kunne ikke koble til MongoDB i utviklingsmodus:', err);
          throw err;
        });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // I produksjon, opprett ny tilkobling
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
      .then(client => {
        console.log('MongoDB tilkobling opprettet i produksjonsmodus');
        return client;
      })
      .catch(err => {
        console.error('Kunne ikke koble til MongoDB i produksjonsmodus:', err);
        throw err;
      });
  }
} catch (err) {
  console.error('Feil ved oppretting av MongoDB-klient:', err);
  throw err;
}

// Legg til en timeout for clientPromise for å unngå at det henger i uendelig
const clientPromiseWithTimeout = new Promise<MongoClient>((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('MongoDB connection timed out after 30 seconds'));
  }, 30000);
  
  clientPromise
    .then((client) => {
      clearTimeout(timeout);
      resolve(client);
    })
    .catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
});

// Eksporter en funksjon som returnerer en klient med feilhåndtering
export default clientPromiseWithTimeout as Promise<MongoClient>;

// Hjelpefunksjon for å få tak i databaseinstansen
export async function getDb() {
  try {
    const client = await clientPromiseWithTimeout;
    return client.db('fargeleggingsapp');
  } catch (err) {
    console.error('Feil ved henting av database:', err);
    throw err;
  }
} 