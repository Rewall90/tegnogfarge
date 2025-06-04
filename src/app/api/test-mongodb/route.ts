import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET() {
  console.log('Testing MongoDB-tilkobling...');
  
  // Sjekk at miljøvariabler er satt
  console.log('MONGODB_URI er satt:', !!process.env.MONGODB_URI);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // Prøv å koble til MongoDB
    console.log('Forsøker å koble til MongoDB...');
    const client = await clientPromise;
    console.log('MongoDB-tilkobling opprettet!');
    
    // Test databasetilgang
    const db = client.db('fargeleggingsapp');
    console.log('Databasetilgang OK');
    
    // List samlinger
    const collections = await db.listCollections().toArray();
    console.log('Samlinger i databasen:', collections.map(c => c.name));
    
    // Sjekk users-samlingen
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('Antall brukere i databasen:', userCount);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB-tilkobling fungerer!',
      environment: process.env.NODE_ENV,
      collections: collections.map(c => c.name),
      userCount
    });
  } catch (error: any) {
    console.error('MongoDB-tilkoblingsfeil:', error);
    
    // Returner detaljert feilinformasjon
    return NextResponse.json({
      success: false,
      message: 'Kunne ikke koble til MongoDB',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      environment: process.env.NODE_ENV,
      mongodbUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'ikke satt'
    }, { status: 500 });
  }
} 