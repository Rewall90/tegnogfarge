import { v4 as uuidv4 } from 'uuid';
import clientPromise from './db';

// Interface for token-resultatet
interface VerificationToken {
  token: string;
  expiresAt: Date;
}

/**
 * Oppretter en verifikasjonstoken for e-postbekreftelse
 */
export async function createVerificationToken({ 
  email,
  expiresInHours = 24
}: { 
  email: string;
  expiresInHours?: number;
}): Promise<VerificationToken | null> {
  try {
    console.log(`Oppretter verifikasjonstoken for ${email}`);
    
    // Generer en unik token
    const token = uuidv4();
    
    // Sett utløpstid
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    // Koble til databasen
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    // Lagre token i databasen
    await db.collection('verification_tokens').insertOne({
      email,
      token,
      type: 'user_verification',
      expiresAt,
      used: false,
      createdAt: new Date()
    });
    
    console.log(`Verifikasjonstoken opprettet for ${email}, utløper ${expiresAt}`);
    
    return {
      token,
      expiresAt
    };
  } catch (error) {
    console.error('Feil ved oppretting av verifikasjonstoken:', error);
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