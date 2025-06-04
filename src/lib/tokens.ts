import { v4 as uuidv4 } from 'uuid';
import clientPromise from './db';

// Interface for token-resultatet
interface VerificationToken {
  token: string;
  expiresAt: Date;
}

/**
 * Genererer en 6-sifret verifiseringskode
 */
function generateVerificationCode(): string {
  // Generer en 6-sifret kode med bare tall
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Oppretter en verifiseringstoken for e-postbekreftelse
 */
export async function createVerificationToken({ 
  email,
  expiresInHours = 24
}: { 
  email: string;
  expiresInHours?: number;
}): Promise<VerificationToken | null> {
  try {
    // Generer en 6-sifret kode i stedet for en UUID
    const token = generateVerificationCode();
    
    // Sett utløpstid
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    // Koble til databasen
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    // Slett eventuelle eksisterende tokens for denne e-posten
    await db.collection('verification_tokens').deleteMany({
      email,
      type: 'user_verification'
    });
    
    // Lagre token i databasen
    const result = await db.collection('verification_tokens').insertOne({
      email,
      token,
      type: 'user_verification',
      expiresAt,
      used: false,
      createdAt: new Date()
    });
    
    // Dobbeltsjekk at token er lagret
    const savedToken = await db.collection('verification_tokens').findOne({ 
      token, 
      email, 
      type: 'user_verification' 
    });
    
    if (!savedToken) {
      console.warn(`ADVARSEL: Token ikke funnet i databasen etter lagring!`);
    }
    
    return {
      token,
      expiresAt
    };
  } catch (error) {
    console.error('Feil ved oppretting av verifiseringskode:', error);
    return null;
  }
}

/**
 * Verifiserer en token og markerer den som brukt hvis gyldig
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; email?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    // Finn tokenet i databasen
    const tokenDoc = await db.collection('verification_tokens').findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return { valid: false };
    }
    
    // Marker token som brukt
    await db.collection('verification_tokens').updateOne(
      { _id: tokenDoc._id },
      { $set: { used: true, usedAt: new Date() } }
    );
    
    return { valid: true, email: tokenDoc.email };
  } catch (error) {
    console.error('Feil ved verifisering av token:', error);
    return { valid: false };
  }
} 