import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
// import clientPromise from '@/lib/db';

const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email og passord er påkrevd');
        }

        // const client = await clientPromise;
        // const db = client.db();
        // const user = await db.collection('users').findOne({ email: credentials.email });

        // if (!user || !user.password) {
        //   return null;
        // }
        // if (!(await compare(credentials.password, user.password))) {
        //   return null;
        // }
        // return {
        //   id: user._id,
        //   email: user.email,
        //   name: user.name,
        //   image: user.image,
        // };
        return null;
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export { authOptions }; 