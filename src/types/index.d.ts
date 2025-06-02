// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'user' | 'admin';
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: 'user' | 'admin';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'user' | 'admin';
  }
} 