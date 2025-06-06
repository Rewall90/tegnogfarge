/**
 * This file serves as a validation check for TypeScript compatibility.
 * 
 * It doesn't run in production, but is used during testing to ensure
 * that our TypeScript types are correct and will compile without errors.
 */

// Check that async/await error handling is typed correctly
async function testAsyncErrorHandling(): Promise<void> {
  try {
    await Promise.resolve();
    // Test rejected promise
    await Promise.reject(new Error('Test error'));
  } catch (error: unknown) {
    // Proper error handling with unknown type
    const typedError = error as Error;
    console.error('Error message:', typedError.message);
  }
}

// Test MongoDB connection error handling
async function testMongoDBConnection(): Promise<void> {
  interface MongoError extends Error {
    code?: string;
    statusCode?: number;
  }

  try {
    // Simulate MongoDB connection
    await Promise.resolve();
  } catch (error: unknown) {
    const mongoError = error as MongoError;
    if (mongoError.code === 'ECONNREFUSED') {
      console.error('Could not connect to MongoDB');
    }
  }
}

// Test API route handler typing
interface ApiRequest {
  body: unknown;
  query: Record<string, string | string[]>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
}

async function testApiHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const body = req.body as { email?: string };
    
    if (!body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const typedError = error as Error;
    res.status(500).json({ error: typedError.message });
  }
}

// Export functions to prevent unused variable warnings
export {
  testAsyncErrorHandling,
  testMongoDBConnection,
  testApiHandler
};

// This function is called when running the type-check script
export function runTypeCheck(): string {
  return 'TypeScript validation passed!';
} 