import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (NextAuth as any).default ? (NextAuth as any).default(authOptions) : (NextAuth as any)(authOptions);
export { handler as GET, handler as POST }; 