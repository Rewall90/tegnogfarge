import { MongoClient, Collection, Document } from 'mongodb';

// Bruk uri fra begge miljøvariabler
let uri = process.env.MONGODB_URI || '';

if (!uri) {
  console.error('MONGODB_URI er ikke definert i miljøvariablene. Sjekk .env.local filen.');
  // Ikke kast en feil her, da det vil bryte applikasjonen ved oppstart
}

// Forenklet oppsett av tilkoblingsalternativer for å unngå TLS-problemer
// Dette følger MongoDB Node.js driver 5.x anbefalinger
const options = {
  // Økt timeout for å gi mer tid til tilkobling
  connectTimeoutMS: 60000, // 60 sekunder
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
          return client;
        })
        .catch(err => {
          console.error('Kunne ikke koble til MongoDB i utviklingsmodus:', err);
          console.error('Feilmelding:', err.message);
          console.error('Stack:', err.stack);
          throw err;
        });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // I produksjon, opprett ny tilkobling
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
      .then(client => {
        return client;
      })
      .catch(err => {
        console.error('Kunne ikke koble til MongoDB i produksjonsmodus:', err);
        console.error('Feilmelding:', err.message);
        console.error('Stack:', err.stack);
        throw err;
      });
  }
} catch (err: any) {
  console.error('Feil ved oppretting av MongoDB-klient:', err);
  console.error('Feilmelding:', err.message);
  console.error('Stack:', err.stack);
  throw err;
}

// Legg til en timeout for clientPromise for å unngå at det henger i uendelig
const clientPromiseWithTimeout = new Promise<MongoClient>((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('MongoDB connection timed out after 60 seconds'));
  }, 60000); // 60 sekunder
  
  clientPromise
    .then((client) => {
      clearTimeout(timeout);
      resolve(client);
    })
    .catch((err) => {
      clearTimeout(timeout);
      console.error('Feil i clientPromise:', err);
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

// Generisk funksjon for å kjøre operasjoner med retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 500,
  operationName = 'database operation'
): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`${operationName}: Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Increase delay for next attempt
      }
    }
  }
  console.error(`${operationName}: All ${maxRetries} attempts failed`);
  throw lastError;
}

// Spesifikk funksjon for brukeroperasjoner
export async function getUsersCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('users');
}

// Hjelpefunksjon for å finne og oppdatere en bruker med retries
export async function findAndUpdateUser(
  email: string, 
  update: any,
  options = { returnDocument: 'after' as const }
): Promise<Document | null> {
  return withRetry(async () => {
    const users = await getUsersCollection();
    
    // First check if the user exists
    const userExists = await users.findOne({ email });
    
    if (!userExists) {
      return null;
    }
    
    // Then update the user - using updateOne instead of findOneAndUpdate for better compatibility
    const updateResult = await users.updateOne(
      { email },
      update
    );
    
    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      throw new Error(`Failed to update user: ${email}`);
    }
    
    // Fetch the updated user to return
    const updatedUser = await users.findOne({ email });
    if (!updatedUser) {
      throw new Error(`Failed to fetch updated user: ${email}`);
    }
    
    return updatedUser;
  }, 3, 500, `findAndUpdateUser(${email})`);
}

// Hjelpefunksjon for å finne en bruker med retries
export async function findUserByEmail(email: string): Promise<Document | null> {
  return withRetry(async () => {
    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    return user;
  }, 3, 500, `findUserByEmail(${email})`);
} 