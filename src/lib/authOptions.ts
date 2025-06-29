import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import clientPromise from '@/lib/db';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

type UserType = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'user' | 'admin';
};

const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isVerified: { label: 'Is Verified', type: 'text' }
      },
      async authorize(credentials): Promise<UserType | null> {
        if (!credentials?.email) {
          throw new Error('Email er påkrevd');
        }

        const client = await clientPromise;
        const db = client.db('fargeleggingsapp');
        const user = await db.collection('users').findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        // Check if this is an auto-login after email verification
        const isVerified = credentials.isVerified === 'true';
        const skipPasswordCheck = isVerified && user.emailVerified;

        if (!skipPasswordCheck) {
          if (!credentials.password) {
            throw new Error('Passord er påkrevd');
          }

          if (!user.emailVerified) {
            throw new Error('E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.');
          }

          if (!user.password) {
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || 'user'
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: UserType }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
      }
      return session;
    },
  },
};

export { authOptions }; 